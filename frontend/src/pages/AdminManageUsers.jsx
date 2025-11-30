import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    isActive: true,
    verificationStatus: 'pending'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [usersRes, recruitersRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/recruiters')
      ]);

      const jobseekers = (usersRes.data || []).map(u => ({
        ...u,
        role: 'jobseeker'
      }));

      const recruiters = (recruitersRes.data || []).map(r => ({
        ...r,
        role: 'recruiter'
      }));

      setUsers([...jobseekers, ...recruiters]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      companyName: user.companyName || '',
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      verificationStatus: user.verificationStatus || 'pending'
    });
  };

  const handleSaveEdit = async () => {
    try {
      if (editingUser.role === 'recruiter') {
        await api.put(`/admin/recruiters/${editingUser._id}`, {
          fullName: editForm.fullName,
          companyName: editForm.companyName,
          phone: editForm.phone,
          isActive: editForm.isActive,
          verificationStatus: editForm.verificationStatus
        });
      } else {
        await api.put(`/admin/users/${editingUser._id}`, {
          fullName: editForm.fullName,
          phone: editForm.phone,
          isActive: editForm.isActive
        });
      }
      setEditingUser(null);
      fetchUsers();
      alert('User updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) return;

      if (user.role === 'recruiter') {
        await api.put(`/admin/recruiters/${userId}/status`, { isActive: !currentStatus });
      } else {
        await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      }
      fetchUsers();
    } catch (error) {
      alert('Error updating user status');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will delete all their applications.')) {
      return;
    }
    try {
      const user = users.find(u => u._id === userId);
      if (!user) return;

      if (user.role === 'recruiter') {
        await api.delete(`/admin/recruiters/${userId}`);
      } else {
        await api.delete(`/admin/users/${userId}`);
      }
      fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  const filteredUsers = users.filter(user =>
    (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Users</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name / Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.role === 'recruiter' ? (user.companyName || user.fullName) : user.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.role === 'recruiter' ? (
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        user.verificationStatus === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : user.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.verificationStatus || 'pending'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      className={`${
                        user.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        )}

        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">
                Edit {editingUser.role === 'recruiter' ? 'Recruiter' : 'User'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                {editingUser.role === 'recruiter' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={editForm.companyName}
                      onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                {editingUser.role === 'recruiter' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
                    <select
                      value={editForm.verificationStatus}
                      onChange={(e) => setEditForm({ ...editForm, verificationStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManageUsers;

