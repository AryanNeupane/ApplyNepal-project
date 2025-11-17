import express from 'express';
import { registerJobSeeker, registerRecruiter, login, logout, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate, signupValidation, loginValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/register/jobseeker', validate(signupValidation), registerJobSeeker);
router.post('/register/recruiter', validate(signupValidation), registerRecruiter);
router.post('/login', validate(loginValidation), login);
router.post('/logout', protect, logout);
router.put('/change-password', protect, changePassword);

export default router;

