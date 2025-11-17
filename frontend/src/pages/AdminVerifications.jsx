import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const response = await api.get('/admin/verifications');
      setVerifications(response.data);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId) => {
    try {
      await api.put(`/admin/verifications/${verificationId}/approve`);
      fetchVerifications();
      alert('Company approved successfully');
    } catch (error) {
      alert('Error approving company');
    }
  };

  const handleReject = async (verificationId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      await api.put(`/admin/verifications/${verificationId}/reject`, { rejectionReason });
      setSelectedVerification(null);
      setRejectionReason('');
      fetchVerifications();
      alert('Company rejected');
    } catch (error) {
      alert('Error rejecting company');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading verifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Verifications</h1>

        <div className="grid grid-cols-1 gap-6">
          {verifications.map((verification) => (
            <div key={verification._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {verification.recruiter.companyName}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <strong>Recruiter:</strong> {verification.recruiter.fullName}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Email:</strong> {verification.recruiter.email}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Phone:</strong> {verification.recruiter.phone}
                  </p>
                  {verification.recruiter.companyDescription && (
                    <p className="text-gray-700 mb-2 mt-2">
                      <strong>Description:</strong> {verification.recruiter.companyDescription}
                    </p>
                  )}
                  {verification.recruiter.companyAddress && (
                    <p className="text-gray-600 mb-1">
                      <strong>Address:</strong> {verification.recruiter.companyAddress}
                    </p>
                  )}
                  {verification.recruiter.companyWebsite && (
                    <p className="text-gray-600 mb-1">
                      <strong>Website:</strong> <a href={verification.recruiter.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600">{verification.recruiter.companyWebsite}</a>
                    </p>
                  )}
                  <div className={`inline-block px-3 py-1 rounded text-sm font-semibold mt-2 ${
                    verification.status === 'approved' ? 'bg-green-100 text-green-800' :
                    verification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Status: {verification.status}
                  </div>
                  {verification.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 rounded">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {verification.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Verification Documents:</h4>
                {verification.documents && verification.documents.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {verification.documents.map((doc, index) => {
                      const docPath = doc.path || '';
                      const docUrl = docPath.startsWith('http') 
                        ? docPath 
                        : `http://localhost:5000/${docPath}`;
                      const isImage = docPath.match(/\.(jpg|jpeg|png|gif)$/i);
                      
                      return (
                        <div key={index} className="border border-gray-300 rounded p-2">
                          <div className="flex justify-between items-center mb-2">
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              {doc.filename || `Document ${index + 1}`}
                            </a>
                            <a
                              href={docUrl}
                              download
                              className="text-gray-600 hover:text-gray-800 text-xs"
                            >
                              Download
                            </a>
                          </div>
                          {isImage ? (
                            <img
                              src={docUrl}
                              alt={doc.filename}
                              className="w-full h-32 object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'block';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`bg-gray-100 p-4 text-center rounded ${isImage ? 'hidden' : ''}`}>
                            <p className="text-gray-500 text-sm">
                              {docPath.match(/\.pdf$/i) ? 'PDF Document' : 'Document'}
                            </p>
                            {doc.size && <p className="text-xs text-gray-400 mt-1">{(doc.size / 1024).toFixed(2)} KB</p>}
                            {doc.uploadedAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No documents uploaded</p>
                )}
              </div>

              {verification.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(verification._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedVerification(verification)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}

              {verification.reviewedBy && (
                <p className="text-sm text-gray-500 mt-2">
                  Reviewed by: {verification.reviewedBy.email} on {new Date(verification.reviewedAt).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>

        {verifications.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No verification requests</p>
          </div>
        )}

        {selectedVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Reject Verification</h3>
              <p className="mb-2 text-gray-700">Company: {selectedVerification.recruiter.companyName}</p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                placeholder="Enter reason for rejection..."
                required
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleReject(selectedVerification._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setSelectedVerification(null);
                    setRejectionReason('');
                  }}
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

export default AdminVerifications;

