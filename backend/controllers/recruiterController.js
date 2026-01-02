import Recruiter from '../models/Recruiter.js';
import CompanyVerification from '../models/CompanyVerification.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import path from 'path';
import fs from 'fs';

export const getRecruiterProfile = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id)
      .select('-password');

    res.json(recruiter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRecruiterProfile = async (req, res) => {
  try {
    const { companyName, companyDescription, companyAddress, companyWebsite, phone } = req.body;

    const updateData = {};
    if (companyName) updateData.companyName = companyName;
    if (companyDescription) updateData.companyDescription = companyDescription;
    if (companyAddress) updateData.companyAddress = companyAddress;
    if (companyWebsite) updateData.companyWebsite = companyWebsite;
    if (phone) {
      if (!/^(98|97)[0-9]{8}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      updateData.phone = phone;
    }

    const recruiter = await Recruiter.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(recruiter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadVerificationDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one document' });
    }

    const documents = req.files.map(file => ({
      filename: file.originalname,
      path: `uploads/documents/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));

    const recruiter = await Recruiter.findById(req.user._id);
    
    // Delete old documents if any
    if (recruiter.verificationDocuments && recruiter.verificationDocuments.length > 0) {
      recruiter.verificationDocuments.forEach(doc => {
        const docPath = path.join(process.cwd(), doc.path);
        if (fs.existsSync(docPath)) {
          try {
            fs.unlinkSync(docPath);
          } catch (err) {
            console.error('Error deleting old document:', err);
          }
        }
      });
    }

    recruiter.verificationDocuments = documents;
    recruiter.verificationStatus = 'pending';
    await recruiter.save();

    // Update or create CompanyVerification record
    let verification = await CompanyVerification.findOne({ recruiter: req.user._id });
    if (verification) {
      // Delete old documents
      if (verification.documents && verification.documents.length > 0) {
        verification.documents.forEach(doc => {
          const docPath = path.join(process.cwd(), doc.path);
          if (fs.existsSync(docPath)) {
            try {
              fs.unlinkSync(docPath);
            } catch (err) {
              console.error('Error deleting old document:', err);
            }
          }
        });
      }
      verification.documents = documents;
      verification.status = 'pending';
      await verification.save();
    } else {
      verification = await CompanyVerification.create({
        recruiter: req.user._id,
        documents: documents,
        status: 'pending'
      });
    }

    res.json({ message: 'Documents uploaded successfully', verification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecruiterJobs = async (req, res) => {
  try {
    const now = new Date();
    const expiredJobs = await Job.find({ postedBy: req.user._id, deadline: { $lt: now } }).select('_id');

    if (expiredJobs.length) {
      const expiredJobIds = expiredJobs.map(job => job._id);
      await Application.deleteMany({ job: { $in: expiredJobIds } });
      await Notification.deleteMany({ relatedJob: { $in: expiredJobIds } });
      await Job.deleteMany({ _id: { $in: expiredJobIds } });
    }

    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('applications')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id);
    
    // Delete recruiter's jobs and applications
    const jobs = await Job.find({ postedBy: req.user._id });
    const jobIds = jobs.map(job => job._id);
    
    await Application.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ postedBy: req.user._id });
    
    // Delete company verification
    await CompanyVerification.deleteOne({ recruiter: req.user._id });
    
    // Delete verification documents
    if (recruiter.verificationDocuments && recruiter.verificationDocuments.length > 0) {
      recruiter.verificationDocuments.forEach(doc => {
        const docPath = path.join(process.cwd(), doc.path);
        if (fs.existsSync(docPath)) {
          fs.unlinkSync(docPath);
        }
      });
    }
    
    // Delete recruiter
    await Recruiter.findByIdAndDelete(req.user._id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

