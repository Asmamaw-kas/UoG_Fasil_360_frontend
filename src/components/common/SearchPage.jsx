import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Search, 
  Filter, 
  X, 
  Camera, 
  Trophy, 
  FileText, 
  Heart, 
  MessageCircle,
  Calendar,
  User,
  Users,
  BookOpen,
  GraduationCap,
  FileCode,
  Book,
  Grid,
  List,
  ChevronDown,
  Download,
  Eye
} from 'lucide-react';

// API service
import { api } from '../../services/api';

const SearchPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    photos: [],
    rewards: [],
    documents: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    batch: 'all',
    document_type: 'all',
    time_range: 'all'
  });

  // Document type configurations
  const documentTypes = [
    { value: 'exam', label: 'Exam Papers', icon: GraduationCap, color: 'blue' },
    { value: 'research', label: 'Research Papers', icon: BookOpen, color: 'green' },
    { value: 'project', label: 'Projects', icon: FileCode, color: 'purple' },
    { value: 'book', label: 'Books', icon: Book, color: 'orange' },
  ];

  // Get search query from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q') || '';
    const category = urlParams.get('category') || 'all';
    
    setSearchQuery(query);
    setSelectedCategory(category);
    
    if (query) {
      performSearch(query, category);
    }
  }, [location]);

  // Perform search
  const performSearch = useCallback(async (query, category = 'all') => {
    if (!query.trim()) {
      setSearchResults({ photos: [], rewards: [], documents: [] });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        ...(category !== 'all' && { category })
      });

     
      
      const response = await api.get(`/search/?${params}`);
    
      
      setSearchResults(response.data);
    } catch (error) {
    
      setSearchResults({ photos: [], rewards: [], documents: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`);
      performSearch(searchQuery, selectedCategory);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Apply filters to current results
    applyFilters(newFilters);
  };

  // Apply filters to results
  const applyFilters = (filterSettings) => {
    // This would typically be done by the backend, but we'll do client-side for demo
    let filteredResults = { ...searchResults };

    if (filterSettings.batch !== 'all') {
      filteredResults.photos = filteredResults.photos.filter(photo => 
        photo.category?.batch === filterSettings.batch
      );
      filteredResults.rewards = filteredResults.rewards.filter(reward =>
        reward.student_batch === filterSettings.batch
      );
    }

    if (filterSettings.document_type !== 'all') {
      filteredResults.documents = filteredResults.documents.filter(doc =>
        doc.document_type === filterSettings.document_type
      );
    }

    if (filterSettings.time_range !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();

      switch (filterSettings.time_range) {
        case 'day':
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filteredResults.photos = filteredResults.photos.filter(photo =>
        new Date(photo.created_at) >= cutoffDate
      );
      filteredResults.rewards = filteredResults.rewards.filter(reward =>
        new Date(reward.created_at) >= cutoffDate
      );
      filteredResults.documents = filteredResults.documents.filter(doc =>
        new Date(doc.created_at) >= cutoffDate
      );
    }

    setSearchResults(filteredResults);
  };

  // Sort results
  const sortResults = (results, sortType) => {
    const sorted = { ...results };
    
    const sortByDate = (a, b) => new Date(b.created_at) - new Date(a.created_at);
    const sortByLikes = (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0);

    switch (sortType) {
      case 'latest':
        sorted.photos = [...sorted.photos].sort(sortByDate);
        sorted.rewards = [...sorted.rewards].sort(sortByDate);
        sorted.documents = [...sorted.documents].sort(sortByDate);
        break;
      case 'popular':
        sorted.photos = [...sorted.photos].sort(sortByLikes);
        sorted.rewards = [...sorted.rewards].sort(sortByLikes);
        sorted.documents = [...sorted.documents].sort(sortByLikes);
        break;
      case 'relevance':
      default:
        // Keep original order (relevance from backend)
        break;
    }

    return sorted;
  };

  // Get total result count
  const totalResults = searchResults.photos.length + searchResults.rewards.length + searchResults.documents.length;

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ photos: [], rewards: [], documents: [] });
    navigate('/search');
  };

  // Get color class for document types
  const getColorClass = (documentType, type = 'bg') => {
    const colors = {
      exam: { bg: 'bg-blue-', text: 'text-blue-', border: 'border-blue-' },
      research: { bg: 'bg-green-', text: 'text-green-', border: 'border-green-' },
      project: { bg: 'bg-purple-', text: 'text-purple-', border: 'border-purple-' },
      book: { bg: 'bg-orange-', text: 'text-orange-', border: 'border-orange-' },
    };
    return colors[documentType]?.[type] || colors.exam[type];
  };

  // Get file icon
  const getFileIcon = (documentType) => {
    const typeConfig = documentTypes.find(type => type.value === documentType);
    return typeConfig ? typeConfig.icon : FileText;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Header */}
        <div className="mb-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Search Campus Content
            </h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search photos, achievements, documents, students..."
                  className="w-full pl-12 pr-24 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white/80 backdrop-blur-sm shadow-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Content
              </button>
              <button
                onClick={() => setSelectedCategory('photos')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === 'photos'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Camera className="h-4 w-4" />
                <span>Photos</span>
              </button>
              <button
                onClick={() => setSelectedCategory('rewards')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === 'rewards'
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Achievements</span>
              </button>
              <button
                onClick={() => setSelectedCategory('documents')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === 'documents'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Documents</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching campus content...</p>
          </div>
        ) : searchQuery ? (
          <div className="space-y-8">
            
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {totalResults} results for "{searchQuery}"
                </h2>
                <p className="text-gray-600 mt-1">
                  Found {searchResults.photos.length} photos, {searchResults.rewards.length} achievements, and {searchResults.documents.length} documents
                </p>
              </div>

              {/* Results Controls */}
              <div className="flex items-center gap-4">
                
                {/* Sort Options */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setSearchResults(prev => sortResults(prev, e.target.value));
                    }}
                    className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="relevance">Sort by Relevance</option>
                    <option value="latest">Sort by Latest</option>
                    <option value="popular">Sort by Popularity</option>
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

            {/* Advanced Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                
                {/* Batch Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Batch:</span>
                  <select
                    value={filters.batch}
                    onChange={(e) => handleFilterChange('batch', e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Batches</option>
                    <option value="GC 2026">GC 2026</option>
                    <option value="GC 2027">GC 2027</option>
                    <option value="GC 2028">GC 2028</option>
                  </select>
                </div>

                {/* Document Type Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Document Type:</span>
                  <select
                    value={filters.document_type}
                    onChange={(e) => handleFilterChange('document_type', e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Types</option>
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Time Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Time:</span>
                  <select
                    value={filters.time_range}
                    onChange={(e) => handleFilterChange('time_range', e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="day">Past 24 Hours</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="year">Past Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {totalResults === 0 ? (
              <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={clearSearch}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Photos Results */}
                {searchResults.photos.length > 0 && (
                  <section>
                    <div className="flex items-center space-x-3 mb-6">
                      <Camera className="h-6 w-6 text-purple-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Photos ({searchResults.photos.length})
                      </h3>
                    </div>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {searchResults.photos.map(photo => (
                          <PhotoSearchResult 
                            key={photo.id} 
                            photo={photo} 
                            viewMode={viewMode}
                            searchQuery={searchQuery}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {searchResults.photos.map(photo => (
                          <PhotoSearchResult 
                            key={photo.id} 
                            photo={photo} 
                            viewMode={viewMode}
                            searchQuery={searchQuery}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Rewards Results */}
                {searchResults.rewards.length > 0 && (
                  <section>
                    <div className="flex items-center space-x-3 mb-6">
                      <Trophy className="h-6 w-6 text-orange-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Achievements ({searchResults.rewards.length})
                      </h3>
                    </div>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.rewards.map(reward => (
                          <RewardSearchResult 
                            key={reward.id} 
                            reward={reward} 
                            viewMode={viewMode}
                            searchQuery={searchQuery}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {searchResults.rewards.map(reward => (
                          <RewardSearchResult 
                            key={reward.id} 
                            reward={reward} 
                            viewMode={viewMode}
                            searchQuery={searchQuery}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Documents Results */}
                {searchResults.documents.length > 0 && (
                  <section>
                    <div className="flex items-center space-x-3 mb-6">
                      <FileText className="h-6 w-6 text-green-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Documents ({searchResults.documents.length})
                      </h3>
                    </div>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.documents.map(document => (
                          <DocumentSearchResult 
                            key={document.id} 
                            document={document} 
                            viewMode={viewMode}
                            searchQuery={searchQuery}
                            getFileIcon={getFileIcon}
                            getColorClass={getColorClass}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {searchResults.documents.map(document => (
                          <DocumentSearchResult 
                            key={document.id} 
                            document={document} 
                            viewMode={viewMode}
                            searchQuery={searchQuery}
                            getFileIcon={getFileIcon}
                            getColorClass={getColorClass}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty State - No Search */
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start Searching</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Search across photos, student achievements, exam papers, research papers, projects, and books from your campus.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <Camera className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Campus Photos & Events</p>
              </div>
              <div className="text-center p-4">
                <Trophy className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Student Achievements</p>
              </div>
              <div className="text-center p-4">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Study Resources</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Photo Search Result Component
const PhotoSearchResult = ({ photo, viewMode, searchQuery }) => {
  const navigate = useNavigate();

  // Highlight search terms in text
  const highlightText = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  if (viewMode === 'grid') {
    return (
      <div 
        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/photos`)} // Would navigate to photo detail
      >
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={photo.image}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
            {highlightText(photo.title, searchQuery)}
          </h4>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {highlightText(photo.description, searchQuery)}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Camera className="h-3 w-3" />
              <span>Photo</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(photo.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-6 cursor-pointer"
      onClick={() => navigate(`/photos`)}
    >
      <div className="flex gap-6">
        <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-gray-100 overflow-hidden">
          <img
            src={photo.image}
            alt={photo.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {highlightText(photo.title, searchQuery)}
          </h4>
          <p className="text-gray-600 mb-3">
            {highlightText(photo.description, searchQuery)}
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Camera className="h-4 w-4" />
              <span>Photo</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{photo.uploaded_by?.first_name} {photo.uploaded_by?.last_name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(photo.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{photo.likes?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{photo.comments_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reward Search Result Component
const RewardSearchResult = ({ reward, viewMode, searchQuery }) => {
  const navigate = useNavigate();

  const highlightText = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  if (viewMode === 'grid') {
    return (
      <div 
        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/rewards`)}
      >
        <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
          {reward.photo_details?.image ? (
            <img
              src={reward.photo_details.image}
              alt={reward.student_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Trophy className="h-12 w-12 text-orange-400" />
          )}
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {highlightText(reward.student_name, searchQuery)}
          </h4>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {highlightText(reward.achievement, searchQuery)}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Trophy className="h-3 w-3" />
              <span>Achievement</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{reward.student_batch}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-6 cursor-pointer"
      onClick={() => navigate(`/rewards`)}
    >
      <div className="flex gap-6">
        <div className="flex-shrink-0 w-24 h-24 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
          {reward.photo_details?.image ? (
            <img
              src={reward.photo_details.image}
              alt={reward.student_name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <Trophy className="h-8 w-8 text-orange-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {highlightText(reward.student_name, searchQuery)}
          </h4>
          <p className="text-gray-600 mb-3">
            {highlightText(reward.achievement, searchQuery)}
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Trophy className="h-4 w-4" />
              <span>Achievement</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{reward.student_department}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(reward.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{reward.likes?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{reward.comments_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Search Result Component
const DocumentSearchResult = ({ document, viewMode, searchQuery, getFileIcon, getColorClass }) => {
  const navigate = useNavigate();
  const Icon = getFileIcon(document.document_type);
  const colorClass = getColorClass(document.document_type);

  const highlightText = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  if (viewMode === 'grid') {
    return (
      <div 
        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/documents`)}
      >
        <div className={`${colorClass}50 px-4 py-3 border-b border-gray-200`}>
          <div className="flex items-center space-x-2">
            <Icon className={`h-4 w-4 ${colorClass}600`} />
            <span className={`text-sm font-medium ${colorClass}700 capitalize`}>
              {document.document_type.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
            {highlightText(document.title, searchQuery)}
          </h4>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {highlightText(document.description, searchQuery) || 'No description provided.'}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>{document.file?.split('.').pop()?.toUpperCase() || 'FILE'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(document.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-6 cursor-pointer"
      onClick={() => navigate(`/documents`)}
    >
      <div className="flex gap-6">
        <div className={`flex-shrink-0 w-16 h-16 rounded-xl ${colorClass}100 flex items-center justify-center`}>
          <Icon className={`h-8 w-8 ${colorClass}600`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass}100 ${colorClass}800`}>
              <Icon className="h-3 w-3 mr-1" />
              {document.document_type.replace('_', ' ')}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {highlightText(document.title, searchQuery)}
          </h4>
          <p className="text-gray-600 mb-3">
            {highlightText(document.description, searchQuery) || 'No description provided.'}
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{document.file?.split('.').pop()?.toUpperCase() || 'FILE'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{document.uploaded_by?.first_name} {document.uploaded_by?.last_name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(document.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{document.likes?.length || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{document.comments_count || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="h-4 w-4" />
                <span>{document.download_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;