import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const ViewApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      const response = await api.get(`/applications/job/${jobId}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      fetchApplications();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handleAddNotes = (application) => {
    setSelectedApplication(application);
    setNotes(application.notes || '');
    setShowNotesModal(true);
  };

  const saveNotes = async () => {
    try {
      await api.put(`/applications/${selectedApplication._id}/status`, {
        status: selectedApplication.status,
        notes: notes
      });
      setShowNotesModal(false);
      fetchApplications();
    } catch (error) {
      alert('Error saving notes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Applications</h1>

        {applications.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No applications yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.map((application) => (
              <div key={application._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {application.applicant.fullName}
                    </h3>
                    <p className="text-gray-600 mb-1">{application.applicant.email}</p>
                    <p className="text-gray-600 mb-1">{application.applicant.phone}</p>
                    {application.applicant.profilePhoto && (
                      <img
                        src={`http://localhost:5000/${application.applicant.profilePhoto}`}
                        alt={application.applicant.fullName}
                        className="w-20 h-20 rounded-full object-cover mt-2 mb-2"
                      />
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    application.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {application.status}
                  </span>
                </div>

                {application.applicant.skills && application.applicant.skills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {application.applicant.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {application.applicant.experience && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Experience:</p>
                    <p className="text-gray-700 text-sm">{application.applicant.experience}</p>
                  </div>
                )}

                {application.notes && (
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                    <p className="text-gray-600 text-sm">{application.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {application.applicant.resume ? (
                    <>
                      <a
                        href={`http://localhost:5000/${application.applicant.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        📄 View Resume
                      </a>
                      <a
                        href={`http://localhost:5000/${application.applicant.resume}`}
                        download
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        ⬇️ Download Resume
                      </a>
                    </>
                  ) : (
                    <span className="text-red-600 text-sm px-4 py-2 bg-red-50 rounded">No resume uploaded</span>
                  )}
                  <button
                    onClick={() => handleAddNotes(application)}
                    className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700"
                  >
                    {application.notes ? '✏️ Edit Notes' : '➕ Add Notes'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {application.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(application._id, 'shortlisted')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => updateStatus(application._id, 'accepted')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(application._id, 'rejected')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {application.status === 'shortlisted' && (
                    <>
                      <button
                        onClick={() => updateStatus(application._id, 'accepted')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(application._id, 'rejected')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Applied: {new Date(application.appliedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {showNotesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Add Notes for {selectedApplication?.applicant.fullName}</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                placeholder="Add internal notes about this applicant..."
              />
              <div className="flex gap-2">
                <button
                  onClick={saveNotes}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Notes
                </button>
                <button
                  onClick={() => setShowNotesModal(false)}
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

export default ViewApplications;
