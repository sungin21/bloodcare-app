import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleRegister } from "../../services/authService.js";
import { toast } from "react-toastify";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    pincode: "",
    bloodGroup: "",
    password: "",
    confirmPassword: "",
    pdfFile: null,
    agree: false,
  });

  const [errors, setErrors] = useState({});

  // VALIDATIONS
  const validatePhone = (num) => /^[6-9]\d{9}$/.test(num);
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validateAge = (n) => Number(n) >= 16;
  const validatePincode = (pin) => /^\d{6}$/.test(pin);
  const validatePDF = (file) => file && file.type === "application/pdf";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "age" && value < 0) return;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, pdfFile: file }));

    if (file && !validatePDF(file)) {
      setErrors((prev) => ({ ...prev, pdfFile: "Upload a valid PDF" }));
    } else {
      setErrors((prev) => ({ ...prev, pdfFile: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!validateEmail(form.email)) newErrors.email = "Invalid email";
    if (!validatePhone(form.phone)) newErrors.phone = "Invalid phone number";
    if (!validateAge(form.age)) newErrors.age = "Age must be 16+";
    if (!validatePincode(form.pincode)) newErrors.pincode = "Invalid pincode";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (form.pdfFile && !validatePDF(form.pdfFile))
      newErrors.pdfFile = "Invalid PDF file";
    if (!form.agree)
      newErrors.agree = "You must confirm the information is correct";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        age: form.age,
        pincode: form.pincode,
        bloodGroup: form.bloodGroup,
        password: form.password,
        agree: form.agree,
      };

      const result = await handleRegister(payload);

      if (result && result.success) {
        toast.success("Registered Successfully!");
        navigate("/login");
      } else {
        toast.error(result?.message || "Registration Failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="reg-container">
      
      {/* LEFT QUOTE SECTION */}
      <div className="quote-section">
        <h1>Be Someone's Lifeline ❤️</h1>
        <p>Your one donation can save multiple lives.</p>
      </div>

      {/* FORM SECTION */}
      <div className="form-section">
        <div className="reg-card">
          <h2>Create Account</h2>

          <form onSubmit={handleSubmit} className="form-grid-3">

            {/* NAME */}
            <div className="input-group">
              <input name="name" value={form.name} onChange={handleChange} placeholder=" " required />
              <label>Name</label>
            </div>

            {/* EMAIL */}
            <div className="input-group">
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder=" " required />
              <label>Email</label>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div></div>

            {/* PHONE */}
            <div className="input-group">
              <input name="phone" value={form.phone} onChange={handleChange} placeholder=" " required />
              <label>Phone</label>
              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>

            {/* AGE */}
            <div className="input-group">
              <input name="age" type="number" min="16" value={form.age} onChange={handleChange} placeholder=" " required />
              <label>Age</label>
              {errors.age && <p className="error-text">{errors.age}</p>}
            </div>

            {/* PINCODE */}
            <div className="input-group">
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder=" " required />
              <label>Pincode</label>
              {errors.pincode && <p className="error-text">{errors.pincode}</p>}
            </div>

            {/* BLOOD GROUP */}
            <div className="input-group">
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
                <option value="">Select Blood Group</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option>
                <option>AB+</option><option>AB-</option>
              </select>
              <label>Blood Group</label>
            </div>

            {/* PASSWORD */}
            <div className="input-group">
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder=" " required />
              <label>Password</label>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="input-group">
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder=" " required />
              <label>Confirm Password</label>
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            </div>

            {/* PDF UPLOAD */}
            <div className="file-upload full-width">
              <label className="file-label">Upload PDF (optional)</label>
              <input type="file" accept="application/pdf" onChange={handleFileChange} />
              {errors.pdfFile && <p className="error-text">{errors.pdfFile}</p>}
            </div>

            {/* AGREEMENT CHECKBOX */}
            <div className="checkbox-area full-width">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
              <span>I confirm the above information is correct.</span>
              {errors.agree && <p className="error-text">{errors.agree}</p>}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="full-width">
              <button className="reg-btn" type="submit">Register</button>
            </div>
          </form>

          <p className="login-text">
            Already have an account?
            <span onClick={() => navigate("/login")} style={{ cursor: "pointer" }}>
              Login
            </span>
          </p>
        </div>
      </div>

      {/* RIGHT VISUALS */}
      <div className="visual-section">
        <div className="stat-card">
          <div className="icon-circle">❤️</div>
          <h3>Every 2 seconds</h3>
          <p>someone needs blood.</p>

          <div className="stat-box">
            <h4>38%</h4>
            <span>eligible to donate</span>
          </div>

          <div className="stat-box">
            <h4>10%</h4>
            <span>actually donate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
