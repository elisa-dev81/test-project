import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a response interceptor for error handling
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || error.message || 'خطایی رخ داده است';
    return Promise.reject(new Error(message));
  }
);

export default api;