import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Recruiter from '../models/Recruiter.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import CompanyVerification from '../models/CompanyVerification.js';
import Notification from '../models/Notification.js';

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.user._id).select('+password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (email && email !== admin.email) {
      const existing = await Admin.findOne({ email });
      if (existing && existing._id.toString() !== admin._id.toString()) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      admin.email = email.toLowerCase().trim();
    }

    if (name !== undefined) {
      admin.name = name;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }

      const isMatch = await admin.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      if (newPassword.length < 8 || !/^(?=.*[A-Z])(?=.*[0-9])/.test(newPassword)) {
        return res.status(400).json({
          message: 'New password must be at least 8 characters and include at least one uppercase letter and one number'
        });
      }

      admin.password = newPassword; // will be hashed by pre-save hook
    }

    await admin.save();

    const updated = await Admin.findById(admin._id).select('-password');
    res.json({ message: 'Profile updated successfully', admin: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecruiters = await Recruiter.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const pendingVerifications = await CompanyVerification.countDocuments({ status: 'pending' });
    const activeJobs = await Job.countDocuments({ isActive: true });

    res.json({
      totalUsers,
      totalRecruiters,
      totalJobs,
      totalApplications,
      pendingVerifications,
      activeJobs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find().select('-password').sort({ createdAt: -1 });
    res.json(recruiters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'fullName companyName')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title companyName')
      .populate('applicant', 'fullName email')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingVerifications = async (req, res) => {
  try {
    const verifications = await CompanyVerification.find({ status: 'pending' })
      .populate('recruiter', 'fullName email companyName phone companyDescription companyAddress companyWebsite')
      .sort({ createdAt: -1 });
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllVerifications = async (req, res) => {
  try {
    const verifications = await CompanyVerification.find()
      .populate('recruiter', 'fullName email companyName phone companyDescription companyAddress companyWebsite')
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 });
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVerificationById = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const verification = await CompanyVerification.findById(verificationId)
      .populate('recruiter', 'fullName email companyName phone companyDescription companyAddress companyWebsite verificationDocuments')
      .populate('reviewedBy', 'email');
    
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }
    
    res.json(verification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecruiterDocuments = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    
    const recruiter = await Recruiter.findById(recruiterId).select('verificationDocuments companyName');
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const verification = await CompanyVerification.findOne({ recruiter: recruiterId });
    
    const documents = verification?.documents || recruiter.verificationDocuments || [];
    
    const documentsWithUrls = documents.map(doc => ({
      ...doc,
      url: `http://localhost:5000/${doc.path}`,
      downloadUrl: `http://localhost:5000/${doc.path}`
    }));

    res.json({
      recruiter: {
        _id: recruiter._id,
        companyName: recruiter.companyName
      },
      documents: documentsWithUrls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveCompany = async (req, res) => {
  try {
    const { verificationId } = req.params;

    const verification = await CompanyVerification.findById(verificationId)
      .populate('recruiter');

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    verification.status = 'approved';
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    await verification.save();

    const recruiter = await Recruiter.findById(verification.recruiter._id);
    recruiter.verificationStatus = 'verified';
    await recruiter.save();

    // Create notification
    await Notification.create({
      recipient: recruiter._id,
      recipientModel: 'Recruiter',
      type: 'company_verified',
      title: 'Company Verified',
      message: `Your company ${recruiter.companyName} has been verified. You can now post jobs.`
    });

    res.json({ message: 'Company approved successfully', verification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectCompany = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { rejectionReason } = req.body;

    const verification = await CompanyVerification.findById(verificationId)
      .populate('recruiter');

    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    verification.status = 'rejected';
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    verification.rejectionReason = rejectionReason || 'Documents did not meet requirements';
    await verification.save();

    const recruiter = await Recruiter.findById(verification.recruiter._id);
    recruiter.verificationStatus = 'rejected';
    await recruiter.save();

    // Create notification
    await Notification.create({
      recipient: recruiter._id,
      recipientModel: 'Recruiter',
      type: 'company_rejected',
      title: 'Company Verification Rejected',
      message: `Your company verification has been rejected. Reason: ${verification.rejectionReason}`
    });

    res.json({ message: 'Company rejected successfully', verification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const activateDeactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const activateDeactivateRecruiter = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const { isActive } = req.body;

    const recruiter = await Recruiter.findByIdAndUpdate(
      recruiterId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.json({ message: `Recruiter ${isActive ? 'activated' : 'deactivated'} successfully`, recruiter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRecruiter = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const { fullName, companyName, phone, isActive, verificationStatus } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (companyName) updateData.companyName = companyName;
    if (phone) {
      if (!/^(98|97)[0-9]{8}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      updateData.phone = phone;
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    if (verificationStatus && ['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      updateData.verificationStatus = verificationStatus;
    }

    const recruiter = await Recruiter.findByIdAndUpdate(
      recruiterId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.json({ message: 'Recruiter updated successfully', recruiter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await Job.findByIdAndDelete(jobId);
    await Application.deleteMany({ job: jobId });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, phone, isActive } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) {
      if (!/^(98|97)[0-9]{8}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      updateData.phone = phone;
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's applications
    await Application.deleteMany({ applicant: userId });
    
    // Remove user from saved jobs
    await Job.updateMany(
      { _id: { $in: user.savedJobs || [] } },
      { $pull: { savedBy: userId } }
    );

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRecruiter = async (req, res) => {
  try {
    const { recruiterId } = req.params;

    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    // Delete recruiter's jobs and related applications
    const jobs = await Job.find({ postedBy: recruiterId });
    const jobIds = jobs.map(job => job._id);

    await Application.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ postedBy: recruiterId });

    // Delete company verification record
    await CompanyVerification.deleteOne({ recruiter: recruiterId });

    // Finally delete recruiter
    await Recruiter.findByIdAndDelete(recruiterId);

    res.json({ message: 'Recruiter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
