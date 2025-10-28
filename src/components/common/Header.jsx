import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';

import { 
  Camera, 
  Trophy, 
  FileText, 
  Search, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Award,
  Upload
} from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Photos', href: '/photos', icon: Camera },
    { name: 'Rewards', href: '/rewards', icon: Trophy },
    { name: 'Documents', href: '/documents', icon: FileText },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="shadow-lg sticky top-0 z-50 border-b border-gray-200 backdrop-blur-sm"
  style={{ backgroundColor: "aliceblue" }}>
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
         
          <Link to="/" className="flex items-center space-x-2 mr-4 group">
            
            <div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                 Fasil360
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActiveRoute(item.href)
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-b-2 '
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 transform hover:-translate-y-0.5'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search photos, rewards, documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 px-3 py-3 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors opacity-0 group-focus-within:opacity-100"
                >
                  search
                </button>
              </div>
            </form>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Button */}
            <button 
              onClick={() => navigate('/search')}
              className="lg:hidden p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                >
                  <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-medium">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user.batch}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {user.department} • {user.batch}
                        </p>
                        {user.is_representative && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Representative
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                      >
                        <User className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                        My Profile
                      </Link>
                      
                      {user.is_representative && (
                        <Link
                          to="/upload"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                        >
                          <Upload className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                          Upload Content
                        </Link>
                      )}
                      
                      {!user.is_representative && (
                        <Link
                          to="/representative-request"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                        >
                          <Award className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                          Become Representative
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group rounded-b-xl"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-in slide-in-from-top duration-200">
          <div className="px-4 py-3 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="pb-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
                />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActiveRoute(item.href)
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}

            {/* Mobile User Options for logged in users */}
            {user && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  <User className="h-5 w-5 mr-3" />
                  My Profile
                </Link>
                {user.is_representative && (
                  <Link
                    to="/upload"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    <Upload className="h-5 w-5 mr-3" />
                    Upload Content
                  </Link>
                )}
                {!user.is_representative && (
                  <Link
                    to="/representative-request"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    <Award className="h-5 w-5 mr-3" />
                    Become Representative
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;