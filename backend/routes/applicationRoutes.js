import express from 'express';
import {
  applyForJob,
  getApplicationsByJob,
  updateApplicationStatus,
  getUserApplications
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', protect, authorize('jobseeker'), applyForJob);
router.get('/my-applications', protect, authorize('jobseeker'), getUserApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getApplicationsByJob);
router.put('/:applicationId/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

export default router;

