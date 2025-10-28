import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  User, 
  Mail, 
  Building, 
  Award, 
  Calendar,
  Edit3,
  Camera,
  Trophy,
  FileText,
  Heart,
  MessageCircle,
  Settings,
  LogOut,
  Save,
  X,
  Upload,
  Shield,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';

// API service
import { api } from '../../services/api';

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    photos: 0,
    rewards: 0,
    documents: 0,
    likes: 0,
    comments: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    department: '',
    campus: '',
    batch: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        department: user.department || '',
        campus: user.campus || '',
        batch: user.batch || '',
        bio: user.bio || ''
      });
      fetchUserStats();
      fetchRecentActivity();
    }
  }, [user]);

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      // In a real app, you'd have endpoints for these stats
      const [photosRes, rewardsRes, documentsRes] = await Promise.all([
        api.get('/photos/', { params: { uploaded_by: user.id } }),
        api.get('/rewards/', { params: { awarded_by: user.id } }),
        api.get('/documents/', { params: { uploaded_by: user.id } })
      ]);

      const photos = photosRes.data.results || photosRes.data;
      const rewards = rewardsRes.data.results || rewardsRes.data;
      const documents = documentsRes.data.results || documentsRes.data;

      // Calculate total likes and comments (simplified)
      const totalLikes = [...photos, ...rewards, ...documents].reduce(
        (sum, item) => sum + (item.likes?.length || 0), 0
      );

      const totalComments = [...photos, ...rewards, ...documents].reduce(
        (sum, item) => sum + (item.comments_count || 0), 0
      );

      setUserStats({
        photos: photos.length,
        rewards: rewards.length,
        documents: documents.length,
        likes: totalLikes,
        comments: totalComments
      });
    } catch (error) {
      
    }
  };

 
  const fetchRecentActivity = async () => {
    try {
      
      const activities = [];
   
      const [photos, rewards, documents] = await Promise.all([
        api.get('/photos/', { params: { uploaded_by: user.id, ordering: '-created_at', limit: 5 } }),
        api.get('/rewards/', { params: { awarded_by: user.id, ordering: '-created_at', limit: 5 } }),
        api.get('/documents/', { params: { uploaded_by: user.id, ordering: '-created_at', limit: 5 } })
      ]);

      // Combine and sort activities
      const photoActivities = (photos.data.results || photos.data).map(photo => ({
        type: 'photo',
        item: photo,
        date: photo.created_at,
        action: 'uploaded'
      }));

      const rewardActivities = (rewards.data.results || rewards.data).map(reward => ({
        type: 'reward',
        item: reward,
        date: reward.created_at,
        action: 'added'
      }));

      const documentActivities = (documents.data.results || documents.data).map(doc => ({
        type: 'document',
        item: doc,
        date: doc.created_at,
        action: 'uploaded'
      }));

      const allActivities = [...photoActivities, ...rewardActivities, ...documentActivities]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      setRecentActivity(allActivities);
    } catch (error) {
      
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/users/${user.id}/`, formData);
      
      
      // Update user in context
      updateUser(response.data);
      setIsEditing(false);
      setErrors({});
      
    } catch (error) {
     
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Failed to update profile. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      email: user.email || '',
      department: user.department || '',
      campus: user.campus || '',
      batch: user.batch || '',
      bio: user.bio || ''
    });
    setIsEditing(false);
    setErrors({});
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'photo':
        return Camera;
      case 'reward':
        return Trophy;
      case 'document':
        return FileText;
      default:
        return User;
    }
  };

  // Get activity color
  const getActivityColor = (type) => {
    switch (type) {
      case 'photo':
        return 'text-purple-600 bg-purple-100';
      case 'reward':
        return 'text-orange-600 bg-orange-100';
      case 'document':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          
          <div className="px-8 pb-8 -mt-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              
              {/* Profile Info */}
              <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* User Details */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h1>
                    {user.is_representative && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Representative
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">@{user.username}</p>
                  <p className="text-gray-500">{user.department} • {user.batch}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                {!isEditing ? (
                  <>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
              
              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'activity', label: 'Activity', icon: Calendar },
                  { id: 'photos', label: 'My Photos', icon: Camera },
                  { id: 'achievements', label: 'My Achievements', icon: Trophy },
                  { id: 'documents', label: 'My Documents', icon: FileText },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Stats Summary */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Photos</span>
                    <span className="font-semibold text-gray-900">{userStats.photos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Achievements</span>
                    <span className="font-semibold text-gray-900">{userStats.rewards}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Documents</span>
                    <span className="font-semibold text-gray-900">{userStats.documents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Likes Received</span>
                    <span className="font-semibold text-gray-900">{userStats.likes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Comments</span>
                    <span className="font-semibold text-gray-900">{userStats.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">Welcome back, {user.first_name}! 👋</h2>
                  <p className="text-blue-100">
                    {userStats.photos === 0 && userStats.rewards === 0 && userStats.documents === 0
                      ? "Ready to start sharing your campus experience? Upload your first photo or document!"
                      : `You've shared ${userStats.photos} photos, ${userStats.rewards} achievements, and ${userStats.documents} documents. Keep it up!`
                    }
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {user.is_representative && (
                    <Link
                      to="/upload"
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                        <Upload className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Upload Content</h3>
                      <p className="text-sm text-gray-600">Share photos and achievements</p>
                    </Link>
                  )}
                  
                  <Link
                    to="/documents"
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Share Resources</h3>
                    <p className="text-sm text-gray-600">Upload study materials</p>
                  </Link>

                  {!user.is_representative && (
                    <Link
                      to="/representative-request"
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow group"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                        <Shield className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Become Representative</h3>
                      <p className="text-sm text-gray-600">Get upload permissions</p>
                    </Link>
                  )}
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <p className="text-red-700 text-sm">{errors.general}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.first_name ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.first_name && (
                            <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.last_name ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.last_name && (
                            <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username *
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.username ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.username && (
                            <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.email ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.email && (
                            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="text-gray-900 font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Username</label>
                          <p className="text-gray-900 font-medium">@{user.username}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900 font-medium">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Department</label>
                          <p className="text-gray-900 font-medium">{user.department}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Campus</label>
                          <p className="text-gray-900 font-medium">{user.campus}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Batch</label>
                          <p className="text-gray-900 font-medium">{user.batch}</p>
                        </div>
                      </div>
                      {user.bio && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-500">Bio</label>
                          <p className="text-gray-900 mt-1">{user.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity yet</p>
                    <p className="text-gray-400 text-sm mt-1">Start sharing content to see your activity here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <div key={index} className="flex items-center space-x-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActivityColor(activity.type)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">
                              You {activity.action} a {activity.type}{' '}
                              <span className="font-semibold">"{activity.item.title}"</span>
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(activity.date).toLocaleDateString()} • {new Date(activity.date).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4" />
                              <span>{activity.item.likes?.length || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{activity.item.comments_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Other Tabs Placeholder */}
            {['photos', 'achievements', 'documents', 'settings'].includes(activeTab) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {activeTab === 'photos' && <Camera className="h-8 w-8 text-gray-400" />}
                    {activeTab === 'achievements' && <Trophy className="h-8 w-8 text-gray-400" />}
                    {activeTab === 'documents' && <FileText className="h-8 w-8 text-gray-400" />}
                    {activeTab === 'settings' && <Settings className="h-8 w-8 text-gray-400" />}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeTab === 'photos' && 'My Photos'}
                    {activeTab === 'achievements' && 'My Achievements'}
                    {activeTab === 'documents' && 'My Documents'}
                    {activeTab === 'settings' && 'Account Settings'}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    This section is under development. You'll be able to manage your{' '}
                    {activeTab.replace('my ', '')} here soon!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;