import express from 'express';
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  uploadVerificationDocuments,
  getRecruiterJobs,
  deleteAccount
} from '../controllers/recruiterController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/profile', protect, authorize('recruiter'), getRecruiterProfile);
router.put('/profile', protect, authorize('recruiter'), updateRecruiterProfile);
router.post('/upload-documents', protect, authorize('recruiter'), upload.array('companyDocs', 5), uploadVerificationDocuments);
router.get('/jobs', protect, authorize('recruiter'), getRecruiterJobs);
router.delete('/account', protect, authorize('recruiter'), deleteAccount);

export default router;

