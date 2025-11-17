import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    if (file.fieldname === 'resume') {
      uploadPath = path.join(__dirname, '../uploads/resumes');
      ensureDirectoryExists(uploadPath);
    } else if (file.fieldname === 'companyDocs') {
      uploadPath = path.join(__dirname, '../uploads/documents');
      ensureDirectoryExists(uploadPath);
    } else if (file.fieldname === 'profilePhoto') {
      uploadPath = path.join(__dirname, '../uploads/profile_photos');
      ensureDirectoryExists(uploadPath);
    } else {
      uploadPath = path.join(__dirname, '../uploads');
      ensureDirectoryExists(uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = req.user?._id || 'anonymous';
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${userId}-${random}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Resume must be a PDF file'), false);
    }
  } else if (file.fieldname === 'companyDocs') {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Company documents must be PDF, JPG, or PNG'), false);
    }
  } else if (file.fieldname === 'profilePhoto') {
    if (file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Profile photo must be JPG or PNG'), false);
    }
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

