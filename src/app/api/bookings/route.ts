import {nylas} from "@/libs/nylas";
import {BookingModel} from "@/models/Booking";
import {EventTypeModel} from "@/models/EventType";
import {ProfileModel} from "@/models/Profile";
import {addMinutes} from "date-fns";
import mongoose from "mongoose";
import {NextRequest} from "next/server";

type JsonData = {
  guestName: string;
  guestEmails: string; // Comma-separated emails
  guestNotes: string;
  username: string;
  bookingUri: string;
  bookingTime: string;
};

export async function POST(req: NextRequest) {
  try {
    const data: JsonData = await req.json();
    const {guestName, guestEmails, guestNotes, username, bookingUri, bookingTime} = data;
    
    await mongoose.connect(process.env.MONGODB_URI as string);
    
    // Validate profile and event type
    const profileDoc = await ProfileModel.findOne({username});
    if (!profileDoc) {
      return Response.json({error: 'Invalid booking URL'}, {status: 404});
    }
    
    const etDoc = await EventTypeModel.findOne({
      email: profileDoc.email,
      uri: bookingUri,
    });
    if (!etDoc) {
      return Response.json({error: 'Invalid booking URL'}, {status: 404});
    }

    // Process emails
    const emails = guestEmails.split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    // Validate we have at least one email
    if (emails.length === 0) {
      return Response.json({error: 'At least one email is required'}, {status: 400});
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return Response.json({error: `Invalid email format: ${email}`}, {status: 400});
      }
    }

    // Create bookings for each email
    const bookingPromises = emails.map(email => 
      BookingModel.create({
        guestName,
        guestEmail: email,
        guestNotes,
        when: bookingTime,
        eventTypeId: etDoc._id,
      })
    );
    await Promise.all(bookingPromises);

    // Create calendar event with all emails
    const startDate = new Date(bookingTime);
    await nylas.events.create({
      identifier: profileDoc.grantId,
      requestBody: {
        title: etDoc.title,
        description: etDoc.description,
        when: {
          startTime: Math.round(startDate.getTime() / 1000),
          endTime: Math.round(addMinutes(startDate, etDoc.length).getTime() / 1000),
        },
        conferencing: {
          autocreate: {},
          provider: 'Google Meet',
        },
        participants: emails.map(email => ({
          name: guestName,
          email: email,
          status: 'yes',
        })),
      },
      queryParams: {
        calendarId: etDoc.email,
      },
    });

    return Response.json({
      success: true,
      message: `Booking confirmed for ${emails.length} guest(s)`
    }, {status: 201});
  } catch (error) {
    console.error('Booking error:', error);
    return Response.json(
      {error: 'An error occurred while processing your booking'},
      {status: 500}
    );
  }
}