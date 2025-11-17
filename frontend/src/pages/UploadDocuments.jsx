import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const UploadDocuments = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setMessage('Please select at least one document');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('companyDocs', file);
      });

      await api.post('/recruiters/upload-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Documents uploaded successfully! Your verification is pending.');
      setTimeout(() => {
        navigate('/recruiter/dashboard');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error uploading documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Verification Documents</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 mb-6">
            Please upload your company verification documents (PDF, JPG, or PNG). 
            Maximum 5 files, 5MB each.
          </p>

          {message && (
            <div className={`mb-4 px-4 py-3 rounded ${
              message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Documents (PDF, JPG, PNG)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {files.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Documents'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;

