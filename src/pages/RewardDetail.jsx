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
  Edit3,
  Trophy,
  Star,
  Users,
  Award
} from 'lucide-react';
import { api } from '../services/api';

const RewardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRewardDetail();
    fetchComments();
  }, [id]);

  const fetchRewardDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/rewards/${id}/`);
      console.log('Reward data:', response.data);
      setReward(response.data);
    } catch (error) {
      console.error('Error fetching reward:', error);
      setError('Failed to load reward');
      navigate('/rewards');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      // Use query parameters to filter comments for this reward
      const response = await api.get(`/comments/?content_type=reward&object_id=${id}`);
      console.log('Comments data:', response.data);
      setComments(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Fallback: try without filters
      try {
        const allComments = await api.get('/comments/');
        const rewardComments = (allComments.data.results || allComments.data).filter(
          comment => comment.object_id === parseInt(id)
        );
        setComments(rewardComments);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        setComments([]);
      }
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    try {
      await api.post(`/rewards/${id}/like/`);
      setReward(prev => ({
        ...prev,
        user_has_liked: !prev.user_has_liked,
        total_likes: prev.user_has_liked ? (prev.total_likes || 1) - 1 : (prev.total_likes || 0) + 1
      }));
    } catch (error) {
      console.error('Error liking reward:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    setSubmittingComment(true);
    try {
      console.log('Submitting comment for reward:', id);
      
      // Try with content_type as ID first, then fallback to string
      let commentData = {
        content: commentText,
        content_type: 9, // Try with ID for 'reward' content type
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
      
      // Update reward comment count
      setReward(prev => ({
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
              content_type: 'reward', // Try with string instead of ID
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
            
            setReward(prev => ({
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
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      await api.delete(`/rewards/${id}/`);
      navigate('/rewards');
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !reward) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Achievement Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The achievement you\'re looking for doesn\'t exist.'}</p>
          <Link to="/rewards" className="text-amber-600 hover:text-amber-700">
            Back to Achievements
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
          Back to Achievements
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="md:flex">
            
            {/* Image Section */}
            <div className="md:w-1/2 bg-white flex items-start justify-center p-8">
              {reward.image || reward.image_url ? (
                <img
                  src={reward.image || reward.image_url}
                  alt={reward.student_name}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <Trophy className="h-32 w-32 text-amber-300 mb-4" />
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="md:w-1/2 p-6">
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{reward.student_name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{reward.student_department}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4" />
                      <span>{reward.student_batch}</span>
                    </div>
                  </div>
                </div>
                {(user?.is_representative || user?.id === reward.awarded_by?.id) && (
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

              {/* Achievement Badge */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  <Star className="h-4 w-4" />
                  <span>Student Achievement</span>
                </div>
              </div>

              {/* Reward Info */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 transition-all ${
                    reward.user_has_liked 
                      ? 'text-red-500' 
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${reward.user_has_liked ? 'fill-current' : ''}`} />
                  <span>{reward.total_likes || 0}</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-5 w-5" />
                  <span>{reward.comments_count || comments.length || 0}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(reward.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Achievement Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Achievement Details</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {reward.achievement}
                  </p>
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
                      placeholder="Add a congratulatory comment..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!commentText.trim() || submittingComment}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submittingComment ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No comments yet. Be the first to congratulate!</p>
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

export default RewardDetail;