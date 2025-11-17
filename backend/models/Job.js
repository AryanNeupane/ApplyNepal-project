import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  skillsRequired: [{
    type: String,
    trim: true
  }],
  salaryRange: {
    min: {
      type: Number,
      required: [true, 'Minimum salary is required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum salary is required']
    }
  },
  experienceRequired: {
    type: String,
    required: [true, 'Experience required is needed'],
    enum: ['0-1 years', '1-3 years', '3-5 years', '5+ years', 'Any']
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['Full-time', 'Part-time', 'Internship']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['IT', 'Finance', 'Banking', 'Sales', 'Marketing', 'Construction', 'Healthcare', 'Education', 'Other']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }]
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

export default Job;

