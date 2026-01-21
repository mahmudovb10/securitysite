import React, { useState, useEffect } from "react";
import {
  Users,
  Database,
  Circle,
  LogOut,
  Shield,
  Trash2,
  Upload,
  AlertCircle,
} from "lucide-react";

// ============================================
// API SERVICE
// ============================================

const API_URL = "http://localhost:5000/api";

const api = {
  // Auth
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  logout: async (token) => {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Passport Records
  getRecords: async (token) => {
    const res = await fetch(`${API_URL}/passport/records`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  uploadRecord: async (token, formData) => {
    const res = await fetch(`${API_URL}/passport/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  },

  // Admin
  getStatistics: async (token) => {
    const res = await fetch(`${API_URL}/admin/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  deleteRecord: async (token, recordId) => {
    const res = await fetch(`${API_URL}/admin/records/${recordId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getAllUsers: async (token) => {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};

// ============================================
// LOGIN COMPONENT
// ============================================

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login(username, password);

      if (data.success) {
        // Store ONLY token in localStorage (no record data)
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user, data.token);
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">
          Passport Management System
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600 mb-2 font-semibold">
            Create Admin User:
          </p>
          <p className="text-xs text-gray-600">
            Run: node backend/src/scripts/createAdmin.js
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ADMIN STATISTICS COMPONENT
// ============================================

const AdminStatistics = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getStatistics(token);
        if (data.success) {
          setStats(data.statistics);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-800">
              {stats.users.total}
            </p>
          </div>
          <Users className="w-12 h-12 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Online Users</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.users.online}
            </p>
          </div>
          <Circle className="w-12 h-12 text-green-500 fill-current" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Offline Users</p>
            <p className="text-3xl font-bold text-gray-600">
              {stats.users.offline}
            </p>
          </div>
          <Circle className="w-12 h-12 text-gray-400" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Records</p>
            <p className="text-3xl font-bold text-indigo-600">
              {stats.passportRecords.total}
            </p>
          </div>
          <Database className="w-12 h-12 text-indigo-500" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// RECORDS LIST WITH EMPTY STATE
// ============================================

const RecordsList = ({ token, currentUser }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await api.getRecords(token);
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error("Failed to load records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [token]);

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      const data = await api.deleteRecord(token, recordId);
      if (data.success) {
        alert("Record deleted successfully");
        loadRecords(); // Reload list
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (error) {
      alert("Failed to delete record");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading records from database...</div>
      </div>
    );
  }

  // CRITICAL: Empty state - NO demo/mock data
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No data available
        </h3>
        <p className="text-gray-500">
          No passport records have been uploaded yet.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Upload your first record to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div key={record._id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {record.fullName}
              </h3>
              <p className="text-sm text-gray-500">
                Created by: {record.createdBy?.username}
                {record.createdByAdmin && (
                  <span className="ml-2 text-indigo-600">(Admin)</span>
                )}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(record.createdAt).toLocaleString()}
              </p>
            </div>

            {/* CRITICAL: Delete button ONLY for admin */}
            {currentUser.role === "admin" && (
              <button
                onClick={() => handleDelete(record._id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Passport #:</span>
              <p className="text-gray-800">{record.passportNumber}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Nationality:</span>
              <p className="text-gray-800">{record.nationality}</p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Date of Birth:</span>
              <p className="text-gray-800">
                {new Date(record.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Place of Birth:</span>
              <p className="text-gray-800">{record.placeOfBirth}</p>
            </div>
          </div>

          {record.comment && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-800">{record.comment}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================
// UPLOAD FORM
// ============================================

const UploadForm = ({ token, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    passportNumber: "",
    nationality: "",
    dateOfBirth: "",
    placeOfBirth: "",
    issueDate: "",
    expiryDate: "",
    comment: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate at least one file
    if (!imageFile && !videoFile) {
      setError("At least one file (image or video) is required");
      return;
    }

    setUploading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });
      if (imageFile) data.append("image", imageFile);
      if (videoFile) data.append("video", videoFile);

      const result = await api.uploadRecord(token, data);

      if (result.success) {
        alert("Record uploaded successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          passportNumber: "",
          nationality: "",
          dateOfBirth: "",
          placeOfBirth: "",
          issueDate: "",
          expiryDate: "",
          comment: "",
        });
        setImageFile(null);
        setVideoFile(null);
        onSuccess();
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Upload Passport Record</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Passport Number *
          </label>
          <input
            type="text"
            value={formData.passportNumber}
            onChange={(e) =>
              setFormData({ ...formData, passportNumber: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Nationality *
          </label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) =>
              setFormData({ ...formData, nationality: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Place of Birth *
          </label>
          <input
            type="text"
            value={formData.placeOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, placeOfBirth: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Issue Date *</label>
          <input
            type="date"
            value={formData.issueDate}
            onChange={(e) =>
              setFormData({ ...formData, issueDate: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Expiry Date *
          </label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Comment (Optional)
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) =>
            setFormData({ ...formData, comment: e.target.value })
          }
          rows="3"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Image File</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Video File (Optional)
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {uploading ? "Uploading..." : "Upload Record"}
      </button>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
  };

  const handleLogout = async () => {
    if (token) {
      await api.logout(token);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setToken(null);
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    setRefreshKey((prev) => prev + 1); // Trigger re-render
  };

  if (!currentUser || !token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold">Passport Management System</h1>
              <p className="text-sm text-gray-500">
                {currentUser.role === "admin"
                  ? "Admin Panel"
                  : "User Dashboard"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser.username}</p>
              <p className="text-xs text-gray-500">
                Status:{" "}
                <span
                  className={
                    currentUser.status === "online"
                      ? "text-green-600"
                      : "text-gray-600"
                  }
                >
                  {currentUser.status}
                </span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {currentUser.role === "admin" && <AdminStatistics token={token} />}

        {!showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload New Record
          </button>
        )}

        {showUploadForm && (
          <>
            <UploadForm token={token} onSuccess={handleUploadSuccess} />
            <button
              onClick={() => setShowUploadForm(false)}
              className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </>
        )}

        <RecordsList key={refreshKey} token={token} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default App;
