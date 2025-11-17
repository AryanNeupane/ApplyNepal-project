import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import RegisterJobSeeker from './pages/RegisterJobSeeker';
import RegisterRecruiter from './pages/RegisterRecruiter';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JobSeekerProfile from './pages/JobSeekerProfile';
import RecruiterProfile from './pages/RecruiterProfile';
import AdminVerifications from './pages/AdminVerifications';
import AdminManageUsers from './pages/AdminManageUsers';
import SavedJobs from './pages/SavedJobs';
import Notifications from './pages/Notifications';
import PostJob from './pages/PostJob';
import ViewApplications from './pages/ViewApplications';
import UploadDocuments from './pages/UploadDocuments';
import EditJob from './pages/EditJob';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/jobseeker" element={<RegisterJobSeeker />} />
            <Route path="/register/recruiter" element={<RegisterRecruiter />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['jobseeker']}>
                  <JobSeekerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/dashboard"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['jobseeker']}>
                  <JobSeekerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/profile"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <RecruiterProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verifications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminVerifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminManageUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved-jobs"
              element={
                <ProtectedRoute allowedRoles={['jobseeker']}>
                  <SavedJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/post-job"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs/:jobId/applications"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <ViewApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/upload-documents"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <UploadDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/jobs/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <EditJob />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

