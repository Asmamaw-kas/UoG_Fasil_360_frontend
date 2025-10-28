import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import { 
  Camera, 
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
  Upload,
  ChevronDown,
  Crown,
  Trash2,
  Edit3,
  Users,
  Calendar
} from 'lucide-react';

// API service
import { api } from '../services/api';

const Photos = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoType, setPhotoType] = useState('all');

  // Fetch photos and categories
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [photosRes, categoriesRes] = await Promise.all([
        api.get('/photos/'),
        api.get('/categories/')
      ]);
      
      console.log('✅ Photos data:', photosRes.data);
      console.log('✅ Categories data:', categoriesRes.data);
      
      // Extract results from paginated response
      const photosData = photosRes.data.results || photosRes.data;
      const categoriesData = categoriesRes.data.results || categoriesRes.data;
      
      setPhotos(photosData);
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('💥 Failed to fetch data:', error);
      setPhotos([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  const filteredPhotos = photos
    .filter(photo => {
      
      const matchesCategory = selectedCategory === 'all' || photo.category === parseInt(selectedCategory);
      const matchesSearch = photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           photo.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPhotoType = photoType === 'all' || photo.photo_type === photoType;
      return matchesCategory && matchesSearch && matchesPhotoType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.total_likes || 0) - (a.total_likes || 0);
        case 'featured':
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        case 'latest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // Handle like/unlike
  const handleLike = async (photoId) => {
    if (!user) return;
    
    try {
      await api.post(`/photos/${photoId}/like/`);
      setPhotos(prev => prev.map(photo => 
        photo.id === photoId 
          ? {
              ...photo,
              total_likes: photo.user_has_liked ? (photo.total_likes || 1) - 1 : (photo.total_likes || 0) + 1,
              user_has_liked: !photo.user_has_liked
            }
          : photo
      ));
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  // Handle photo upload - FIXED: Check user representative status properly
  const handleUpload = async (formData) => {
    // FIXED: Check if user is representative
    if (!user || !user.is_representative) {
      console.error('User is not authorized to upload photos');
      return;
    }
    
    try {
      setUploading(true);
      const response = await api.post('/photos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setPhotos(prev => [response.data, ...prev]);
      setShowUploadModal(false);
      // Refresh data to get updated categories
      fetchData();
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle photo deletion
  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      await api.delete(`/photos/${photoId}/`);
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  // FIXED: Get user's batch categories - filter categories by user's batch
  const userBatchCategories = categories.filter(cat => 
    !cat.batch_specific || cat.batch === user?.batch
  );

  // Handle photo selection - navigate to detail page
  const handlePhotoSelect = (photo) => {
    navigate(`/photos/${photo.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Campus Photos
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Explore moments from campus life, celebrations, and events. 
                {user?.is_representative && " Upload photos to share with your batch!"}
              </p>
            </div>
            
            {/* FIXED: Upload button - only show if user is representative */}
            {user?.is_representative && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Photo
              </button>
            )}
          </div>
        </div>

        {/* Filters and Controls - UPDATED: Removed batch filter, added photo type filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            
            {/* Search Bar */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Photo Type Filter - NEW: Replaced batch filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPhotoType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  photoType === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setPhotoType('general')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  photoType === 'general'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setPhotoType('celebration')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  photoType === 'celebration'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Celebration
              </button>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              
              {/* Category Filter - UPDATED: Show only user's batch categories */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {userBatchCategories.map(category => (
                    <option key={category.id} value={category.id}>
                    GC {category.name} 
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort Options */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="featured">Featured</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Photos Grid/List */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No photos found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== 'all' || photoType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Be the first to share photos from campus!'
              }
            </p>
            
                {user?.is_representative && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Photo
                </button>
              )}

              {!user?.is_representative && user && (
                console.log('❌ Upload button NOT visible - user is NOT representative'),
                console.log('🔍 User details:', {
                  id: user.id,
                  email: user.email,
                  is_representative: user.is_representative,
                  user_type: user.user_type
                })
              )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredPhotos.map(photo => (
              <PhotoCard 
                key={photo.id} 
                photo={photo} 
                onLike={handleLike}
                onSelect={handlePhotoSelect}
                onDelete={handleDelete}
                user={user}
              />
              
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPhotos.map(photo => (
              <PhotoListItem 
                key={photo.id} 
                photo={photo} 
                onLike={handleLike}
                onSelect={handlePhotoSelect}
                onDelete={handleDelete}
                user={user}
              />
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUpload}
            categories={userBatchCategories}
            uploading={uploading}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

// Photo Card Component (Grid View) - FIXED: comments_count display
const PhotoCard = ({ photo, onLike, onSelect, onDelete, user }) => {
  const [showOptions, setShowOptions] = useState(false);

  // FIXED: Get uploader name properly
  const uploaderName = photo.uploaded_by_name || 
                      `${photo.uploaded_by?.first_name || ''} ${photo.uploaded_by?.last_name || ''}`.trim() || 
                      'Unknown User';

  // FIXED: Get uploader initials
  const uploaderInitials = photo.uploaded_by?.first_name?.[0] && photo.uploaded_by?.last_name?.[0] 
    ? `${photo.uploaded_by.first_name[0]}${photo.uploaded_by.last_name[0]}`
    : uploaderName.split(' ').map(n => n[0]).join('').toUpperCase() || 'UU';

  // FIXED: Get comments count with proper fallback
    const commentsCount = photo.comments_count !== undefined ? photo.comments_count : 
                       (photo.comments ? photo.comments.length : 0);
  
  console.log('Photo comments data:', {
    id: photo.id,
    comments_count: photo.comments_count,
    comments: photo.comments,
    calculatedCount: commentsCount
  });


  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden">
      
      <div 
        className="relative aspect-square bg-gray-100 cursor-pointer overflow-hidden"
        onClick={() => onSelect(photo)} 
      >
        <img
          src={photo.image}
          alt={photo.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
       

        {/* Featured Badge */}
        {photo.is_featured && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              <Crown className="h-3 w-3" />
              <span>Featured</span>
            </div>
          </div>
        )}

      
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 line-clamp-1 flex-1"
            onClick={() => onSelect(photo)}
          >
            {photo.title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {photo.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(photo.id);
              }}
              className={`flex items-center space-x-1 transition-all ${
                photo.user_has_liked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${photo.user_has_liked ? 'fill-current' : ''}`} />
              <span>{photo.total_likes || 0}</span>
            </button>
            
            <button
              onClick={() => onSelect(photo)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{commentsCount}</span>
            </button>
          </div>

          <div className="text-xs text-gray-500">
            {photo.category_name || photo.category?.name}
          </div>
        </div>

        {/* Uploader Info */}
        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-normal">
            {uploaderInitials}
          </div>
          <span className="text-xs text-gray-600">
            {uploaderName}
          </span>
          {photo.uploaded_by?.is_representative && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Rep
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Photo List Item Component (List View) - FIXED: comments_count display
const PhotoListItem = ({ photo, onLike, onSelect, onDelete, user }) => {
  // FIXED: Get uploader name properly
  const uploaderName = photo.uploaded_by_name || 
                      `${photo.uploaded_by?.first_name || ''} ${photo.uploaded_by?.last_name || ''}`.trim() || 
                      'Unknown User';

  // FIXED: Get uploader initials
  const uploaderInitials = photo.uploaded_by?.first_name?.[0] && photo.uploaded_by?.last_name?.[0] 
    ? `${photo.uploaded_by.first_name[0]}${photo.uploaded_by.last_name[0]}`
    : uploaderName.split(' ').map(n => n[0]).join('').toUpperCase() || 'UU';

  // FIXED: Get comments count with proper fallback
  const commentsCount = photo.comments_count || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-6">
      <div className="flex gap-6">
        {/* Thumbnail */}
        <div 
          className="flex-shrink-0 w-32 h-32 rounded-xl bg-gray-100 overflow-hidden cursor-pointer"
          onClick={() => onSelect(photo)}
        >
          <img
            src={photo.image}
            alt={photo.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 mb-1"
                onClick={() => onSelect(photo)}
              >
                {photo.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {photo.description}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {photo.is_featured && (
                <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <Crown className="h-3 w-3" />
                  <span>Featured</span>
                </div>
              )}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                photo.photo_type === 'celebration' 
                  ? 'bg-pink-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}>
                <span className="capitalize">{photo.photo_type || 'general'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <button
                onClick={() => onLike(photo.id)}
                className={`flex items-center space-x-1 transition-all ${
                  photo.user_has_liked 
                    ? 'text-red-500' 
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${photo.user_has_liked ? 'fill-current' : ''}`} />
                <span>{photo.total_likes || 0}</span>
              </button>
              
              <button
                onClick={() => onSelect(photo)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{commentsCount}</span>
              </button>

              <div className="text-sm text-gray-500">
                Category: <span className="font-medium">{photo.category_name || photo.category?.name}</span>
              </div>

              <div className="text-sm text-gray-500 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(photo.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                  {uploaderInitials}
                </div>
                <span className="text-sm text-gray-600">
                  {uploaderName}
                </span>
                {photo.uploaded_by?.is_representative && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Representative
                  </span>
                )}
              </div>

              {(user?.is_representative || user?.id === photo.uploaded_by?.id) && (
                <button
                  onClick={() => onDelete(photo.id)}
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

// Upload Modal Component
const UploadModal = ({ onClose, onUpload, categories, uploading, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    photo_type: 'general',
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
    onUpload(submitData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Upload Photo</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
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
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter photo title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describe this photo..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} {category.batch && `(${category.batch})`}
                </option>
              ))}
            </select>
          </div>

          {/* Photo Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Type
            </label>
            <select
              value={formData.photo_type}
              onChange={(e) => setFormData(prev => ({ ...prev, photo_type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="general">General</option>
              <option value="celebration">Celebration</option>
            </select>
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
              disabled={uploading || !formData.image || !formData.title || !formData.category}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Photos;