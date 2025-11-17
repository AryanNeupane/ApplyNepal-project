import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, verificationsRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/verifications/pending')
      ]);
      setStats(statsRes.data);
      setPendingVerifications(verificationsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId) => {
    try {
      await api.put(`/admin/verifications/${verificationId}/approve`);
      fetchDashboardData();
      alert('Company approved successfully');
    } catch (error) {
      alert('Error approving company');
    }
  };

  const handleReject = async (verificationId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.put(`/admin/verifications/${verificationId}/reject`, { rejectionReason: reason });
      fetchDashboardData();
      alert('Company rejected');
    } catch (error) {
      alert('Error rejecting company');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Recruiters</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.totalRecruiters || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Jobs</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.totalJobs || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Applications</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats?.totalApplications || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Active Jobs</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats?.activeJobs || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Pending Verifications</h3>
            <p className="text-3xl font-bold text-red-600">{stats?.pendingVerifications || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Pending Company Verifications</h2>
          {pendingVerifications.length === 0 ? (
            <p className="text-gray-500">No pending verifications</p>
          ) : (
            <div className="space-y-4">
              {pendingVerifications.map((verification) => (
                <div key={verification._id} className="p-4 border border-gray-200 rounded">
                  <h3 className="font-semibold text-gray-900">{verification.recruiter.companyName}</h3>
                  <p className="text-sm text-gray-600">{verification.recruiter.fullName}</p>
                  <p className="text-sm text-gray-500">{verification.recruiter.email}</p>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleApprove(verification._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(verification._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/verifications"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg text-center"
          >
            <h3 className="font-semibold text-gray-900">Company Verifications</h3>
            <p className="text-sm text-gray-600 mt-2">View and manage verification requests</p>
          </Link>
          <Link
            to="/admin/users"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg text-center"
          >
            <h3 className="font-semibold text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-600 mt-2">View, edit, activate, and delete user accounts</p>
          </Link>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">System Status</h3>
            <p className="text-sm text-gray-600">All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

