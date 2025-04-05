import { nylas, nylasConfig } from "@/libs/nylas";
import { session } from "@/libs/session";
import { ProfileModel } from "@/models/Profile";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log("Received callback from Nylas");

  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const url = new URL(req.url || "");
  const code = url.searchParams.get("code");

  if (!code) {
    return Response.json("No authorization code returned from Nylas", { status: 400 });
  }

  try {
    const codeExchangePayload = {
      clientSecret: nylasConfig.apiKey,
      clientId: nylasConfig.clientId as string,
      redirectUri: nylasConfig.callbackUri,
      code,
    };

    const response = await nylas.auth.exchangeCodeForToken(codeExchangePayload);
    const { grantId, email } = response;

    await mongoose.connect(process.env.MONGODB_URI as string);

    let profileDoc = await ProfileModel.findOne({ email });

    if (profileDoc) {
      profileDoc.grantId = grantId;
      await profileDoc.save();
    } else {
      const generatedUsername = email.split("@")[0] + "_" + Date.now();
      profileDoc = await ProfileModel.create({
        email,
        grantId,
        username: generatedUsername,
      });
    }

    await session().set("email", email);

    return NextResponse.redirect(`${baseUrl}/`);
  } catch (error) {
    console.error("Error in OAuth exchange:", error);
    return Response.json({ error: "OAuth Exchange Failed" }, { status: 500 });
  }
}
