import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleLogin } from "../../services/authService.js";
import { toast } from "react-toastify";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "donar",
  });

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const update = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    if (!validateEmail(form.email)) newErrors.email = "Enter a valid email";
    if (!form.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length !== 0) return;

    try {
      const result = await handleLogin({
        email: form.email,
        password: form.password,
        role: form.role,
      });

      if (result && result.success) {
        toast.success(result.message || "Login Successful!");

        if (result.token) {
          localStorage.setItem("token", result.token);
        }

        navigate("/");
      } else {
        toast.error(result?.message || "Invalid Credentials");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="login-page">

      {/* LEFT PANEL */}
      <div className="login-left">
        <img
          src="blood_donating.png"
          alt="donation"
          className="donation-img"
        />

        <div className="quote-box">
          <p className="quote q1">“A single pint can save three lives.”</p>
          <p className="quote q2">“Someone is alive today because of a donor.”</p>
          <p className="quote q3">“Donate blood — give the gift of life.”</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">

          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Login to continue helping lives ❤️</p>

          <form onSubmit={handleSubmit}>

            <label className="form-label">Select Role</label>
            <select
              className="login-input"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              required
            >
              <option value="donar">Donor</option>
              <option value="admin">Admin</option>
              <option value="hospital">Hospital</option>
              <option value="organisation">Organisation</option>
            </select>

            <label className="form-label">Email</label>
            <input
              type="email"
              className="login-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
            {errors.email && <p className="error-text">{errors.email}</p>}

            <label className="form-label">Password</label>
            <input
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
            {errors.password && <p className="error-text">{errors.password}</p>}

            <button type="submit" className="login-btn">Login</button>

            <div className="login-or">OR</div>

            <Link to="/register" className="login-outline-btn">
              Create New Account
            </Link>

          </form>
        </div>
      </div>

    </div>
  );
}
