// Environment configuration
const env = {
  development: {
    API_BASE_URL: 'http://localhost:8000/api',
    DEBUG: true
  },
  production: {
    API_BASE_URL: 'https://uog-fasil-360.onrender.com/api',
    DEBUG: false
  }
}

// Get current environment - more reliable method
const getCurrentEnv = () => {
  // Check if we're in development server
  if (import.meta.env.DEV) return 'development'
  // Check if we're in production build
  if (import.meta.env.PROD) return 'production'
  // Fallback based on hostname
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development'
  }
  return 'production'
}

export const config = env[getCurrentEnv()]
console.log('🌍 Environment:', getCurrentEnv(), 'API URL:', config.API_BASE_URL)
