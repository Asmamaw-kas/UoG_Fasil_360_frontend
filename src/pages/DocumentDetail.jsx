// src/pages/DocumentDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Download, 
  Calendar, 
  User,
  FileText,
  Eye,
  BookOpen,
  GraduationCap,
  FileCode,
  Book
} from 'lucide-react';
import { api } from '../services/api';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const documentTypes = {
    exam: { icon: GraduationCap, color: 'blue', label: 'Exam Paper' },
    research: { icon: BookOpen, color: 'green', label: 'Research Paper' },
    project: { icon: FileCode, color: 'purple', label: 'Project' },
    book: { icon: Book, color: 'orange', label: 'Book' },
  };

  useEffect(() => {
    fetchDocumentDetail();
    fetchComments();
  }, [id]);

  const fetchDocumentDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents/${id}/`);
      setDocument(response.data);
    } catch (error) {
      
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/?content_type=document&object_id=${id}`);
      setComments(response.data.results || response.data);
    } catch (error) {
      
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    try {
      await api.post(`/documents/${id}/like/`);
      setDocument(prev => ({
        ...prev,
        user_has_liked: !prev.user_has_liked,
        likes: prev.user_has_liked 
          ? prev.likes.filter(like => like !== user.id)
          : [...prev.likes, user.id]
      }));
    } catch (error) {
      
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    setSubmittingComment(true);
    try {
      const response = await api.post('/comments/', {
        content: commentText,
        content_type: 12,
        object_id: id
      });
      
      setComments(prev => [response.data, ...prev]);
      setCommentText('');
      setDocument(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      }));
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDownload = () => {
    if (document?.file) {
      window.open(document.file, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h2>
          <p className="text-gray-600 mb-4">The document you're looking for doesn't exist.</p>
          <Link to="/documents" className="text-blue-600 hover:text-blue-700">
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  const documentType = documentTypes[document.document_type] || documentTypes.exam;
  const Icon = documentType.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl bg-${documentType.color}-100`}>
                <Icon className={`h-6 w-6 text-${documentType.color}-600`} />
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${documentType.color}-100 text-${documentType.color}-800`}>
                  {documentType.label}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">{document.title}</h1>
              </div>
            </div>
          </div>

          {/* Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900 mt-1">{document.description || 'No description provided.'}</p>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 transition-all ${
                    document.user_has_liked 
                      ? 'text-red-500' 
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${document.user_has_liked ? 'fill-current' : ''}`} />
                  <span>{document.likes?.length || 0}</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-5 w-5" />
                  <span>{document.comments_count || 0}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{document.download_count || 0} downloads</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">File Type</label>
                <p className="text-gray-900 capitalize">{document.file?.split('.').pop() || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Uploaded</label>
                <p className="text-gray-900">{new Date(document.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  document.is_approved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {document.is_approved ? 'Approved' : 'Pending Approval'}
                </p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <button
              onClick={handleDownload}
              className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Download Document</span>
            </button>
          </div>

          {/* Uploader Info */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {document.uploaded_by?.first_name?.[0]}{document.uploaded_by?.last_name?.[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {document.uploaded_by?.first_name} {document.uploaded_by?.last_name}
                </p>
                <p className="text-sm text-gray-500">{document.uploaded_by?.batch}</p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Comments ({comments.length})
            </h3>
            
            {/* Comment Input */}
            {user && (
              <form onSubmit={handleComment} className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment about this resource..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
                      {comment.user?.first_name?.[0]}{comment.user?.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.user?.first_name} {comment.user?.last_name}
                          </span>
                          <span className="text-xs text-gray-500">{comment.user?.batch}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;