import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'jobseeker') {
      setError('Only job seekers can apply for jobs');
      return;
    }

    setApplying(true);
    setError('');

    try {
      await api.post('/applications/apply', { jobId: id });
      alert('Application submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!user || user.role !== 'jobseeker') return;

    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/users/unsave-job/${id}`);
        setIsSaved(false);
      } else {
        await api.post('/users/save-job', { jobId: id });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center">Job not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600">{job.companyName}</p>
            </div>
            {user && user.role === 'jobseeker' && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                {isSaved ? 'Saved' : 'Save Job'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">{job.location}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded">{job.jobType}</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">{job.category}</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">{job.experienceRequired}</span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Salary Range</h2>
            <p className="text-gray-700">Rs. {job.salaryRange.min.toLocaleString()} - Rs. {job.salaryRange.max.toLocaleString()}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Skills Required</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gray-200 text-gray-700 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Application Deadline</h2>
            <p className="text-gray-700">{new Date(job.deadline).toLocaleDateString()}</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {user && user.role === 'jobseeker' ? (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </button>
          ) : !user ? (
            <Link
              to="/login"
              className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Login to Apply
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

