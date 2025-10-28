import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FileText, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Heart, 
  MessageCircle, 
  Download,
  MoreVertical,
  X,
  Search,
  Upload,
  ChevronDown,
  BookOpen,
  FileCode,
  GraduationCap,
  Book,
  Trash2,
  Edit3,
  Calendar,
  User,
  Eye
} from 'lucide-react';

// API service
import { api } from '../services/api';

const Documents = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Document type configurations
  const documentTypes = [
    { value: 'exam', label: 'Exam Papers', icon: GraduationCap, color: 'blue' },
    { value: 'research', label: 'Research Papers', icon: BookOpen, color: 'green' },
    { value: 'project', label: 'Projects', icon: FileCode, color: 'purple' },
    { value: 'book', label: 'Books', icon: Book, color: 'orange' },
  ];

  // Helper function to get uploader name
  const getUploaderName = (document) => {
    if (!document) return 'Unknown User';
    
    // Check different possible structures
    if (document.uploaded_by_name) {
      return document.uploaded_by_name;
    }
    if (document.uploaded_by) {
      if (typeof document.uploaded_by === 'string') {
        return document.uploaded_by;
      }
      if (document.uploaded_by.first_name && document.uploaded_by.last_name) {
        return `${document.uploaded_by.first_name} ${document.uploaded_by.last_name}`;
      }
      if (document.uploaded_by.username) {
        return document.uploaded_by.username;
      }
    }
    return 'Unknown User';
  };

  // Helper function to get uploader batch
  const getUploaderBatch = (document) => {
    if (!document) return '';
    
    if (document.uploaded_by?.batch) {
      return document.uploaded_by.batch;
    }
    if (document.batch) {
      return document.batch;
    }
    return '';
  };

  // Helper function to get uploader initials
  const getUploaderInitials = (document) => {
    const name = getUploaderName(document);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
   
      
      const response = await api.get('/documents/');
     
      
     
      setDocuments(response.data.results || response.data);
    } catch (error) {
      
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesType = selectedType === 'all' || doc.document_type === selectedType;
      const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
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

  // Handle like/unlike
  const handleLike = async (docId) => {
    if (!user) return;
    
    try {
      await api.post(`/documents/${docId}/like/`);
      setDocuments(prev => prev.map(doc => 
        doc.id === docId 
          ? {
              ...doc,
              total_likes: doc.user_has_liked ? (doc.total_likes || 1) - 1 : (doc.total_likes || 0) + 1,
              user_has_liked: !doc.user_has_liked
            }
          : doc
      ));
    } catch (error) {
     
    }
  };

  // Handle comment submission - FIXED
  const handleComment = async (docId) => {
    if (!commentText.trim() || !user) return;

    try {
     
      
      // Try with content_type as ID (14 for documents - you might need to adjust this)
      let commentData = {
        content: commentText,
        content_type: 12, // Use the ID for 'document' content type
        object_id: parseInt(docId)
      };

     
      
      const response = await api.post('/comments/', commentData);
      
      
      
      // Add new comment to the list
      const newComment = {
        ...response.data,
        user_name: `${user.first_name} ${user.last_name}`,
        user_first_name: user.first_name,
        user_last_name: user.last_name,
        user_batch: user.batch
      };
      
      // Update document comment count
      setDocuments(prev => prev.map(doc => 
        doc.id === docId 
          ? { ...doc, comments_count: (doc.comments_count || 0) + 1 }
          : doc
      ));
      
      setCommentText('');
      
      // Refresh comments in detail view
      if (selectedDocument?.id === docId) {
        setSelectedDocument(prev => ({
          ...prev,
          comments_count: (prev.comments_count || 0) + 1
        }));
      }
    } catch (error) {
     
      if (error.response) {
       
        
        // If option 1 fails, try option 2 with string content_type
        if (error.response.status === 400) {
          try {
            
            const alternativeResponse = await api.post('/comments/', {
              content: commentText,
              content_type: 'document', // Try with string instead of ID
              object_id: parseInt(docId)
            });
            
           
            
            // Update document comment count
            setDocuments(prev => prev.map(doc => 
              doc.id === docId 
                ? { ...doc, comments_count: (doc.comments_count || 0) + 1 }
                : doc
            ));
            
            setCommentText('');
            
            if (selectedDocument?.id === docId) {
              setSelectedDocument(prev => ({
                ...prev,
                comments_count: (prev.comments_count || 0) + 1
              }));
            }
            
          } catch (secondError) {
            
            alert('Failed to post comment. Please try again.');
          }
        }
      }
    }
  };

  // Handle document upload
  const handleUpload = async (formData) => {
    if (!user) return;
    
    try {
      setUploading(true);
      const response = await api.post('/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setDocuments(prev => [response.data, ...prev]);
      setShowUploadModal(false);
    } catch (error) {
      
      alert('Error uploading document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle document deletion
  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await api.delete(`/documents/${docId}/`);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      setSelectedDocument(null);
      setPreviewUrl(null);
    } catch (error) {
      
    }
  };

  // Handle document download
  const handleDownload = async (doc) => {
    try {
      if (doc.file) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = doc.file;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = doc.title || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Optional: Update download count in state
        setDocuments(prev => prev.map(d => 
          d.id === doc.id 
            ? { ...d, download_count: (d.download_count || 0) + 1 }
            : d
        ));
      } else {
        
        alert('Download link not available for this document');
      }
    } catch (error) {
     
      alert('Error downloading document. Please try again.');
    }
  };

  // Handle document selection
  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
    setPreviewUrl(null); 
  };

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedDocument(null);
    setPreviewUrl(null);
  };

  // Handle upload modal close
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  // Get file icon based on type
  const getFileIcon = (documentType) => {
    const typeConfig = documentTypes.find(type => type.value === documentType);
    return typeConfig ? typeConfig.icon : FileText;
  };

  // Get color class based on type
  const getColorClass = (documentType, type = 'bg') => {
    const colors = {
      exam: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        border: 'border-blue-200',
        full: 'blue'
      },
      research: { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        border: 'border-green-200',
        full: 'green'
      },
      project: { 
        bg: 'bg-purple-100', 
        text: 'text-purple-700', 
        border: 'border-purple-200',
        full: 'purple'
      },
      book: { 
        bg: 'bg-orange-100', 
        text: 'text-orange-700', 
        border: 'border-orange-200',
        full: 'orange'
      },
    };
    return colors[documentType]?.[type] || colors.exam[type];
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
        handleCloseUploadModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Study Resources
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Access exam papers, research papers, projects, and books shared by students and faculty. 
                {user && " Contribute to the community by sharing your resources!"}
              </p>
            </div>
            
            {user && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Document
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
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Document Type Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedType === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              {documentTypes.map(type => {
                const Icon = type.icon;
                const color = getColorClass(type.value, 'full');
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedType === type.value
                        ? `${getColorClass(type.value, 'bg')} ${getColorClass(type.value, 'text')} border ${getColorClass(type.value, 'border')}`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              
              {/* Sort Options */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Documents Grid/List */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No documents have been shared yet.'
              }
            </p>
            {user && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                <Upload className="h-5 w-5 mr-2" />
                Share First Document
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map(document => (
              <DocumentCard 
                key={document.id} 
                document={document} 
                onLike={handleLike}
                onSelect={handleSelectDocument}
                onDownload={handleDownload}
                onDelete={handleDelete}
                user={user}
                getFileIcon={getFileIcon}
                getColorClass={getColorClass}
                getUploaderName={getUploaderName}
                getUploaderInitials={getUploaderInitials}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map(document => (
              <DocumentListItem 
                key={document.id} 
                document={document} 
                onLike={handleLike}
                onSelect={handleSelectDocument}
                onDownload={handleDownload}
                onDelete={handleDelete}
                user={user}
                getFileIcon={getFileIcon}
                getColorClass={getColorClass}
                getUploaderName={getUploaderName}
                getUploaderInitials={getUploaderInitials}
              />
            ))}
          </div>
        )}

        {/* Document Detail Modal */}
        {selectedDocument && (
          <DocumentDetailModal
            document={selectedDocument}
            onClose={handleCloseModal}
            onLike={handleLike}
            onComment={handleComment}
            onDownload={handleDownload}
            onDelete={handleDelete}
            commentText={commentText}
            setCommentText={setCommentText}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
            user={user}
            getFileIcon={getFileIcon}
            getColorClass={getColorClass}
            getUploaderName={getUploaderName}
            getUploaderInitials={getUploaderInitials}
          />
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadDocumentModal
            onClose={handleCloseUploadModal}
            onUpload={handleUpload}
            uploading={uploading}
            user={user}
            documentTypes={documentTypes}
          />
        )}
      </div>
    </div>
  );
};

// Document Card Component (Grid View)
const DocumentCard = ({ document, onLike, onSelect, onDownload, onDelete, user, getFileIcon, getColorClass, getUploaderName, getUploaderInitials }) => {
  const [showOptions, setShowOptions] = useState(false);
  const Icon = getFileIcon(document.document_type);
  const colorClass = getColorClass(document.document_type);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden">
      
      {/* Header with Type */}
      <div className={`${colorClass.bg} px-4 py-3 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`h-4 w-4 ${colorClass.text}`} />
            <span className={`text-sm font-medium ${colorClass.text} capitalize`}>
              {document.document_type.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(document);
                }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            {(user?.is_representative || user?.id === document.uploaded_by?.id) && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showOptions && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit
                        setShowOptions(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(document.id);
                        setShowOptions(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-4">
          <h3 
            className="font-bold text-gray-900 cursor-pointer hover:text-blue-600 line-clamp-2 mb-2 leading-tight"
            onClick={() => onSelect(document)}
          >
            {document.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {document.description || 'No description provided.'}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(document.id);
              }}
              className={`flex items-center space-x-1 transition-all ${
                document.user_has_liked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${document.user_has_liked ? 'fill-current' : ''}`} />
              <span>{document.total_likes || document.likes?.length || 0}</span>
            </button>
            
            <button
              onClick={() => onSelect(document)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{document.comments_count || 0}</span>
            </button>

            <div className="flex items-center space-x-1 text-gray-500">
              <Eye className="h-4 w-4" />
              <span>{(document.download_count || 0) + (document.views || 0)}</span>
            </div>
          </div>
        </div>

        {/* File Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(document.created_at).toLocaleDateString()}</span>
          </div>
          <span className="font-medium">
            {document.file?.split('.').pop()?.toUpperCase() || 'FILE'}
          </span>
        </div>

        {/* Uploader Info */}
        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
            {getUploaderInitials(document)}
          </div>
          <span className="text-xs text-gray-600">
            {getUploaderName(document)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Document List Item Component (List View)
const DocumentListItem = ({ document, onLike, onSelect, onDownload, onDelete, user, getFileIcon, getColorClass, getUploaderName, getUploaderInitials }) => {
  const Icon = getFileIcon(document.document_type);
  const colorClass = getColorClass(document.document_type);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 p-6">
      <div className="flex gap-6">
        {/* Icon */}
        <div 
          className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 cursor-pointer flex items-center justify-center"
          onClick={() => onSelect(document)}
        >
          <Icon className={`h-8 w-8 ${colorClass.text}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass.bg} ${colorClass.text}`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {document.document_type.replace('_', ' ')}
                </span>
              </div>
              <h3 
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 mb-2"
                onClick={() => onSelect(document)}
              >
                {document.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {document.description || 'No description provided.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <button
                onClick={() => onLike(document.id)}
                className={`flex items-center space-x-1 transition-all ${
                  document.user_has_liked 
                    ? 'text-red-500' 
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${document.user_has_liked ? 'fill-current' : ''}`} />
                <span>{document.total_likes || document.likes?.length || 0}</span>
              </button>
              
              <button
                onClick={() => onSelect(document)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{document.comments_count || 0}</span>
              </button>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{(document.download_count || 0) + (document.views || 0)} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(document.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                  {getUploaderInitials(document)}
                </div>
                <span className="text-sm text-gray-600">
                  {getUploaderName(document)}
                </span>
              </div>

              {/* REMOVED DUPLICATE DOWNLOAD BUTTON - Only keep delete button for authorized users */}
              {(user?.is_representative || user?.id === document.uploaded_by?.id) && (
                <button
                  onClick={() => onDelete(document.id)}
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

// Document Detail Modal Component - FIXED
const DocumentDetailModal = ({ 
  document, 
  onClose, 
  onLike, 
  onComment, 
  onDownload, 
  onDelete, 
  commentText, 
  setCommentText, 
  previewUrl,
  setPreviewUrl,
  user,
  getFileIcon,
  getColorClass,
  getUploaderName,
  getUploaderInitials
}) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const Icon = getFileIcon(document.document_type);
  const colorClass = getColorClass(document.document_type);

  useEffect(() => {
    // Fetch comments for this document
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const response = await api.get(`/comments/?content_type=document&object_id=${document.id}`);
        setComments(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        // Fallback: try without filters
        try {
          const allComments = await api.get('/comments/');
          const docComments = (allComments.data.results || allComments.data).filter(
            comment => comment.object_id === parseInt(document.id)
          );
          setComments(docComments);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          setComments([]);
        }
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [document.id]);

  // Handle comment submission - FIXED
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    setSubmittingComment(true);
    try {
      console.log('Submitting comment for document:', document.id);
      
      // Try with content_type as ID (14 for documents)
      let commentData = {
        content: commentText,
        content_type: 12, // Use the ID for 'document' content type
        object_id: parseInt(document.id)
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
      
    } catch (error) {
      console.error('Error posting comment:', error);
      if (error.response) {
        console.error('Server error:', error.response.data);
        
        // If option 1 fails, try option 2 with string content_type
        if (error.response.status === 400) {
          try {
            console.log('Trying alternative content_type format...');
            const alternativeResponse = await api.post('/comments/', {
              content: commentText,
              content_type: 'document', // Try with string instead of ID
              object_id: parseInt(document.id)
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
            
          } catch (secondError) {
            console.error('Second attempt failed:', secondError);
            alert('Failed to post comment. Please try again.');
          }
        }
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle preview for PDF files
  const handlePreview = () => {
    if (document.file && document.file.toLowerCase().endsWith('.pdf')) {
      setPreviewUrl(document.file);
    }
  };

  // Handle modal backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
<div 
  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  onClick={handleBackdropClick}
>
  <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col lg:flex-row">
    
    {/* Preview Section - unchanged */}
    <div className="lg:w-1/2 bg-gray-50 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${colorClass.bg}`}>
              <Icon className={`h-6 w-6 ${colorClass.text}`} />
            </div>
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass.bg} ${colorClass.text}`}>
                {document.document_type.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        {previewUrl && document.file?.toLowerCase().endsWith('.pdf') ? (
          <iframe
            src={previewUrl}
            className="w-full h-96 rounded-lg shadow-lg"
            title="Document Preview"
          />
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon className="h-16 w-16 text-blue-400" />
            </div>
            <p className="text-gray-500 mb-6">
              Preview not available for this file type
            </p>
            <button
              onClick={() => onDownload(document)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Download File
            </button>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button
              onClick={() => onLike(document.id)}
              className={`flex items-center space-x-1 transition-all ${
                document.user_has_liked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${document.user_has_liked ? 'fill-current' : ''}`} />
              <span>{document.total_likes || document.likes?.length || 0}</span>
            </button>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-5 w-5" />
              <span>{comments.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-5 w-5" />
              <span>{(document.download_count || 0) + (document.views || 0)}</span>
            </div>
          </div>
          
          {document.file?.toLowerCase().endsWith('.pdf') && (
            <button
              onClick={handlePreview}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>{previewUrl ? 'Close Preview' : 'Preview'}</span>
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Details Section - FIXED: Made scrollable */}
    <div className="lg:w-1/2 flex flex-col h-full max-h-[90vh] overflow-hidden">
      
      {/* Header - Fixed height section */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{document.title}</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {document.description || 'No description provided.'}
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Document Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">File Type:</span>
              <p className="text-gray-900 capitalize">{document.file?.split('.').pop() || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Uploaded:</span>
              <p className="text-gray-900">{new Date(document.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Category:</span>
              <p className="text-gray-900 capitalize">{document.document_type.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Status:</span>
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

        {/* Uploader Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-sm text-white font-medium">
              {getUploaderInitials(document)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">
                  {getUploaderName(document)}
                </span>
                {document.uploaded_by?.is_representative && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Representative
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{document.uploaded_by?.batch}</p>
            </div>
            <div className="flex items-center space-x-2">
              
              {(user?.is_representative || user?.id === document.uploaded_by?.id) && (
                <button
                  onClick={() => onDelete(document.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section - Now scrollable within the details section */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Comments ({comments.length})</h3>
          
          {/* Comment Input */}
          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-6 bg-white p-4 rounded-xl border border-gray-200">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment about this resource..."
                rows="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="px-6 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {loadingComments ? (
              <div className="text-center py-8 text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
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
  );
};

// Upload Document Modal Component
const UploadDocumentModal = ({ onClose, onUpload, uploading, user, documentTypes }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'exam',
    file: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file || !formData.title) {
      alert('Please fill in all required fields');
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('document_type', formData.document_type);
    submitData.append('file', formData.file);
    
    onUpload(submitData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        alert('Please upload a valid document file (PDF, DOC, DOCX, PPT, PPTX, TXT)');
        return;
      }
      
      setFormData(prev => ({ ...prev, file: file }));
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getFileIcon = (documentType) => {
    const typeConfig = documentTypes.find(type => type.value === documentType);
    return typeConfig ? typeConfig.icon : FileText;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors relative">
              {formData.file ? (
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formData.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
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
                    PDF, DOC, DOCX, PPT, PPTX, TXT up to 10MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {documentTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, document_type: type.value }))}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      formData.document_type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </div>
                  </button>
                );
              })}
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
              placeholder="Enter document title"
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
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describe this document, include course name, professor, year, etc."
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
              disabled={uploading || !formData.file || !formData.title}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Documents;