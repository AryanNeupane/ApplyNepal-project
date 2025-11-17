import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const RecruiterDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, jobsRes] = await Promise.all([
        api.get('/recruiters/profile'),
        api.get('/recruiters/jobs')
      ]);
      setProfile(profileRes.data);
      setJobs(jobsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const totalApplications = jobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Recruiter Dashboard</h1>

        {profile?.verificationStatus === 'pending' && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            Your company verification is pending. Please upload verification documents.
            <Link to="/recruiter/upload-documents" className="ml-2 underline">Upload Documents</Link>
          </div>
        )}

        {profile?.verificationStatus === 'rejected' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Your company verification was rejected. Please upload new documents.
            <Link to="/recruiter/upload-documents" className="ml-2 underline">Upload Documents</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Jobs</h3>
            <p className="text-3xl font-bold text-blue-600">{jobs.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Applications</h3>
            <p className="text-3xl font-bold text-green-600">{totalApplications}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Verification Status</h3>
            <p className={`text-lg font-semibold ${
              profile?.verificationStatus === 'verified' ? 'text-green-600' :
              profile?.verificationStatus === 'pending' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {profile?.verificationStatus || 'Pending'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Jobs</h2>
            {profile?.verificationStatus === 'verified' && (
              <Link
                to="/recruiter/post-job"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Post New Job
              </Link>
            )}
          </div>
          {jobs.length === 0 ? (
            <p className="text-gray-500">No jobs posted yet</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="p-4 border border-gray-200 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.location} • {job.jobType}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {job.applications?.length || 0} applications
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applications`}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        View Applications
                      </Link>
                      <Link
                        to={`/recruiter/jobs/${job._id}/edit`}
                        className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this job?')) {
                            try {
                              await api.delete(`/jobs/${job._id}`);
                              fetchDashboardData();
                            } catch (error) {
                              alert('Error deleting job');
                            }
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;

