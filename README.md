# ApplyNepal - Job Portal

A complete MERN stack job portal application designed for the Nepali job market.

## Features

### For Job Seekers
- Sign up and create profile
- Upload resume (PDF only)
- Browse and search jobs
- Apply for jobs
- Save favorite jobs
- View recommended jobs based on skills
- Receive notifications for application status
- Update profile with skills and experience

### For Recruiters
- Sign up and create company profile
- Upload company verification documents
- Post jobs (after verification)
- View and manage applications
- Update application status (accept/reject)
- Receive notifications for new applications

### For Admins
- Approve/reject company verifications
- Activate/deactivate users and recruiters
- View all jobs, applications, and users
- Manage the entire system
- View dashboard statistics

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Express Validator
- Bcrypt for password hashing
- Helmet for security
- Rate limiting

### Frontend
- React
- React Router
- Axios
- TailwindCSS
- React Icons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Or manually create `backend/.env` with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/applynepal
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
NODE_ENV=development
```

**Note:** If you don't create a `.env` file, the application will use default values, but it's recommended to create one for proper configuration.

4. Start MongoDB (if running locally)

5. Seed the database:
```bash
npm run seed
```

6. Start the server:
```bash
npm start
# or for development
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## Default Admin Credentials

- Email: `admin@applynepal.com`
- Password: `admin123`

## Seed Data

The seed script creates:
- 1 Admin account
- 5 Job Seeker accounts (all with password: `Password123`)
- 3 Recruiter accounts (2 verified, 1 pending)
- 10 Job postings across various categories

## API Endpoints

### Authentication
- `POST /api/auth/register/jobseeker` - Register as job seeker
- `POST /api/auth/register/recruiter` - Register as recruiter
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/change-password` - Change password

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `GET /api/jobs/recommended` - Get recommended jobs (job seeker only)
- `POST /api/jobs` - Create job (recruiter only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications/apply` - Apply for a job
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get applications for a job
- `PUT /api/applications/:id/status` - Update application status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/save-job` - Save a job
- `DELETE /api/users/unsave-job/:id` - Unsave a job
- `GET /api/users/saved-jobs` - Get saved jobs

### Recruiters
- `GET /api/recruiters/profile` - Get recruiter profile
- `PUT /api/recruiters/profile` - Update recruiter profile
- `POST /api/recruiters/upload-documents` - Upload verification documents
- `GET /api/recruiters/jobs` - Get recruiter's jobs

### Admin
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/recruiters` - Get all recruiters
- `GET /api/admin/jobs` - Get all jobs
- `GET /api/admin/applications` - Get all applications
- `GET /api/admin/verifications/pending` - Get pending verifications
- `PUT /api/admin/verifications/:id/approve` - Approve company
- `PUT /api/admin/verifications/:id/reject` - Reject company
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `PUT /api/admin/recruiters/:id/status` - Activate/deactivate recruiter
- `DELETE /api/admin/jobs/:id` - Delete job

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread/count` - Get unread count

## File Uploads

- Resumes: `/uploads/resumes/` (PDF only)
- Company Documents: `/uploads/company_docs/` (PDF, JPG, PNG)
- Profile Photos: `/uploads/profile_photos/` (JPG, PNG)

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting
- Helmet security headers
- CORS configuration
- File upload validation

## Validation Rules

- Full Name: Minimum 3 characters, letters and spaces only
- Email: Valid email format
- Phone: Nepal format (98xxxxxxxx or 97xxxxxxxx)
- Password: Minimum 8 characters, at least one uppercase letter and one number
- Resume: PDF only
- Company Documents: PDF, JPG, or PNG

## Project Structure

```
ApplyNepalProject/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── seed.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## License

This project is for educational purposes.

