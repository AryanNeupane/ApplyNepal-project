import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  saveJob,
  unsaveJob,
  getSavedJobs,
  deleteAccount
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/profile', protect, authorize('jobseeker'), getUserProfile);
router.put('/profile', protect, authorize('jobseeker'), upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), updateUserProfile);
router.post('/save-job', protect, authorize('jobseeker'), saveJob);
router.delete('/unsave-job/:jobId', protect, authorize('jobseeker'), unsaveJob);
router.get('/saved-jobs', protect, authorize('jobseeker'), getSavedJobs);
router.delete('/account', protect, authorize('jobseeker'), deleteAccount);

export default router;

