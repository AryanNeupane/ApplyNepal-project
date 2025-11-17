import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAllRecruiters,
  getAllJobs,
  getAllApplications,
  getPendingVerifications,
  getAllVerifications,
  getVerificationById,
  getRecruiterDocuments,
  approveCompany,
  rejectCompany,
  activateDeactivateUser,
  updateUser,
  deleteUser,
  activateDeactivateRecruiter,
  deleteJob
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/recruiters', getAllRecruiters);
router.get('/jobs', getAllJobs);
router.get('/applications', getAllApplications);
router.get('/verifications/pending', getPendingVerifications);
router.get('/verifications', getAllVerifications);
router.get('/verifications/:verificationId', getVerificationById);
router.get('/recruiters/:recruiterId/documents', getRecruiterDocuments);
router.put('/verifications/:verificationId/approve', approveCompany);
router.put('/verifications/:verificationId/reject', rejectCompany);
router.put('/users/:userId/status', activateDeactivateUser);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.put('/recruiters/:recruiterId/status', activateDeactivateRecruiter);
router.delete('/jobs/:jobId', deleteJob);

export default router;

