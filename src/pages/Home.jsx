import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import herobackground from '../assets/images/herobackground.png'
import { config } from '../../environment'
import { 
  Camera, 
  Trophy, 
  FileText, 
  ArrowRight, 
  Heart, 
  MessageCircle,
  Upload,
  Users,
  Award,
  Star,
  TrendingUp,
  Clock,
  Search
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = config.API_BASE_URL;

const Home = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [recentRewards, setRecentRewards] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalRewards: 0,
    totalDocuments: 0,
  });

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured photos
      const featuredResponse = await axios.get(`${API_BASE_URL}/photos/featured/`);
      setFeaturedPhotos(featuredResponse.data.results || featuredResponse.data.slice(0, 6));

      // Fetch recent photos
      const photosResponse = await axios.get(`${API_BASE_URL}/photos/?ordering=-created_at&limit=8`);
      setRecentPhotos(photosResponse.data.results || photosResponse.data.slice(0, 8));

      // Fetch recent rewards
      const rewardsResponse = await axios.get(`${API_BASE_URL}/rewards/?ordering=-created_at&limit=6`);
      setRecentRewards(rewardsResponse.data.results || rewardsResponse.data.slice(0, 6));

      // Fetch recent documents
      const docsResponse = await axios.get(`${API_BASE_URL}/documents/?ordering=-created_at&limit=6`);
      setRecentDocuments(docsResponse.data.results || docsResponse.data.slice(0, 6));

      // Fetch real stats from API
      try {
        const photosStats = await axios.get(`${API_BASE_URL}/photos/`);
        const rewardsStats = await axios.get(`${API_BASE_URL}/rewards/`);
        const documentsStats = await axios.get(`${API_BASE_URL}/documents/`);
        console.log('fetched photos are', photosStats )
        console.log('fetched rewards are', rewardsStats )
        console.log('fetched documents are', documentsStats )

        
        const totalPhotos = photosStats.data.count || (photosStats.data.results ? photosStats.data.results.length : photosStats.data.length);
        const totalRewards = rewardsStats.data.count || (rewardsStats.data.results ? rewardsStats.data.results.length : rewardsStats.data.length);
        const totalDocuments = documentsStats.data.count || (documentsStats.data.results ? documentsStats.data.results.length : documentsStats.data.length);
        console.log('the total fetched photo is ', totalPhotos)
        
        setStats({
          totalPhotos: totalPhotos || 0,
          totalRewards: totalRewards || 0,
          totalDocuments: totalDocuments || 0,
        });
      } catch (statsError) {
        console.error('Error fetching stats:', statsError);
        // Calculate stats from fetched data if dedicated endpoints fail
        setStats({
          totalPhotos: photosResponse.data.count || (photosResponse.data.results ? photosResponse.data.results.length : photosResponse.data.length) || 0,
          totalRewards: rewardsResponse.data.count || (rewardsResponse.data.results ? rewardsResponse.data.results.length : rewardsResponse.data.length) || 0,
          totalDocuments: docsResponse.data.count || (docsResponse.data.results ? docsResponse.data.results.length : docsResponse.data.length) || 0,
          totalUsers: 0
        });
      }

    } catch (error) {
      console.error('Error fetching home data:', error);
      // Set empty arrays on error
      setFeaturedPhotos([]);
      setRecentPhotos([]);
      setRecentRewards([]);
      setRecentDocuments([]);
      setStats({
        totalPhotos: 0,
        totalRewards: 0,
        totalDocuments: 0,
        totalUsers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, number, label, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{number.toLocaleString()}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, count, color, href, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer group hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900">{count}</span>
        <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <ArrowRight className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative text-white overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: `url(${herobackground})` }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white rounded-full animate-pulse delay-700"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 inline-flex items-center space-x-2">
                <span className="font-semibold">Fasil360 Campus Community Platform</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Fasil360
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Connect, share, and celebrate campus life. Upload photos, recognize achievements, 
              and access valuable resources in one vibrant community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => navigate('/upload')}
                    className="bg-white text-primary-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center space-x-2"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Upload Content</span>
                  </button>
                  <button 
                    onClick={() => navigate('/photos')}
                    className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-primary-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Explore Gallery</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/register')}
                    className="bg-white text-primary-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                  >
                    Join Our Community
                  </button>
                  <button 
                    onClick={() => navigate('/photos')}
                    className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-primary-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Explore Features
                  </button>
                </>
              )}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <StatCard 
                icon={Camera} 
                number={stats.totalPhotos} 
                label="Photos" 
                color="bg-blue-500" 
              />
              <StatCard 
                icon={Trophy} 
                number={stats.totalRewards} 
                label="Rewards" 
                color="bg-amber-500" 
              />
              <StatCard 
                icon={FileText} 
                number={stats.totalDocuments} 
                label="Documents" 
                color="bg-emerald-500" 
              />
           
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Featured Photos Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Star className="h-4 w-4" />
              <span>Community Favorites</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4"> Favorites Photos</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Most loved campus moments curated by our community
            </p>
          </div>

          {featuredPhotos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredPhotos.map((photo, index) => (
                  <div 
                    key={photo.id}
                    className="group cursor-pointer bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                    onClick={() => navigate(`/photos/${photo.id}`)}
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={photo.image} 
                        alt={photo.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Overlay Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4" />
                              <span className="text-sm font-medium">{photo.total_likes || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">{photo.comments_count || 0}</span>
                            </div>
                          </div>
                          {photo.is_featured && (
                            <div className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                              FEATURED
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{photo.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{photo.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">By {photo.uploaded_by_name}</span>
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button 
                  onClick={() => navigate('/photos')}
                  className="bg-primary-600 text-white px-4 py-2 rounded-2xl font-bold text-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
                >
                  <Camera className="h-5 w-5" />
                  <span>View All Photos</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Featured Photos Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to upload and get featured!</p>
              {isAuthenticated && (
                <button 
                  onClick={() => navigate('/upload')}
                  className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-300"
                >
                  Upload Your First Photo
                </button>
              )}
            </div>
          )}
        </div>
      </section>
<br />
      {/* Quick Access Sections */}
      <section className="pb-20 pt-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Access</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the latest uploads across all categories
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <QuickActionCard
              icon={Camera}
              title="Photo Gallery"
              description="Explore campus moments, celebrations, and memories"
              count={stats.totalPhotos}
              color="bg-blue-500"
              onClick={() => navigate('/photos')}
            />
            <QuickActionCard
              icon={Trophy}
              title="Student Rewards"
              description="Celebrating outstanding achievements and success stories"
              count={stats.totalRewards}
              color="bg-amber-500"
              onClick={() => navigate('/rewards')}
            />
            <QuickActionCard
              icon={FileText}
              title="Resources"
              description="Exam papers, research, projects, and study materials"
              count={stats.totalDocuments}
              color="bg-emerald-500"
              onClick={() => navigate('/documents')}
            />
          </div>

          {/* Recent Content Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Photos */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Photos</h3>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {recentPhotos.length > 0 ? (
                  recentPhotos.slice(0, 3).map((photo) => (
                    <div 
                      key={photo.id}
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      onClick={() => navigate(`/photos/${photo.id}`)}
                    >
                      <img 
                        src={photo.image} 
                        alt={photo.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{photo.title}</p>
                        <p className="text-xs text-gray-500">{photo.uploaded_by_name}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Heart className="h-3 w-3" />
                        <span>{photo.total_likes || 0}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No recent photos</p>
                )}
              </div>
            </div>

            {/* Recent Rewards */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Awards</h3>
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div className="space-y-4">
                {recentRewards.length > 0 ? (
                  recentRewards.slice(0, 3).map((reward) => (
                    <div 
                      key={reward.id}
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      onClick={() => navigate(`/rewards/${reward.id}`)}
                    >
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{reward.student_name}</p>
                        <p className="text-xs text-gray-500 truncate">{reward.achievement}</p>
                      </div>
                      <div className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        {reward.student_batch}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No recent awards</p>
                )}
              </div>
            </div>

            {/* Recent Documents */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">New Resources</h3>
                <FileText className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="space-y-4">
                {recentDocuments.length > 0 ? (
                  recentDocuments.slice(0, 3).map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        doc.document_type === 'exam' ? 'bg-red-100 text-red-600' :
                        doc.document_type === 'research' ? 'bg-blue-100 text-blue-600' :
                        doc.document_type === 'project' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{doc.document_type}</p>
                      </div>
                      <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {doc.uploaded_by_name}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No recent documents</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default Home;