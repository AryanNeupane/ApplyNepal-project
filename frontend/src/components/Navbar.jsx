import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLogOut, FiBell } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              ApplyNepal
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/jobs" className="text-gray-700 hover:text-blue-600 px-3 py-2">
              Browse Jobs
            </Link>
            {user ? (
              <>
                {user.role === 'jobseeker' && (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                      Dashboard
                    </Link>
                    <Link to="/saved-jobs" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                      Saved Jobs
                    </Link>
                  </>
                )}
                {user.role === 'recruiter' && (
                  <Link to="/recruiter/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                      Admin Panel
                    </Link>
                    <Link to="/admin/verifications" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                      Verifications
                    </Link>
                    <Link to="/admin/users" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                      Manage Users
                    </Link>
                  </>
                )}
                {user.role === 'recruiter' && (
                  <Link to="/recruiter/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                    Profile
                  </Link>
                )}
                <Link to="/notifications" className="text-gray-700 hover:text-blue-600 px-3 py-2 relative">
                  <FiBell className="w-5 h-5" />
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  <FiUser className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Login
                </Link>
                <Link to="/register/jobseeker" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

