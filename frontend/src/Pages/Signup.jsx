// src/Pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      // Option: auto-login after signup
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username || "");
      localStorage.setItem("firstName", res.data.firstName || "");
      localStorage.setItem("lastName", res.data.lastName || "");

      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-pink-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-xl space-y-4"
      >
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-4">
          Signup
        </h2>

        <div className="flex gap-4">
          <input
            name="firstName"
            placeholder="First Name"
            required
            className="w-1/2 border border-gray-300 rounded px-4 py-2"
            onChange={handleChange}
          />
          <input
            name="lastName"
            placeholder="Last Name"
            required
            className="w-1/2 border border-gray-300 rounded px-4 py-2"
            onChange={handleChange}
          />
        </div>

        <input
          name="username"
          placeholder="Username"
          required
          className="w-full border border-gray-300 rounded px-4 py-2"
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border border-gray-300 rounded px-4 py-2"
          onChange={handleChange}
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            required
            className="w-full border border-gray-300 rounded px-4 py-2 pr-10"
            onChange={handleChange}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500 select-none"
            title={showPassword ? "Hide" : "Show"}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            className="w-full border border-gray-300 rounded px-4 py-2 pr-10"
            onChange={handleChange}
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500 select-none"
            title={showConfirmPassword ? "Hide" : "Show"}
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
        >
          Create Account
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
