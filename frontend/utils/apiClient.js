import axios from 'axios';
import { getToken, setToken, removeToken } from './auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Include cookies in requests
});

// Attach the accessToken to every request
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getToken(); // Retrieve the token from Local Storage
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and refresh the token if necessary
apiClient.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true; // Prevent infinite retry loops

      try {
        // Attempt to refresh the access token
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.status === 200 && refreshResponse.data.accessToken) {
          // Update the accessToken in Local Storage
          setToken(refreshResponse.data.accessToken);

          // Retry the original request with the new access token
          error.config.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
          return apiClient.request(error.config);
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Remove the token and redirect to login if refresh fails
        removeToken();
        window.location.href = '/login';
      }
    }

    // If the error is not related to authentication, reject it
    return Promise.reject(error);
  }
);

export default apiClient;