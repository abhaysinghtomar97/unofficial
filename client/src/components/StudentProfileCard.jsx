import { useState } from "react";
import axios from "axios";
import { useAuth } from "../lib/auth";

export default function StudentProfileCard() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const student =
    user?.studentId &&
      user?.name &&
      user?.profileImage
      ? user
      : null;
      
  const imageUrl =
    student?.profileImage ||
    (student?.studentId
      ? user.college === "PSIT"
        ? `https://erp.psit.ac.in/assets/img/Simages/${student.studentId}.jpg`
        : `https://erp.psitche.ac.in/assets/img/Simages/${student.studentId}.jpg`
      : "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !studentId.trim()) {
      return setError("Please fill all fields.");
    }

    setLoading(true);
    setError("");

    try {
      
      const profileImage =
        user.college === "PSIT"
          ? `https://erp.psit.ac.in/assets/img/Simages/${studentId}.jpg`
          : `https://erp.psitche.ac.in/assets/img/Simages/${studentId}.jpg`;

      const { data } = await axios.post(
        "http://localhost:9000/api/profile",
        {
          username: user.username,
          name,
          studentId,
          profileImage,
        }
      );

      if (!data.success) {
        setError(data.message);
        return;
      }

      const updatedUser = {
        ...data.user,
        needProfileSetup: data.needProfileSetup,
      };

      // Update Context + LocalStorage
      setUser(updatedUser);

    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save profile."
      );
    } finally {
      setLoading(false);
    }
  };

  if (student) {
    return (
      <div className="bg-white rounded-2xl shadow border p-6">
        <div className="flex flex-col items-center">

          {imageUrl &&
            <img
              src={student.profileImage}
              alt={student.name}
              className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover"
              onError={(e) => {
                e.target.src =
                  "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(student.name);
              }}
            />}

          <h2 className="mt-4 text-xl font-bold">
            {student.name}
          </h2>

          <span className="mt-2 bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
            ✓ Verified Student
          </span>

          <div className="mt-6 w-full space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">Roll No</span>
              <span>{student.username}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Student ID</span>
              <span>{student.studentId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">College</span>
              <span>{student.college}</span>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow border p-6">

      <div className="text-center mb-6">
        <div className="text-5xl">🎓</div>

        <h2 className="text-xl font-bold mt-3">
          See Your Student Profile
        </h2>

        <p className="text-gray-500 text-sm mt-2">
          Enter your Name and Student ID once.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>

      </form>

    </div>
  );
}