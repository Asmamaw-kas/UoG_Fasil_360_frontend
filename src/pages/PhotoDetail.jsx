import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar, 
  User, 
  MapPin,
  Download,
  MoreVertical,
  Trash2,
  Edit3
} from 'lucide-react';
import { api } from '../services/api';

const PhotoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPhotoDetail();
    fetchComments();
  }, [id]);

  const fetchPhotoDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/photos/${id}/`);
      console.log('Photo data:', response.data);
      setPhoto(response.data);
    } catch (error) {
      console.error('Error fetching photo:', error);
      setError('Failed to load photo');
      navigate('/photos');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      // Use query parameters to filter comments for this photo
      const response = await api.get(`/comments/?content_type=photo&object_id=${id}`);
      console.log('Comments data:', response.data);
      setComments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Fallback: try without filters
      try {
        const allComments = await api.get('/comments/');
        const photoComments = (allComments.data.results || allComments.data).filter(
          comment => comment.object_id === parseInt(id)
        );
        setComments(photoComments);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        setComments([]);
      }
    }
  };

  // Helper function to get uploader name
  const getUploaderName = () => {
    if (!photo) return 'Unknown User';
    
    if (photo.uploaded_by_name) {
      return photo.uploaded_by_name;
    }
    if (photo.uploaded_by) {
      if (typeof photo.uploaded_by === 'string') {
        return photo.uploaded_by;
      }
      if (photo.uploaded_by.first_name && photo.uploaded_by.last_name) {
        return `${photo.uploaded_by.first_name} ${photo.uploaded_by.last_name}`;
      }
      if (photo.uploaded_by.username) {
        return photo.uploaded_by.username;
      }
    }
    return 'Unknown User';
  };

  // Helper function to get uploader batch
  const getUploaderBatch = () => {
    if (!photo) return '';
    
    if (photo.uploaded_by?.batch) {
      return photo.uploaded_by.batch;
    }
    if (photo.batch) {
      return photo.batch;
    }
    return '';
  };

  // Helper function to get uploader initials
  const getUploaderInitials = () => {
    const name = getUploaderName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLike = async () => {
    if (!user) return;
    
    try {
      await api.post(`/photos/${id}/like/`);
      setPhoto(prev => ({
        ...prev,
        user_has_liked: !prev.user_has_liked,
        total_likes: prev.user_has_liked ? (prev.total_likes || 1) - 1 : (prev.total_likes || 0) + 1
      }));
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    setSubmittingComment(true);
    try {
      console.log('Submitting comment for photo ID:', id);
      
      // OPTION 1: Try with content_type as ID (13 for photos based on your data)
      let commentData = {
        content: commentText,
        content_type: 8, 
        object_id: parseInt(id)
      };

      console.log('Comment data:', commentData);
      
      const response = await api.post('/comments/', commentData);
      
      console.log('Comment response:', response.data);
      
      // Add new comment to the list with proper user data
      const newComment = {
        ...response.data,
        user_name: `${user.first_name} ${user.last_name}`,
        user_first_name: user.first_name,
        user_last_name: user.last_name,
        user_batch: user.batch
      };
      
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      
      // Update photo comment count
      setPhoto(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      }));
      
    } catch (error) {
      console.error('Error posting comment:', error);
      if (error.response) {
        console.error('Server error details:', error.response.data);
        
        // If option 1 fails, try option 2 with string content_type
        if (error.response.status === 400) {
          try {
            console.log('Trying alternative content_type format...');
            const alternativeResponse = await api.post('/comments/', {
              content: commentText,
              content_type: 'photo', // Try with string instead of ID
              object_id: parseInt(id)
            });
            
            console.log('Alternative comment response:', alternativeResponse.data);
            
            const newComment = {
              ...alternativeResponse.data,
              user_name: `${user.first_name} ${user.last_name}`,
              user_first_name: user.first_name,
              user_last_name: user.last_name,
              user_batch: user.batch
            };
            
            setComments(prev => [newComment, ...prev]);
            setCommentText('');
            
            setPhoto(prev => ({
              ...prev,
              comments_count: (prev.comments_count || 0) + 1
            }));
            
          } catch (secondError) {
            console.error('Second attempt failed:', secondError);
            alert('Failed to post comment. Please try again.');
          }
        } else {
          alert('Failed to post comment. Please try again.');
        }
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      await api.delete(`/photos/${id}/`);
      navigate('/photos');
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Photo Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The photo you\'re looking for doesn\'t exist.'}</p>
          <Link to="/photos" className="text-blue-600 hover:text-blue-700">
            Back to Photos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="md:flex">
            
            {/* Image Section */}
            <div className="md:w-1/2 bg-white flex items-start justify-center p-8">
              <img
                src={photo.image}
                alt={photo.title}
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            </div>

            {/* Details Section */}
            <div className="md:w-1/2 p-6">
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{photo.title}</h1>
                  <p className="text-gray-600">{photo.description}</p>
                </div>
                {(user?.is_representative || user?.id === photo.uploaded_by?.id) && (
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Photo Info */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 transition-all ${
                    photo.user_has_liked 
                      ? 'text-red-500' 
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${photo.user_has_liked ? 'fill-current' : ''}`} />
                  <span>{photo.total_likes || photo.likes?.length || 0}</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-5 w-5" />
                  <span>{photo.comments_count || comments.length || 0}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(photo.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{photo.category_name || photo.category?.name || 'Uncategorized'}</span>
                </div>
              </div>

              {/* Uploader Info */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getUploaderInitials()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {getUploaderName()}
                    </p>
                    <p className="text-sm text-gray-500">{getUploaderBatch()}</p>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Comments ({comments.length})
                </h3>
                
                {/* Comment Input */}
                {user && (
                  <form onSubmit={handleComment} className="mb-6">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
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
                          {comment.user_first_name?.[0] || comment.user_name?.[0] || 'U'}
                          {comment.user_last_name?.[0] || ''}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {comment.user_name || `${comment.user_first_name} ${comment.user_last_name}`}
                              </span>
                              <span className="text-xs text-gray-500">{comment.user_batch}</span>
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
      </div>
    </div>
  );
};

export default PhotoDetail;