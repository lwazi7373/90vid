import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // return the config, for the request to continue.
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data   = error.response.data;

      // Extracts message regardless of which shape the backend returned
      const message = data?.message || data?.error || 'Something went wrong';

      if (status === 401) {
        // Token is missing, invalid or expired
        // Clear everything and redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (status === 503) {
        toast.error('Service unavailable. Please try again later.');
      }
      // Attach the extracted message to the error so components can read it
      // e.g. for 400 and 404 inline errors: error.userMessage
      error.userMessage = message;
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
      error.userMessage = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);