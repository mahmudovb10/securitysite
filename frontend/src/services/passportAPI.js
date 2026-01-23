import axios from "axios";

const API_URL = "https://securitysite-production-85d5.up.railway.app/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    // CRITICAL: Only JWT token in localStorage, NOT record data
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

/**
 * PASSPORT RECORD API CALLS
 * ALL data comes from DATABASE, NOT localStorage
 */
export const passportAPI = {
  /**
   * Upload new passport record
   * @param {FormData} formData - Form data with fields and files
   * @returns {Promise} - Uploaded record from database
   */
  uploadRecord: async (formData) => {
    const response = await api.post("/passport/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Get all uploaded records (paginated)
   * RETURNS: Only records with status='uploaded' from database
   */
  getAllRecords: async (page = 1, limit = 10) => {
    const response = await api.get("/passport/records", {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Search uploaded records (real-time)
   * SEARCHES: Only uploaded records in database
   */
  searchRecords: async (searchQuery, page = 1, limit = 10) => {
    const response = await api.get("/passport/search", {
      params: { q: searchQuery, page, limit },
    });
    return response.data;
  },

  /**
   * Get single record by ID
   */
  getRecordById: async (id) => {
    const response = await api.get(`/passport/records/${id}`);
    return response.data;
  },

  /**
   * Update record
   */
  updateRecord: async (id, formData) => {
    const response = await api.put(`/passport/records/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete record
   */
  deleteRecord: async (id) => {
    const response = await api.delete(`/passport/records/${id}`);
    return response.data;
  },

  /**
   * Download file
   */
  downloadFile: async (fileId) => {
    const response = await api.get(`/passport/files/${fileId}`, {
      responseType: "blob",
    });
    return response.data;
  },
};

/**
 * ADMIN API CALLS
 */
export const adminAPI = {
  /**
   * Get dashboard statistics from database
   * RETURNS: Real statistics, NOT mock data
   */
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  getAllUsers: async (page = 1, limit = 20) => {
    const response = await api.get("/admin/users", {
      params: { page, limit },
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getAllRecords: async (page = 1, limit = 20) => {
    const response = await api.get("/admin/records", {
      params: { page, limit },
    });
    return response.data;
  },

  getOnlineUsers: async () => {
    const response = await api.get("/admin/stats/online-users");
    return response.data;
  },

  getRecordsStats: async () => {
    const response = await api.get("/admin/stats/records");
    return response.data;
  },
};

export default api;
