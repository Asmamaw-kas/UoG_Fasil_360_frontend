import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  User, 
  Camera,
  Trophy,
  FileText,
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building, 
  Users, 
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';

// API service
import { api } from '../../services/api';

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    department: '',
    campus: '',
    batch: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Engineering Departments
  const engineeringDepartments = [
    {
      category: 'Core Engineering',
      departments: [
        'Civil Engineering',
        'Mechanical Engineering',
        'Electrical Engineering',
        'Chemical Engineering',
        'Computer Engineering',
        'COTM',
        'Hydrolic Engineering',
        'Architectural Engineering',
        'Industrial Engineering'
      ]
    },
    {
      category: 'Interdisciplinary Engineering',
      departments: [
        'Biotechnology',
        'Biomedical Engineering',
        'Environmental Engineering',
        'Materials Science and Engineering',
        
      ]
    }
  ];

  // Campus options
  const campuses = [
    'Fasil Campus',
    'Tedy Campus',
    'Maraki Campus',
  ];

  // Batch options (next 5 years)
  const currentYear = new Date().getFullYear();
  const batches = Array.from({ length: 6 }, (_, i) => `GC ${currentYear + i}`);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    let strength = 'Weak';
    let color = 'red';
    
    if (score >= 4) {
      strength = 'Strong';
      color = 'green';
    } else if (score >= 3) {
      strength = 'Medium';
      color = 'yellow';
    }
    
    return { checks, strength, color };
  };

  const passwordStrength = checkPasswordStrength(formData.password);

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
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength.strength === 'Weak') {
      newErrors.password = 'Password is too weak';
    }

    if (!formData.password2) {
      newErrors.password2 = 'Please confirm your password';
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.campus) {
      newErrors.campus = 'Campus is required';
    }

    if (!formData.batch) {
      newErrors.batch = 'Batch is required';
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
   
    
    const response = await api.post('/users/register/', formData);
  

    const { user: userData, access, refresh } = response.data;

    // Set user in context with tokens
    login(userData, access, refresh);
    
    setSuccess(true);
    
    // Redirect to home after successful registration
    setTimeout(() => {
      navigate('/');
    }, 2000);

  } catch (error) {
  
    // ... your error handling
  } finally {
    setLoading(false);
  }
};
  // Success message component
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Campus GC!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. You'll be redirected to the home page shortly.
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-green-200 rounded-full w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        
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

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            
            {/* Left Side - Form */}
            <div className="md:w-1/2 p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Join Campus GC
                </h2>
                <p className="text-gray-600">
                  Create your account and start exploring campus life
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{errors.general}</p>
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.first_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your first name"
                      />
                    </div>
                    {errors.first_name && (
                      <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.last_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your last name"
                      />
                    </div>
                    {errors.last_name && (
                      <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.username ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Choose a username"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Create password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.password2 ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Confirm password"
                      />
                    </div>
                    {errors.password2 && (
                      <p className="text-red-600 text-sm mt-1">{errors.password2}</p>
                    )}
                  </div>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Password Strength</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength.color === 'green' ? 'text-green-600' :
                        passwordStrength.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(passwordStrength.checks).map(([key, met]) => (
                        <div key={key} className="flex items-center space-x-2">
                          {met ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={`text-sm ${
                            met ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {key === 'length' && 'At least 8 characters'}
                            {key === 'uppercase' && 'One uppercase letter'}
                            {key === 'lowercase' && 'One lowercase letter'}
                            {key === 'number' && 'One number'}
                            {key === 'special' && 'One special character'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Academic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                          errors.department ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Department</option>
                        {engineeringDepartments.map(category => (
                          <optgroup key={category.category} label={category.category}>
                            {category.departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    {errors.department && (
                      <p className="text-red-600 text-sm mt-1">{errors.department}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campus *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="campus"
                        value={formData.campus}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                          errors.campus ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Campus</option>
                        {campuses.map(campus => (
                          <option key={campus} value={campus}>{campus}</option>
                        ))}
                      </select>
                    </div>
                    {errors.campus && (
                      <p className="text-red-600 text-sm mt-1">{errors.campus}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="batch"
                        value={formData.batch}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                          errors.batch ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Batch</option>
                        {batches.map(batch => (
                          <option key={batch} value={batch}>{batch}</option>
                        ))}
                      </select>
                    </div>
                    {errors.batch && (
                      <p className="text-red-600 text-sm mt-1">{errors.batch}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Right Side - Info */}
            <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-8 md:p-12 text-white">
              <div className="h-full flex flex-col justify-center">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-4">
                    Welcome to Your Campus Community
                  </h3>
                  <p className="text-blue-100 mb-6 leading-relaxed">
                    Join thousands of students sharing experiences, achievements, and resources. 
                    Connect with your batchmates, share campus moments, and access study materials.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Camera className="h-4 w-4" />
                      </div>
                      <span>Share campus photos and events</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <span>Celebrate student achievements</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span>Access study resources and papers</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <span>Connect with your batch community</span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-sm text-blue-100">
                      <strong>Note:</strong> Your batch determines which photo categories you can access. 
                      Representatives can upload content for their specific batch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            By creating an account, you agree to our Terms of Service and Privacy Policy. 
            Your academic information helps us provide batch-specific content and features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;