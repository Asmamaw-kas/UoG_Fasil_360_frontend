// Environment configuration
const env = {
  development: {
    API_BASE_URL: 'https://uog-fasil-360.onrender.com/api',
    DEBUG: true
  },
  production: {
    API_BASE_URL: 'https://uog-fasil-360.onrender.com/api',
    DEBUG: false
  }
}

// Get current environment
const currentEnv = import.meta.env.PROD ? 'production' : 'development'

export const config = env[currentEnv]