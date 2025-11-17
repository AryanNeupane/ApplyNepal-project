import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Recruiter from '../models/Recruiter.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getAllJobs = async (req, res) => {
  try {
    const {
      category,
      skills,
      minSalary,
      maxSalary,
      location,
      experience,
      jobType,
      search
    } = req.query;

    // Allow admin to see all jobs, others see only active
    let query = {};
    if (req.user?.role !== 'admin') {
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (experience) {
      query.experienceRequired = experience;
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (minSalary) {
      query['salaryRange.min'] = { $gte: parseInt(minSalary) };
    }

    if (maxSalary) {
      query['salaryRange.max'] = { $lte: parseInt(maxSalary) };
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skillsRequired = { $in: skillsArray };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'fullName companyName')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'fullName companyName companyDescription companyAddress companyWebsite');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id);

    if (recruiter.verificationStatus !== 'verified') {
      return res.status(403).json({ message: 'Company must be verified to post jobs' });
    }

    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
      companyName: recruiter.companyName
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.skills || user.skills.length === 0) {
      return res.json([]);
    }

    const jobs = await Job.find({
      isActive: true,
      skillsRequired: { $in: user.skills }
    })
      .populate('postedBy', 'fullName companyName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

