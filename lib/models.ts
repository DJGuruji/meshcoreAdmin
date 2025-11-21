import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// User Schema - Mirroring the frontend schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password should be at least 6 characters'],
    select: false, // Don't include password in query results by default
  },
  // Role field with default value
  role: {
    type: String,
    enum: ['user', 'staff', 'admin', 'super-admin'],
    default: 'user',
    required: true
  },
  // Account type field with default value
  accountType: {
    type: String,
    enum: ['free', 'freemium', 'pro', 'ultra-pro'],
    default: 'free',
    required: true
  },
  // Block state field
  blocked: {
    type: Boolean,
    default: false,
    required: true
  },
  resetToken: {
    type: String,
    select: false, // Don't include in query results by default
  },
  resetTokenExpiry: {
    type: Date,
    select: false, // Don't include in query results by default
  },
  // Email verification fields
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationTokenExpiry: {
    type: Date,
    select: false
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to check if password matches
UserSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);