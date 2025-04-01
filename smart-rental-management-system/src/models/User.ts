import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Tenant' | 'Landlord' | 'Admin';
  profilePicture?: string;
  phone?: string;
  googleAuthId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // Encrypted
    role: { type: String, enum: ['Tenant', 'Landlord', 'Admin'], required: true },
    profilePicture: { type: String },
    phone: { type: String, trim: true },
    googleAuthId: { type: String }, // For Google authentication
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = new Date();
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
    console.log('Comparing passwords:');
    console.log('Stored hash:', this.password);
    console.log('Candidate password:', candidatePassword);
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('Bcrypt comparison result:', result);
    return result;
};

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export { UserSchema };
export default User;