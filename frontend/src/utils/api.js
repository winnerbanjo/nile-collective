import axios from 'axios'

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = 'https://nile-backend-9wdk.onrender.com'
// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      // Server is not running
      return Promise.reject({
        ...error,
        isServerDown: true,
        message: 'Server is starting... Please wait a moment and refresh the page.'
      })
    }
    return Promise.reject(error)
  }
)

export default api
export { API_BASE_URL }
