import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  empId: string;
  firstName: string;
  lastName: string;
  isEligibleForLunch: boolean;
  status?: string; // e.g., "Yes" or "No"
}

const UserSchema: Schema = new Schema({
  empId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isEligibleForLunch: { type: Boolean, default: false },
  status: { type: String, default: 'No' }
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;