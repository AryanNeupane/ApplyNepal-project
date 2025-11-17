import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user.resume) {
      return res.status(400).json({ message: 'Please upload your resume before applying' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: 'This job is no longer active' });
    }

    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      applicant: userId,
      resume: user.resume // This is already the path stored in user model
    });

    await Job.findByIdAndUpdate(jobId, {
      $push: { applications: application._id }
    });

    // Create notification for recruiter
    await Notification.create({
      recipient: job.postedBy,
      recipientModel: 'Recruiter',
      type: 'application_submitted',
      title: 'New Application Received',
      message: `${user.fullName} has applied for the position: ${job.title}`,
      relatedJob: jobId,
      relatedApplication: application._id
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'fullName email phone skills experience profilePhoto resume')
      .sort({ appliedAt: -1 });
    
    // Ensure resume paths are accessible
    const applicationsWithResumes = applications.map(app => {
      const appObj = app.toObject ? app.toObject() : app;
      if (appObj.applicant && appObj.applicant.resume) {
        // Ensure resume path is correct
        if (!appObj.applicant.resume.startsWith('http') && !appObj.applicant.resume.startsWith('/')) {
          appObj.applicant.resume = appObj.applicant.resume.startsWith('uploads/') 
            ? appObj.applicant.resume 
            : `uploads/resumes/${appObj.applicant.resume}`;
        }
      }
      return appObj;
    });

    res.json(applicationsWithResumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(applicationId)
      .populate('job applicant');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    if (notes !== undefined) {
      application.notes = notes;
    }
    await application.save();

    // Create notification for applicant (only for accepted/rejected)
    if (status === 'accepted' || status === 'rejected') {
      const notificationType = status === 'accepted' ? 'application_accepted' : 'application_rejected';
      const notificationTitle = status === 'accepted' ? 'Application Accepted' : 'Application Rejected';
      const notificationMessage = status === 'accepted' 
        ? `Congratulations! Your application for ${application.job.title} has been accepted.`
        : `Your application for ${application.job.title} has been rejected.`;

      await Notification.create({
        recipient: application.applicant._id,
        recipientModel: 'User',
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        relatedJob: application.job._id,
        relatedApplication: application._id
      });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title companyName location jobType salaryRange deadline')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
