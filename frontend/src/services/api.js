import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Define public paths and specific endpoints that shouldn't trigger a hard redirect
      const publicPaths = ['/', '/about', '/gallery', '/events', '/blog', '/careers', '/login', '/register', '/admin-login', '/concerts', '/festivals', '/sports'];
      const isPublicPath = publicPaths.includes(window.location.pathname) || window.location.pathname.startsWith('/blog/');

      // Also don't redirect if the request itself was for public-friendly data
      const isPublicEndpoint = error.config?.url?.includes('/profile/') || error.config?.url?.includes('/login/');

      if (!isPublicPath && !isPublicEndpoint) {
        window.location.href = '/login';
      } else {
        // If we are on a public page and auth failed (likely expired token),
        // we've cleared the token above, so reloading will fetch fresh data as a guest.
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default API;
