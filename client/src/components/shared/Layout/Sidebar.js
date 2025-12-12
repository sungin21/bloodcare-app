import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const active = (path) =>
    location.pathname === path ? "sidebar-item active" : "sidebar-item";

  return (
    <div className={`sidebar-container ${document.body.classList.contains("sidebar-collapsed") ? "collapsed" : ""}`}>
      <div className="sidebar-menu">
        {user?.role === "donar" && (
          <>
            <Link to="/orgnaisation" className="sidebar-item-link">
              <div className={active("/orgnaisation")}>
                <i className="fas fa-building"></i> Organisation
              </div>
            </Link>

            <Link to="/donation" className="sidebar-item-link">
              <div className={active("/donation")}>
                <i className="fas fa-hand-holding-heart"></i> Donation
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
