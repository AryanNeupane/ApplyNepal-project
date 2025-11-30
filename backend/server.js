import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Routes
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting (disabled in development)
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/documents', express.static(path.join(__dirname, 'uploads/documents')));
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads/resumes')));
app.use('/uploads/profile_photos', express.static(path.join(__dirname, 'uploads/profile_photos')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Set default values for environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  process.env.JWT_SECRET = 'your_super_secret_jwt_key_change_in_production';
  console.warn('Warning: Using default JWT_SECRET. Please set JWT_SECRET in .env file for production!');
}
if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.trim() === '') {
  process.env.JWT_REFRESH_SECRET = 'your_super_secret_refresh_key_change_in_production';
  console.warn('Warning: Using default JWT_REFRESH_SECRET. Please set JWT_REFRESH_SECRET in .env file for production!');
}
if (!process.env.JWT_EXPIRE || process.env.JWT_EXPIRE.trim() === '') {
  process.env.JWT_EXPIRE = '7d';
}
if (!process.env.JWT_REFRESH_EXPIRE || process.env.JWT_REFRESH_EXPIRE.trim() === '') {
  process.env.JWT_REFRESH_EXPIRE = '30d';
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

