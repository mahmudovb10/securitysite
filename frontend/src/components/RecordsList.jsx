import { useEffect, useState } from "react";
import { getAllPassports, deletePassport } from "../services/passportAPI";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Download, Trash2 } from "lucide-react";

const RecordItem = ({ record, user, onDelete }) => {
  const [showMedia, setShowMedia] = useState(false);

  // MUHIM: Backend manzilingizni to'g'ri ko'rsating
  const BASE_URL = "http://localhost:5000";

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm mb-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <p className="text-gray-700">
            <b>Ism:</b> {record.firstName}
          </p>
          <p className="text-gray-700">
            <b>Familiya:</b> {record.lastName}
          </p>
          <p className="text-gray-700">
            <b>Pasport:</b>{" "}
            <span className="text-indigo-600 font-mono">
              {record.passportNumber}
            </span>
          </p>
          <p className="text-gray-700">
            <b>Fuqaroligi:</b> {record.nationality || "O'zbek"}
          </p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={() => onDelete(record._id)}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition"
          >
            <Trash2 size={16} /> O'chirish
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => setShowMedia(!showMedia)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${
            showMedia
              ? "bg-gray-100 text-gray-700"
              : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
          }`}
        >
          {showMedia ? (
            <>
              <EyeOff size={18} /> Yashirish
            </>
          ) : (
            <>
              <Eye size={18} /> Fayllarni ko'rish
            </>
          )}
        </button>
      </div>

      {showMedia && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t border-dashed grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* Rasm qismi - record.image yoki record.rasmPath ekanligini tekshiring */}
          {(record.image || record.rasmPath) && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Pasport nusxasi:
              </p>
              <div className="relative group">
                <img
                  src={`${BASE_URL}${record.image || record.rasmPath}`}
                  alt="Passport"
                  className="w-full h-48 object-contain bg-white rounded border shadow-sm"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300?text=Rasm+topilmadi";
                  }}
                />
                <a
                  href={`${BASE_URL}${record.image || record.rasmPath}`}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-white text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition text-sm font-medium"
                >
                  <Download size={16} /> Rasmni yuklab olish
                </a>
              </div>
            </div>
          )}

          {/* Video qismi */}
          {(record.video || record.videoPath) && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Video fayl:
              </p>
              <video
                controls
                className="w-full h-48 bg-black rounded shadow-sm"
              >
                <source
                  src={`${BASE_URL}${record.video || record.videoPath}`}
                  type="video/mp4"
                />
                Brauzer videoni qo'llab-quvvatlamaydi.
              </video>
              <a
                href={`${BASE_URL}${record.video || record.videoPath}`}
                download
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-white text-green-600 border border-green-200 rounded hover:bg-green-50 transition text-sm font-medium"
              >
                <Download size={16} /> Videoni yuklab olish
              </a>
            </div>
          )}

          {!(
            record.image ||
            record.rasmPath ||
            record.video ||
            record.videoPath
          ) && (
            <p className="col-span-full text-center py-4 text-gray-400 italic">
              Hech qanday fayl biriktirilmagan
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const RecordsList = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const res = await getAllPassports();
      setRecords(res.data || []);
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Rostdan ham o‘chirmoqchimisiz?")) return;
    try {
      await deletePassport(id);
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert("O‘chirishda xatolik");
    }
  };

  if (loading)
    return <div className="text-center p-10 text-gray-500">Yuklanmoqda...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
        Tizimdagi barcha yozuvlar{" "}
        <span className="text-sm font-normal bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
          {records.length} ta
        </span>
      </h2>
      <div>
        {records.length > 0 ? (
          records.map((record) => (
            <RecordItem
              key={record._id}
              record={record}
              user={user}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="text-center py-10 text-gray-400">
            Hozircha ma'lumotlar mavjud emas.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecordsList;
