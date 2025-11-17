import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Dream Job in Nepal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with top employers and discover opportunities across Nepal
          </p>
          {!user && (
            <div className="flex justify-center space-x-4">
              <Link
                to="/register/jobseeker"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
              >
                Job Seeker Sign Up
              </Link>
              <Link
                to="/register/recruiter"
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700"
              >
                Recruiter Sign Up
              </Link>
            </div>
          )}
          {user && (
            <Link
              to="/jobs"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 inline-block"
            >
              Browse Jobs
            </Link>
          )}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Job Seekers</h3>
            <p className="text-gray-600">
              Create your profile, upload your resume, and apply to jobs that match your skills.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Employers</h3>
            <p className="text-gray-600">
              Post jobs, find qualified candidates, and manage applications all in one place.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Verified Companies</h3>
            <p className="text-gray-600">
              All companies are verified to ensure a safe and trustworthy job search experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

