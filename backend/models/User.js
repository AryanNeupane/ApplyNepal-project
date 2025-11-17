import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    match: [/^[A-Za-z\s]{3,}$/, 'Full name must be at least 3 characters and contain only letters and spaces']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^(98|97)[0-9]{8}$/, 'Phone number must be a valid Nepal number starting with 98 or 97']
  },
  role: {
    type: String,
    enum: ['jobseeker'],
    default: 'jobseeker'
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    default: ''
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  resume: {
    type: String,
    default: ''
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

