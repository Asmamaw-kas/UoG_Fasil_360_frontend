// components/RepresentativeRequest.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  History,
  Award,
  Users,
  Calendar,
  MessageSquare
} from 'lucide-react';

const RepresentativeRequest = () => {
  const { user, refreshUserData } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [activeTab, setActiveTab] = useState('my-request'); // 'my-request' or 'all-requests'

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/representative-requests/');
      const requestsData = response.data.results || response.data;
      setRequests(requestsData);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Check if user already has a pending request
  const hasPendingRequest = requests.some(
    request => request.user?.id === user?.id && request.status === 'pending'
  );

  // Check if user is already a representative
  const isAlreadyRepresentative = user?.is_representative;

  // Handle request submission
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestMessage.trim()) return;

    try {
      setSubmitting(true);
      await api.post('/representative-requests/', {
        request_message: requestMessage
      });
      
      setShowRequestModal(false);
      setRequestMessage('');
      fetchRequests(); // Refresh the list
      refreshUserData(); // Refresh user data
    } catch (error) {
      
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle request approval (for admin)
  const handleApprove = async (requestId) => {
    try {
      await api.post(`/representative-requests/${requestId}/approve/`);
      fetchRequests();
      alert('Request approved successfully!');
    } catch (error) {
     
      alert('Failed to approve request.');
    }
  };

  // Handle request rejection (for admin)
  const handleReject = async (requestId) => {
    try {
      await api.post(`/representative-requests/${requestId}/reject/`);
      fetchRequests();
      alert('Request rejected.');
    } catch (error) {
   
      alert('Failed to reject request.');
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50/30 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50/30 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Become a Representative
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Request to become a campus representative to upload photos, documents, 
                and manage content for your batch.
              </p>
            </div>
            
            {/* Request Button - Only show if user can request */}
            {!isAlreadyRepresentative && !hasPendingRequest && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Request Representative Role
              </button>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${
                isAlreadyRepresentative ? 'bg-green-100 text-green-600' : 
                hasPendingRequest ? 'bg-yellow-100 text-yellow-600' : 
                'bg-gray-100 text-gray-600'
              }`}>
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Current Status</h3>
                <p className="text-sm text-gray-600">Your representative status</p>
              </div>
            </div>
            <div className="text-lg font-medium">
              {isAlreadyRepresentative ? (
                <span className="text-green-600">You are a Representative</span>
              ) : hasPendingRequest ? (
                <span className="text-yellow-600">Request Pending</span>
              ) : (
                <span className="text-gray-600">Not a Representative</span>
              )}
            </div>
          </div>

          {/* Benefits Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Benefits</h3>
                <p className="text-sm text-gray-600">As a representative</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Upload campus photos</li>
              <li>• Share documents & resources</li>
              <li>• Manage batch content</li>
            </ul>
          </div>

          {/* Requirements Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Requirements</h3>
                <p className="text-sm text-gray-600">To become a representative</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Verified student account</li>
              <li>• Active campus participation</li>
              <li>• Admin approval required</li>
            </ul>
          </div>
        </div>

        {/* Tab Navigation - Only show all requests to admin */}
        {user?.is_staff && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('my-request')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'my-request'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Request
              </button>
              <button
                onClick={() => setActiveTab('all-requests')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'all-requests'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Requests ({requests.length})
              </button>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {activeTab === 'my-request' ? (
            // User's own request
            requests
              .filter(request => request.user?.id === user?.id)
              .map(request => (
                <RequestCard 
                  key={request.id} 
                  request={request} 
                  isAdmin={user?.is_staff}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
          ) : (
            // All requests (admin view)
            requests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                isAdmin={user?.is_staff}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}

          {/* Empty State */}
          {requests.length === 0 && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
              <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Representative Requests
              </h3>
              <p className="text-gray-500 mb-6">
                {user?.is_staff 
                  ? 'No students have requested to become representatives yet.'
                  : 'You haven\'t submitted a representative request yet.'
                }
              </p>
              {!user?.is_staff && !isAlreadyRepresentative && !hasPendingRequest && (
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Submit Your First Request
                </button>
              )}
            </div>
          )}
        </div>

        {/* Request Modal */}
        {showRequestModal && (
          <RequestModal
            onClose={() => setShowRequestModal(false)}
            onSubmit={handleSubmitRequest}
            message={requestMessage}
            setMessage={setRequestMessage}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
};

// Request Card Component
const RequestCard = ({ request, isAdmin, onApprove, onReject }) => {
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {request.user_name || `${request.user?.first_name} ${request.user?.last_name}`}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{request.user_department || request.user?.department}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>{request.user_batch || request.user?.batch}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Request Message
            </h4>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
              {request.request_message}
            </p>
          </div>

          {/* Admin Notes */}
          {request.admin_notes && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
              <p className="text-gray-600 bg-yellow-50 rounded-lg p-3 text-sm">
                {request.admin_notes}
              </p>
            </div>
          )}

          {/* Reviewed Info */}
          {request.reviewed_by && (
            <div className="text-sm text-gray-500">
              Reviewed by: {request.reviewed_by?.first_name} {request.reviewed_by?.last_name} • 
              {request.reviewed_at && ` on ${new Date(request.reviewed_at).toLocaleDateString()}`}
            </div>
          )}
        </div>

        {/* Admin Actions */}
        {isAdmin && request.status === 'pending' && (
          <div className="flex flex-col space-y-2 lg:items-end">
            <button
              onClick={() => onApprove(request.id)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </button>
            <button
              onClick={() => onReject(request.id)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Request Modal Component
const RequestModal = ({ onClose, onSubmit, message, setMessage, submitting }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Request Representative Role</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why do you want to become a representative? *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              placeholder="Please explain why you would be a good representative for your batch. Include any relevant experience or reasons..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              This will be reviewed by campus administrators.
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              What happens next?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your request will be reviewed by administrators</li>
              <li>• You'll receive a notification when decided</li>
              <li>• Approval gives you upload and management permissions</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepresentativeRequest;