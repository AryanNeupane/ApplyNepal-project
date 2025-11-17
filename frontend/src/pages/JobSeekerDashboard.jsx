import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const JobSeekerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, jobsRes, appsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/jobs/recommended'),
        api.get('/applications/my-applications')
      ]);
      setProfile(profileRes.data);
      setRecommendedJobs(jobsRes.data);
      setApplications(appsRes.data);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">My Applications</h3>
            <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Saved Jobs</h3>
            <p className="text-3xl font-bold text-green-600">{profile?.savedJobs?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Recommended Jobs</h3>
            <p className="text-3xl font-bold text-purple-600">{recommendedJobs.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recommended Jobs</h2>
            {recommendedJobs.length === 0 ? (
              <p className="text-gray-500">No recommended jobs based on your skills</p>
            ) : (
              <div className="space-y-4">
                {recommendedJobs.slice(0, 5).map((job) => (
                  <Link
                    key={job._id}
                    to={`/jobs/${job._id}`}
                    className="block p-4 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.companyName}</p>
                    <p className="text-sm text-gray-500">{job.location}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
            {applications.length === 0 ? (
              <p className="text-gray-500">No applications yet</p>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div key={app._id} className="p-4 border border-gray-200 rounded">
                    <h3 className="font-semibold text-gray-900">{app.job.title}</h3>
                    <p className="text-sm text-gray-600">{app.job.companyName}</p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/profile"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;

