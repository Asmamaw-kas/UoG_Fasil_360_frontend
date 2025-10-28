import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Mail, 
  Camera,
  Trophy,
  FileText,
  Users,
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  ArrowLeft,
  UserPlus,
  Shield,
} from 'lucide-react';

// API service
import { api } from '../../services/api';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setLoading(true);
  setErrors({});

  try {
 
    
    const response = await api.post('/users/login/', formData);
  

    const { user: userData, access, refresh } = response.data;

   

    // Call login function from AuthContext with tokens
    login(userData, access, refresh);
    
    // Store remember me preference
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('userEmail', formData.email);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('userEmail');
    }
    
    
  
    navigate(from, { replace: true });

  } catch (error) {
   
   
  } finally {
    setLoading(false);
  }
};

  // Demo account login (for testing)
  const handleDemoLogin = (role) => {
    const demoAccounts = {
      student: {
        email: 'student@campusgc.com',
        password: 'demo123'
      },
      representative: {
        email: 'rep@campusgc.com',
        password: 'demo123'
      },
      admin: {
        email: 'admin@campusgc.com',
        password: 'demo123'
      }
    };

    const account = demoAccounts[role];
    setFormData(account);
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    const rememberedEmail = localStorage.getItem('userEmail');
    
    if (remembered === 'true' && rememberedEmail) {
      setRememberMe(true);
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-10">
            
            {/* Header */}
            <div className="text-center mb-8">
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to your Campus GC account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 text-sm font-medium">Login Failed</p>
                    <p className="text-red-600 text-sm mt-1">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Demo Accounts */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded transition-all duration-200 ${
                      rememberMe 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 select-none">Remember me</span>
                </label>

             
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Sign In to Campus GC
                  </div>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New to Campus GC?</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:border-blue-400 hover:text-blue-600 transition-all duration-200 hover:shadow-md"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create New Account
                </Link>
              </div>
            </form>

            {/* Features List */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Camera className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-blue-700 font-medium">Campus Photos</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <Trophy className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-green-700 font-medium">Achievements</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50">
                  <FileText className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-purple-700 font-medium">Resources</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50">
                  <Users className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                  <p className="text-xs text-orange-700 font-medium">Community</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 Your data is securely encrypted. By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;