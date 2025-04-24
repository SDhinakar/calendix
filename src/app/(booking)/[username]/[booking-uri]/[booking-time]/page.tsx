'use client';
import axios from "axios";
import {format} from "date-fns";
import {FormEvent, useState} from "react";

type PageProps = {
  params: {
    username: string;
    "booking-uri": string;
    "booking-time": string;
  };
};

export default function BookingFormPage(props: PageProps) {
  const [guestName, setGuestName] = useState('');
  const [guestEmails, setGuestEmails] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const username = props.params.username;
  const bookingUri = props.params["booking-uri"];
  const bookingTime = new Date(decodeURIComponent(props.params["booking-time"]));

  const handleFormSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Basic validation
      if (!guestName.trim()) {
        throw new Error('Name is required');
      }
      if (!guestEmails.trim()) {
        throw new Error('At least one email is required');
      }

      const response = await axios.post('/api/bookings', {
        guestName,
        guestEmails: guestEmails,
        guestNotes,
        username,
        bookingUri,
        bookingTime: bookingTime.toISOString()
      });

      if (response.data.success) {
        setConfirmed(true);
      } else {
        setError(response.data.error || 'Booking failed');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message || 'An error occurred');
      } else {
        setError((err as Error).message || 'An error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-left p-8 w-[400px]">
      <h2 className="text-2xl text-gray-500 font-bold mb-4 pb-2 border-b border-black/10">
        {format(bookingTime, 'EEEE, MMMM d, HH:mm')}
      </h2>
      
      {confirmed ? (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          Thanks for your booking! All guests have been notified.
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              type="text"
              placeholder="John Doe"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guest Emails (comma separated)
            </label>
            <textarea
              value={guestEmails}
              onChange={(e) => setGuestEmails(e.target.value)}
              placeholder="test1@example.com, test2@example.com"
              className="w-full p-2 border rounded"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (optional)
            </label>
            <textarea
              value={guestNotes}
              onChange={(e) => setGuestNotes(e.target.value)}
              placeholder="Any relevant information"
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>
          
          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 rounded text-white ${isSubmitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}