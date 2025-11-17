import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get('/users/saved-jobs');
      setSavedJobs(response.data);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await api.delete(`/users/unsave-job/${jobId}`);
      setSavedJobs(savedJobs.filter(job => job._id !== jobId));
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Saved Jobs</h1>

        {savedJobs.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No saved jobs yet</p>
            <Link to="/jobs" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => (
              <div key={job._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/jobs/${job._id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-2">{job.companyName}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">{job.location}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">{job.jobType}</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded">{job.category}</span>
                    </div>
                    <p className="text-gray-700">Rs. {job.salaryRange.min.toLocaleString()} - Rs. {job.salaryRange.max.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleUnsave(job._id)}
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Unsave
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;

