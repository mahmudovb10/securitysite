import React, { useState, useEffect } from "react";
import { adminAPI } from "../services/passportAPI";
import { Users, Circle, Database, Loader } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * FETCH REAL STATISTICS FROM DATABASE
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Get real data from database
        const data = await adminAPI.getDashboardStats();

        setStats(data.stats);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load statistics");
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Users - FROM DATABASE */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-800">
              {stats?.totalUsers || 0}
            </p>
          </div>
          <Users className="w-12 h-12 text-blue-500" />
        </div>
      </div>

      {/* Online Users - CALCULATED FROM DATABASE */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Online Users</p>
            <p className="text-3xl font-bold text-green-600">
              {stats?.onlineUsers || 0}
            </p>
          </div>
          <Circle className="w-12 h-12 text-green-500 fill-current" />
        </div>
      </div>

      {/* Offline Users - CALCULATED FROM DATABASE */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Offline Users</p>
            <p className="text-3xl font-bold text-gray-600">
              {stats?.offlineUsers || 0}
            </p>
          </div>
          <Circle className="w-12 h-12 text-gray-400" />
        </div>
      </div>

      {/* Total Uploaded Records - FROM DATABASE (status='uploaded' ONLY) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Uploaded Records</p>
            <p className="text-3xl font-bold text-indigo-600">
              {stats?.totalUploadedRecords || 0}
            </p>
          </div>
          <Database className="w-12 h-12 text-indigo-500" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
