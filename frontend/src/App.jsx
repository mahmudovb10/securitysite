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
  Eye,
  EyeOff,
  Download,
  FileText,
} from "lucide-react";

const BASE_URL = "http://localhost:5000";
const API_URL = `${BASE_URL}/api`;

const api = {
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
};

const RecordItem = ({ record, currentUser, onDelete }) => {
  const [showMedia, setShowMedia] = useState(false);

  const getMediaUrl = (path) => {
    if (!path) return "";
    const normalizedPath = path.replace(/\\/g, "/").replace(/^\//, "");
    const cleanPath = normalizedPath.replace(/^.*uploads\//, "uploads/");
    return `${BASE_URL}/${cleanPath}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4 border border-gray-100 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="text-indigo-500 w-5 h-5" />
            {record.firstName} {record.lastName}
          </h3>
          <p className="text-sm text-gray-500">
            Kiritdi: {record.createdBy?.username || "Noma'lum"}
            {record.createdByAdmin && (
              <span className="ml-2 text-indigo-600 font-medium">(Admin)</span>
            )}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(record.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowMedia(!showMedia)}
            className={`flex items-center gap-2 px-3 py-2 rounded transition ${
              showMedia
                ? "bg-gray-100 text-gray-700"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            }`}
          >
            {showMedia ? (
              <>
                <EyeOff size={16} /> Yashirish
              </>
            ) : (
              <>
                <Eye size={16} /> Ko'rish
              </>
            )}
          </button>

          {currentUser.role === "admin" && (
            <button
              onClick={() => onDelete(record._id)}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm border-b pb-4 mb-4">
        <div>
          <span className="text-gray-500">Pasport seriya:</span>
          <p className="font-mono font-bold text-gray-800">
            {record.passportNumber}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Fuqaroligi:</span>
          <p className="text-gray-800">{record.nationality}</p>
        </div>
        <div>
          <span className="text-gray-500">Tug'ilgan sanasi:</span>
          <p className="text-gray-800">
            {new Date(record.dateOfBirth).toLocaleDateString()}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Tug'ilgan joyi:</span>
          <p className="text-gray-800">{record.placeOfBirth}</p>
        </div>
      </div>

      {showMedia && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.imageFileId?.path ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase">
                  Pasport nusxasi:
                </p>
                <img
                  src={getMediaUrl(record.imageFileId.path)}
                  alt="Passport"
                  className="w-full h-48 object-contain bg-white rounded border"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300?text=Rasm+topilmadi";
                  }}
                />
                <a
                  href={getMediaUrl(record.imageFileId.path)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-blue-600 font-bold py-2 bg-white rounded border hover:bg-blue-50 transition"
                >
                  <Download size={14} /> RASMNI KO'RISH
                </a>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Rasm yuklanmagan</p>
            )}

            {record.videoFileId?.path ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase">
                  Video ma'lumot:
                </p>
                <video
                  controls
                  className="w-full h-48 bg-black rounded shadow-inner"
                >
                  <source
                    src={getMediaUrl(record.videoFileId.path)}
                    type="video/mp4"
                  />
                  Sizning brauzeringiz videoni qo'llab-quvvatlamaydi.
                </video>
                <a
                  href={getMediaUrl(record.videoFileId.path)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-green-600 font-bold py-2 bg-white rounded border hover:bg-green-50 transition"
                >
                  <Download size={14} /> VIDEONI YUKLASH
                </a>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Video yuklanmagan</p>
            )}
          </div>

          {record.comment && (
            <div className="mt-2 p-3 bg-white rounded border-l-4 border-indigo-400 italic text-sm text-gray-700">
              "{record.comment}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user, data.token);
      } else {
        setError(data.error || "Kirishda xatolik");
      }
    } catch (err) {
      setError("Ulanish xatosi");
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
        <h1 className="text-2xl font-bold text-center mb-6 font-serif tracking-tight">
          Pasport Nazorat Tizimi
        </h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Foydalanuvchi nomi"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="password"
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-2 rounded-md font-bold hover:bg-indigo-700 transition active:scale-95 shadow-lg"
          >
            {loading ? "Kirilmoqda..." : "KIRISH"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminStatistics = ({ token }) => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const fetchStats = async () => {
      const data = await api.getStatistics(token);
      if (data.success) setStats(data.statistics);
    };
    fetchStats();
  }, [token]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 font-mono">
      <div className="bg-white p-4 rounded-lg shadow border-b-4 border-blue-500 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 uppercase">Jami Foydalanuvchi</p>
          <p className="text-2xl font-bold">{stats.users.total}</p>
        </div>
        <Users className="text-blue-500 w-8 h-8 opacity-50" />
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-b-4 border-green-500 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 uppercase">Onlayn</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.users.online}
          </p>
        </div>
        <Circle className="text-green-500 fill-current w-8 h-8 opacity-50" />
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-b-4 border-gray-400 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 uppercase">Oflayn</p>
          <p className="text-2xl font-bold text-gray-600">
            {stats.users.offline}
          </p>
        </div>
        <Circle className="text-gray-400 w-8 h-8 opacity-50" />
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-b-4 border-indigo-500 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 uppercase">Jami Ma'lumotlar</p>
          <p className="text-2xl font-bold text-indigo-600">
            {stats.passportRecords.total}
          </p>
        </div>
        <Database className="text-indigo-500 w-8 h-8 opacity-50" />
      </div>
    </div>
  );
};

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

  // Label larni o'zbekchaga tarjima qilish xaritasi
  const labels = {
    firstName: "Ismi",
    lastName: "Familiyasi",
    passportNumber: "Pasport seriyasi",
    nationality: "Fuqaroligi",
    dateOfBirth: "Tug'ilgan sanasi",
    placeOfBirth: "Tug'ilgan joyi",
    issueDate: "Berilgan sana",
    expiryDate: "Amal qilish muddati",
    comment: "Izoh",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (imageFile) data.append("image", imageFile);
    if (videoFile) data.append("video", videoFile);

    const result = await api.uploadRecord(token, data);
    if (result.success) {
      alert("Muvaffaqiyatli saqlandi!");
      onSuccess();
    } else {
      alert("Xatolik: " + result.error);
    }
    setUploading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border-2 border-indigo-100">
      <h2 className="text-xl font-bold mb-6 text-indigo-800">
        Yangi Ma'lumot Qo'shish
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {Object.keys(formData).map(
          (key) =>
            key !== "comment" && (
              <div key={key}>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  {labels[key]}
                </label>
                <input
                  type={key.toLowerCase().includes("date") ? "date" : "text"}
                  placeholder={labels[key]}
                  className="w-full p-2 border rounded focus:border-indigo-500 outline-none text-sm"
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </div>
            ),
        )}
      </div>
      <div className="mb-4">
        <label className="text-xs font-bold text-gray-500 uppercase">
          {labels.comment}
        </label>
        <textarea
          placeholder="Qo'shimcha ma'lumot yoki izoh..."
          className="w-full p-2 border rounded text-sm h-20"
          value={formData.comment}
          onChange={(e) =>
            setFormData({ ...formData, comment: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 border-2 border-dashed rounded-lg bg-gray-50">
          <label className="text-xs font-bold block mb-2 tracking-widest text-center">
            RASM YUKLASH (JPG/PNG)
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-xs"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>
        <div className="p-3 border-2 border-dashed rounded-lg bg-gray-50">
          <label className="text-xs font-bold block mb-2 tracking-widest text-center">
            VIDEO YUKLASH (MP4)
          </label>
          <input
            type="file"
            accept="video/*"
            className="w-full text-xs"
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="w-full py-3 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition flex justify-center gap-2"
      >
        <Upload size={18} /> {uploading ? "Saqlanmoqda..." : "SAQLASH"}
      </button>
    </div>
  );
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [records, setRecords] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async (authToken) => {
    setLoading(true);
    const data = await api.getRecords(authToken);
    if (data.success) setRecords(data.records);
    setLoading(false);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      fetchRecords(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
    fetchRecords(authToken);
  };

  const handleLogout = async () => {
    if (token) await api.logout(token);
    localStorage.clear();
    setCurrentUser(null);
    setToken(null);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Haqiqatdan ham ushbu ma'lumotni o'chirib tashlamoqchimisiz?",
      )
    )
      return;
    const data = await api.deleteRecord(token, id);
    if (data.success) setRecords((prev) => prev.filter((r) => r._id !== id));
  };

  if (!currentUser) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-800">
            PNT <span className="text-gray-400 font-light text-sm">v2.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{currentUser.username}</p>
            <p className="text-xs text-green-500 font-bold uppercase">
              {currentUser.role === "admin" ? "Adminstrator" : "Foydalanuvchi"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Chiqish"
            className="p-2 text-red-500 hover:bg-red-50 rounded transition"
          >
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {currentUser.role === "admin" && <AdminStatistics token={token} />}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Pasport Ma'lumotlari
          </h2>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className={`px-6 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
              showUploadForm
                ? "bg-gray-200 text-gray-600"
                : "bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
            }`}
          >
            {showUploadForm ? (
              "BEKOR QILISH"
            ) : (
              <>
                <Upload size={18} /> YANGI QO'SHISH
              </>
            )}
          </button>
        </div>

        {showUploadForm && (
          <UploadForm
            token={token}
            onSuccess={() => {
              setShowUploadForm(false);
              fetchRecords(token);
            }}
          />
        )}

        {loading ? (
          <div className="text-center py-20 font-mono text-gray-400 animate-pulse">
            Ma'lumotlar yuklanmoqda...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            {records.length > 0 ? (
              records.map((record) => (
                <RecordItem
                  key={record._id}
                  record={record}
                  currentUser={currentUser}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-inner border-2 border-dashed">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">
                  Hozircha hech qanday ma'lumot yuklanmagan.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
