import React from "react";
import { BiDonateBlood, BiUserCircle } from "react-icons/bi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="top-navbar">
      
      {/* LEFT SIDE */}
      <div className="nav-left">
        <button
  className="sidebar-toggle"
  onClick={() => document.body.classList.toggle("sidebar-collapsed")}
>
  <i className="fa-solid fa-bars"></i>
</button>


        <BiDonateBlood size={24} color="#c62828" />
        <span className="brand-title">BloodCare</span>
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">
        <div className="user-info">
          <BiUserCircle size={22} />
          <span className="user-name">
            {user?.name || user?.hospitalName || user?.organisationName}
          </span>
          <span className="user-role">{user?.role}</span>
        </div>

        {location.pathname === "/" ? (
          <Link to="/analytics" className="nav-link">Analytics</Link>
        ) : (
          <Link to="/" className="nav-link">Home</Link>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </div>
  );
};

export default Header;
