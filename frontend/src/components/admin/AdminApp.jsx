import React, { useState, useEffect } from "react";
import Sidebar from "../common/Sidebar";
import { universityDB } from "../../services/mockData";
import AdminDashboard from "./AdminDashboard";
import AdminBookings from "./AdminBookings";
import AdminRequests from "./AdminRequests"; // <--- NEW IMPORT
import SystemManagement from "./SystemManagement";
import UserManagement from "./UserManagement";

const AdminApp = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState("admin-dashboard");

  const navItems = [
    { id: "admin-dashboard", label: "Dashboard" },
    { id: "user-management", label: "User Management" },
    { id: "all-requests", label: "All Requests" }, // <--- ADDED ITEM
    { id: "all-bookings", label: "All Bookings" },
    { id: "system-management", label: "System Management" },
  ];

  return (
    <div className="container" id="admin-app-screen">
      <Sidebar
        user={user}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={onLogout}
        items={navItems}
      />
      <div className="main-content">
        <div className="header">
          <h1 style={{ color: "#4361ee" }}>
            {navItems.find((n) => n.id === activeSection)?.label}
          </h1>
        </div>

        {activeSection === "admin-dashboard" && <AdminDashboard />}

        {activeSection === "user-management" && (
          <UserManagement currentUser={user} />
        )}

        {/* --- RENDER REQUESTS COMPONENT --- */}
        {activeSection === "all-requests" && <AdminRequests />}

        {activeSection === "all-bookings" && <AdminBookings />}

        {activeSection === "system-management" && <SystemManagement />}
      </div>
    </div>
  );
};

export default AdminApp;
