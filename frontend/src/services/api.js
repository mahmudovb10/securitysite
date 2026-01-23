import axios from "axios";
const API_URL = "https://securitysite-production.up.railway.app/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ============================================
// Authentication API
// ============================================

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// ============================================
// Users API
// ============================================

export const usersAPI = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },
};

// ============================================
// Records API
// ============================================

export const recordsAPI = {
  createRecord: async (formData) => {
    const response = await api.post("/records", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getAllRecords: async (page = 1, limit = 10) => {
    const response = await api.get("/records", {
      params: { page, limit },
    });
    return response.data;
  },

  getRecordById: async (id) => {
    const response = await api.get(`/records/${id}`);
    return response.data;
  },

  updateRecord: async (id, formData) => {
    const response = await api.put(`/records/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteRecord: async (id) => {
    const response = await api.delete(`/records/${id}`);
    return response.data;
  },

  downloadFile: async (fileId) => {
    const response = await api.get(`/records/files/${fileId}`, {
      responseType: "blob",
    });
    return response.data;
  },
};

// ============================================
// Admin API
// ============================================

export const adminAPI = {
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
