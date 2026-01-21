import { useEffect, useState } from "react";
import { getAllPassports, deletePassport } from "../services/passportAPI";
import { useAuth } from "../contexts/AuthContext";

const RecordsList = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const res = await getAllPassports();
      setRecords(res.data || []);
    } catch (err) {
      console.error("Failed to fetch records", err);
      setRecords([]);
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

  if (loading) {
    return <p>Yuklanmoqda...</p>;
  }

  if (records.length === 0) {
    return <p>Ma’lumotlar hali yuklanmagan</p>;
  }

  return (
    <div>
      <h2>Yuklangan pasport ma’lumotlari</h2>

      {records.map((record) => (
        <div
          key={record._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <p>
            <b>Ism:</b> {record.firstName}
          </p>
          <p>
            <b>Familiya:</b> {record.lastName}
          </p>
          <p>
            <b>Pasport raqami:</b> {record.passportNumber}
          </p>

          {record.fileUrl && (
            <a href={record.fileUrl} target="_blank" rel="noreferrer">
              Faylni ko‘rish
            </a>
          )}

          {user?.role === "admin" && (
            <div style={{ marginTop: "10px" }}>
              <button onClick={() => handleDelete(record._id)}>
                O‘chirish
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecordsList;
