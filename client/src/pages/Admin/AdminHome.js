// client/src/pages/Admin/AdminHome.js

import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Layout from "../../components/shared/Layout/Layout";

const AdminHome = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Layout>
      <div className="admin-page">
        {/* HEADER */}
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">
          Manage donors, hospitals and organisations in the BloodCare system.
        </p>

        {/* TOP CARDS */}
        <div className="admin-cards">
          <div className="admin-card">
            <h3>Welcome</h3>
            <p className="admin-main-text">
              {user?.name || user?.hospitalName || user?.organisationName}
            </p>
            <p className="admin-muted">
              You are logged in as <span className="admin-pill">{user?.role}</span>
            </p>
          </div>

          <div className="admin-card">
            <h3>Quick Insight</h3>
            <p className="admin-muted">
              Use the sections below to review registrations and keep the blood bank
              data accurate and up to date.
            </p>
          </div>

          <div className="admin-card">
            <h3>Tip</h3>
            <p className="admin-muted">
              Regularly review pending hospitals and organisation registrations to
              ensure only verified partners can request or donate blood.
            </p>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="admin-section">
          <h2 className="admin-section-title">Management Sections</h2>

          <div className="admin-links">
            <Link to="/donar-list" className="admin-link-card">
              <h4>Donor List</h4>
              <p>View and manage all registered donors.</p>
            </Link>

            <Link to="/hospital-list" className="admin-link-card">
              <h4>Hospital List</h4>
              <p>Monitor hospital accounts and their requests.</p>
            </Link>

            <Link to="/org-list" className="admin-link-card">
              <h4>Organisation List</h4>
              <p>Manage NGOs or organisations partnering with the blood bank.</p>
            </Link>

            <Link to="/admin/pending-hospitals" className="admin-link-card">
              <h4>Pending Approvals</h4>
              <p>Review and approve newly registered hospitals.</p>
            </Link>

            <Link to="/admin/locations" className="admin-link-card">
              <h4>Locations</h4>
              <p>Check stored locations for donors and hospitals.</p>
            </Link>
          </div>
        </div>

        {/* INFO TEXT */}
        <div className="admin-section">
          <h2 className="admin-section-title">Your Responsibility</h2>
          <p className="admin-muted">
            As an administrator you control the quality and safety of the blood
            donation network. Keeping records clean, verifying partners, and
            monitoring activity helps ensure that blood reaches the people who need
            it as quickly and safely as possible. ❤️
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminHome;
