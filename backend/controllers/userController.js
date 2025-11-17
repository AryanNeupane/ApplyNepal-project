import User from '../models/User.js';
import Job from '../models/Job.js';
import path from 'path';
import fs from 'fs';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { experience, phone } = req.body;
    let skills = req.body.skills;

    // Handle skills from FormData (can be array or single value)
    if (skills) {
      if (Array.isArray(skills)) {
        skills = skills;
      } else if (typeof skills === 'string') {
        skills = skills.split(',').map(s => s.trim()).filter(s => s);
      } else {
        skills = [];
      }
    }

    const updateData = {};
    if (skills && skills.length > 0) updateData.skills = skills;
    if (experience) updateData.experience = experience;
    if (phone) {
      if (!/^(98|97)[0-9]{8}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      updateData.phone = phone;
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePhoto && req.files.profilePhoto[0]) {
        // Delete old photo if exists
        const user = await User.findById(req.user._id);
        if (user.profilePhoto) {
          const oldPhotoPath = path.join(process.cwd(), user.profilePhoto);
          if (fs.existsSync(oldPhotoPath)) {
            try {
              fs.unlinkSync(oldPhotoPath);
            } catch (err) {
              console.error('Error deleting old photo:', err);
            }
          }
        }
        updateData.profilePhoto = `uploads/profile_photos/${req.files.profilePhoto[0].filename}`;
      }
      if (req.files.resume && req.files.resume[0]) {
        // Delete old resume if exists
        const user = await User.findById(req.user._id);
        if (user.resume) {
          const oldResumePath = path.join(process.cwd(), user.resume);
          if (fs.existsSync(oldResumePath)) {
            try {
              fs.unlinkSync(oldResumePath);
            } catch (err) {
              console.error('Error deleting old resume:', err);
            }
          }
        }
        updateData.resume = `uploads/resumes/${req.files.resume[0].filename}`;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const user = await User.findById(req.user._id);
    
    if (user.savedJobs.includes(jobId)) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    user.savedJobs.push(jobId);
    await user.save();

    res.json({ message: 'Job saved successfully', savedJobs: user.savedJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const user = await User.findById(req.user._id);
    user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    await user.save();

    res.json({ message: 'Job unsaved successfully', savedJobs: user.savedJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedJobs',
        populate: {
          path: 'postedBy',
          select: 'fullName companyName'
        }
      });

    res.json(user.savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Delete user's applications
    await Application.deleteMany({ applicant: req.user._id });
    
    // Remove user from saved jobs
    await Job.updateMany(
      { _id: { $in: user.savedJobs } },
      { $pull: { savedBy: req.user._id } }
    );
    
    // Delete user
    await User.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

