import mongoose, { model, models, Schema } from "mongoose";

interface IProfile extends mongoose.Document {
  email: string;
  username?: string;
  grantId: string;
}

const ProfileSchema = new Schema<IProfile>({
  email: { type: String, required: true, unique: true },
  username: { type: String }, // removed 'unique' to avoid duplicate nulls
  grantId: { type: String },
});

export const ProfileModel = models?.Profile || model<IProfile>('Profile', ProfileSchema);
