import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeader = { Authorization: token };

  // Profile form
  const [form, setForm] = useState({ firstName: "", lastName: "", username: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Eye toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (!token) return navigate("/login");
    (async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/auth/me", {
          headers: authHeader,
        });
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          username: data.username || "",
        });
        // keep localStorage in sync so header in Dashboard shows name
        localStorage.setItem("firstName", data.firstName || "");
        localStorage.setItem("lastName", data.lastName || "");
        localStorage.setItem("username", data.username || "");
      } catch (e) {
        toast.error("Session expired. Please log in again.");
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  const saveProfile = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter first and last name");
      return;
    }
    try {
      setSaving(true);
      const { data } = await axios.put(
        "http://localhost:5000/api/auth/me",
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          username: form.username.trim(), // backend checks uniqueness
        },
        { headers: authHeader }
      );
      localStorage.setItem("firstName", data.firstName || "");
      localStorage.setItem("lastName", data.lastName || "");
      localStorage.setItem("username", data.username || "");
      toast.success("Profile updated");
      navigate("/dashboard"); // go back after save (optional)
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    try {
      setChangingPass(true);
      const { data } = await axios.put(
        "http://localhost:5000/api/auth/me/password",
        { oldPassword, newPassword },
        { headers: authHeader }
      );
      toast.success(data?.message || "Password updated");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-pink-100 to-purple-100">
        <div className="bg-white p-6 rounded-xl shadow">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-pink-100 to-purple-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg border">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-purple-700">My Profile</h1>
          <Link to="/dashboard" className="text-sm text-blue-600 underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
          />
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full p-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
          <Link
            to="/dashboard"
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            Cancel
          </Link>
        </div>

        {/* Change password */}
        <h2 className="text-xl font-semibold mt-8 mb-4 text-purple-700">Change Password</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Old password */}
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-3 pr-10 border border-purple-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
            />
            <span
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500 select-none"
              title={showOld ? "Hide" : "Show"}
            >
              {showOld ? "🙈" : "👁️"}
            </span>
          </div>

          {/* New password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 pr-10 border border-purple-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
            />
            <span
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500 select-none"
              title={showNew ? "Hide" : "Show"}
            >
              {showNew ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Confirm new password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 pr-10 border border-purple-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
            />
            <span
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 cursor-pointer text-gray-500 select-none"
              title={showConfirm ? "Hide" : "Show"}
            >
              {showConfirm ? "🙈" : "👁️"}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={changePassword}
            disabled={changingPass}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            {changingPass ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
