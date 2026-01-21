import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ============================================
// frontend/src/utils/helpers.js
// Helper Functions
// ============================================

/**
 * Check if user is online (active within last 10 minutes)
 */
export const isUserOnline = (lastActiveTime) => {
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  return new Date(lastActiveTime).getTime() > tenMinutesAgo;
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Download file from blob
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Handle API errors
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.error || "An error occurred";
  } else if (error.request) {
    // Request made but no response
    return "No response from server. Please check your connection.";
  } else {
    // Something else happened
    return error.message || "An unexpected error occurred";
  }
};

/**
 * Validate passport number format
 */
export const validatePassportNumber = (passportNumber) => {
  // Basic validation: 2 letters followed by 6-9 digits
  const regex = /^[A-Z]{2}\d{6,9}$/;
  return regex.test(passportNumber);
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Create FormData from record object
 */
export const createRecordFormData = (recordData) => {
  const formData = new FormData();

  // Add text fields
  Object.keys(recordData).forEach((key) => {
    if (key !== "image" && key !== "video" && recordData[key]) {
      formData.append(key, recordData[key]);
    }
  });

  // Add files
  if (recordData.image) {
    formData.append("image", recordData.image);
  }
  if (recordData.video) {
    formData.append("video", recordData.video);
  }

  return formData;
};
