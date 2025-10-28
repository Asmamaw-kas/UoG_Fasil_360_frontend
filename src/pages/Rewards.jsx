import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Trophy, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical,
  X,
  Search,
  Award,
  ChevronDown,
  Crown,
  Trash2,
  Edit3,
  Star,
  Users,
  Calendar
} from 'lucide-react';

// API service
import { api } from '../services/api';

const Rewards = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch rewards
  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching rewards...');
      
      const response = await api.get('/rewards/');
      console.log('✅ Rewards data:', response.data);
      
      // Handle both paginated and non-paginated responses
      setRewards(response.data.results || response.data);
    } catch (error) {
      console.error('💥 Failed to fetch rewards:', error);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  // Filter and sort rewards
  const filteredRewards = rewards
    .filter(reward => {
      const matchesBatch = selectedBatch === 'all' || reward.student_batch === selectedBatch;
      const matchesDepartment = selectedDepartment === 'all' || reward.student_department === selectedDepartment;
      const matchesSearch = reward.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           reward.achievement?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesBatch && matchesDepartment && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.total_likes || 0) - (a.total_likes || 0);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'latest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // Get unique batches and departments for filters
  const batches = [...new Set(rewards.map(reward => reward.student_batch).filter(Boolean))];
  const departments = [...new Set(rewards.map(reward => reward.student_department).filter(Boolean))];

  // Handle like/unlike
  const handleLike = async (rewardId) => {
    if (!user) return;
    
    try {
      await api.post(`/rewards/${rewardId}/like/`);
      setRewards(prev => prev.map(reward => 
        reward.id === rewardId 
          ? {
              ...reward,
              total_likes: reward.user_has_liked ? (reward.total_likes || 1) - 1 : (reward.total_likes || 0) + 1,
              user_has_liked: !reward.user_has_liked
            }
          : reward
      ));
    } catch (error) {
      console.error('Error liking reward:', error);
    }
  };

  // Handle reward creation
  const handleCreateReward = async (formData) => {
    if (!user) return;
    
    try {
      setUploading(true);
      const response = await api.post('/rewards/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setRewards(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      fetchRewards(); // Refresh to get updated data
    } catch (error) {
      console.error('Error creating reward:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle reward deletion
  const handleDelete = async (rewardId) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    
    try {
      await api.delete(`/rewards/${rewardId}/`);
      setRewards(prev => prev.filter(reward => reward.id !== rewardId));
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  // Handle reward selection - navigate to detail page
  const handleRewardSelect = (reward) => {
    navigate(`/rewards/${reward.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Student Achievements
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Celebrating outstanding achievements and accomplishments of our students. 
                {user?.is_representative && " Recognize exceptional students by adding their achievements!"}
              </p>
            </div>
            
            {user?.is_representative && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                <Award className="h-5 w-5 mr-2" />
                Add Achievement
              </button>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            
            {/* Search Bar */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search achievements or students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Batch Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedBatch('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedBatch === 'all'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Batches
              </button>
              {batches.map(batch => (
                <button
                  key={batch}
                  onClick={() => setSelectedBatch(batch)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedBatch === batch
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {batch}
                </button>
              ))}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              
              {/* Department Filter */}
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort Options */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="oldest">Oldest</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-amber-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-amber-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Grid/List */}
        {filteredRewards.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedBatch !== 'all' || selectedDepartment !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No student achievements have been added yet.'
              }
            </p>
            {user?.is_representative && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200"
              >
                <Award className="h-5 w-5 mr-2" />
                Add First Achievement
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map(reward => (
              <RewardCard 
                key={reward.id} 
                reward={reward} 
                onLike={handleLike}
                onSelect={handleRewardSelect}
                onDelete={handleDelete}
                user={user}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRewards.map(reward => (
              <RewardListItem 
                key={reward.id} 
                reward={reward} 
                onLike={handleLike}
                onSelect={handleRewardSelect}
                onDelete={handleDelete}
                user={user}
              />
            ))}
          </div>
        )}

        {/* Create Reward Modal */}
        {showCreateModal && (
          <CreateRewardModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateReward}
            uploading={uploading}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

// Reward Card Component (Grid View)
const RewardCard = ({ reward, onLike, onSelect, onDelete, user }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden">
      
      {/* Image Container */}
      <div 
        className="relative aspect-video bg-gradient-to-br from-amber-100 to-orange-100 cursor-pointer overflow-hidden"
        onClick={() => onSelect(reward)}
      >
        {reward.image || reward.image_url ? (
          <img
            src={reward.image || reward.image_url}
            alt={reward.student_name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Trophy className="h-16 w-16 text-amber-300" />
          </div>
        )}
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
         
        </div>

        {/* Achievement Badge */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
            <Star className="h-3 w-3" />
            <span>Achievement</span>
          </div>
        </div>

      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 
              className="font-bold text-lg text-gray-900 cursor-pointer hover:text-amber-600 line-clamp-1 mb-1"
              onClick={() => onSelect(reward)}
            >
              {reward.student_name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Users className="h-3 w-3" />
              <span>{reward.student_department}</span>
              <span>•</span>
              <span>{reward.student_batch}</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm line-clamp-3 mb-4 leading-relaxed">
          {reward.achievement}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(reward.id);
              }}
              className={`flex items-center space-x-1 transition-all ${
                reward.user_has_liked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${reward.user_has_liked ? 'fill-current' : ''}`} />
              <span>{reward.total_likes || 0}</span>
            </button>
            
            <button
              onClick={() => onSelect(reward)}
              className="flex items-center space-x-1 text-gray-500 hover:text-amber-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{reward.comments_count || 0}</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(reward.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reward List Item Component (List View)
const RewardListItem = ({ reward, onLike, onSelect, onDelete, user }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-6">
      <div className="flex gap-6">
        {/* Thumbnail */}
        <div 
          className="flex-shrink-0 w-24 h-24 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden cursor-pointer flex items-center justify-center"
          onClick={() => onSelect(reward)}
        >
          {reward.image || reward.image_url ? (
            <img
              src={reward.image || reward.image_url}
              alt={reward.student_name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Trophy className="h-8 w-8 text-amber-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-amber-600 mb-2"
                onClick={() => onSelect(reward)}
              >
                {reward.student_name}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{reward.student_department}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>{reward.student_batch}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(reward.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed line-clamp-2">
                {reward.achievement}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                <Star className="h-3 w-3" />
                <span>Achievement</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <button
                onClick={() => onLike(reward.id)}
                className={`flex items-center space-x-1 transition-all ${
                  reward.user_has_liked 
                    ? 'text-red-500' 
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${reward.user_has_liked ? 'fill-current' : ''}`} />
                <span>{reward.total_likes || 0}</span>
              </button>
              
              <button
                onClick={() => onSelect(reward)}
                className="flex items-center space-x-1 text-gray-500 hover:text-amber-500"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{reward.comments_count || 0}</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {(user?.is_representative || user?.id === reward.awarded_by?.id) && (
                <button
                  onClick={() => onDelete(reward.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Reward Modal Component
const CreateRewardModal = ({ onClose, onCreate, uploading, user }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    student_department: '',
    student_batch: '',
    achievement: '',
    image: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });
    onCreate(submitData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const batches = ['GC 2026', 'GC 2027', 'GC 2028', 'GC 2029'];
  const departments = [
    'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
    'Civil Engineering', 'Chemical Engineering', 'Biotechnology',
    'Mathematics', 'Physics', 'Chemistry', 'Business Administration'
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add Student Achievement</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Student Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Achievement Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-400 transition-colors">
              {formData.image ? (
                <div className="space-y-2">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="mx-auto h-32 object-cover rounded-lg"
                  />
                  <p className="text-sm text-gray-600">{formData.image.name}</p>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload achievement photo (optional)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name *
            </label>
            <input
              type="text"
              required
              value={formData.student_name}
              onChange={(e) => setFormData(prev => ({ ...prev, student_name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter student's full name"
            />
          </div>

          {/* Department and Batch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                required
                value={formData.student_department}
                onChange={(e) => setFormData(prev => ({ ...prev, student_department: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch *
              </label>
              <select
                required
                value={formData.student_batch}
                onChange={(e) => setFormData(prev => ({ ...prev, student_batch: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select Batch</option>
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Achievement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Achievement Details *
            </label>
            <textarea
              required
              value={formData.achievement}
              onChange={(e) => setFormData(prev => ({ ...prev, achievement: e.target.value }))}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
              placeholder="Describe the student's achievement, competition won, research published, project completed, etc."
            />
          </div>

          {/* Submit Buttons */}
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
              disabled={uploading || !formData.student_name || !formData.student_department || !formData.student_batch || !formData.achievement}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Adding Achievement...' : 'Add Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Rewards;