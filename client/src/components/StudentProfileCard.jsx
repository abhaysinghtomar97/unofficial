import { useState } from "react";
import axios from "axios";

export default function StudentProfileCard({
  profile = null,
  onProfileSaved, 
}) {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(profile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !studentId.trim()) {
      return setError("Please fill all fields.");
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/all/students?id=${studentId}`
      );

      if (!data.success) {
        setError("Student not found.");
        return;
      }

      const dbName = data.data.name.trim().toLowerCase();

      if (dbName !== name.trim().toLowerCase()) {
        setError("Name doesn't match our records.");
        return;
      }

      setStudent(data.data);

      // Parent will save it in Users collection
      onProfileSaved?.(data.data);

    } catch (err) {
      setError(
        err.response?.data?.message || "Verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Replace this with your actual image URL
  const imageUrl = student
    ? `https://your-image-api/${student.id}`
    : "";

  if (student) {
    return (
      <div className="bg-white rounded-2xl shadow border p-6">
        <div className="flex flex-col items-center">

          <img
            src={imageUrl}
            alt={student.name}
            onError={(e) => {
              e.target.src =
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(student.name);
            }}
            className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover"
          />

          <h2 className="mt-4 text-xl font-bold">
            {student.name}
          </h2>

          <span className="mt-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            ✓ Verified Student
          </span>

          <div className="mt-6 w-full space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">Roll No</span>
              <span>{student.RollNo}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Student ID</span>
              <span>{student.id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Branch</span>
              <span>{student.branch}</span>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow border p-6">

      <div className="text-center mb-5">
        <div className="text-5xl">🎓</div>

        <h2 className="text-xl font-bold mt-3">
          Complete Your Student Profile
        </h2>

        <p className="text-gray-500 text-sm mt-2">
          Add your details once to personalize your dashboard and
          display your student profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Student ID"
          className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Save Student Profile"}
        </button>

      </form>

    </div>
  );
}