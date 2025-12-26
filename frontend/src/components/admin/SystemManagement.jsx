import React from "react";
import { universityDB } from "../../services/mockdata";

const SystemManagement = () => {
  const handleResetDatabase = () => {
    if (
      !confirm(
        "This will reset ALL system data to default demo state. This action cannot be undone. Are you sure?"
      )
    )
      return;

    try {
      localStorage.removeItem("universityDB_initialized");
      universityDB.initializeData();
      universityDB.loadFromStorage();
      alert("System data has been reset to default demo state.");
      window.location.reload(); // Reload to reflect changes globally
    } catch (err) {
      alert("Error resetting system: " + err.message);
    }
  };

  const handleResetPasswords = () => {
    if (!confirm('This will reset ALL user passwords to "0000". Are you sure?'))
      return;

    try {
      const allUsers = [
        ...universityDB.students,
        ...universityDB.advisors,
        ...universityDB.admins,
      ];
      allUsers.forEach((u) => (u.password = "0000"));
      universityDB.saveToStorage();
      alert('All user passwords have been reset to "0000".');
    } catch (err) {
      alert("Error resetting passwords: " + err.message);
    }
  };

  const handleClearRequests = () => {
    if (!confirm("This will remove ALL pending course requests. Are you sure?"))
      return;

    try {
      universityDB.courseRequests = universityDB.courseRequests.filter(
        (req) => req.status !== "pending"
      );
      universityDB.saveToStorage();
      alert("All pending course requests have been cleared.");
    } catch (err) {
      alert("Error clearing requests: " + err.message);
    }
  };

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    borderLeft: "5px solid var(--primary)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "180px",
  };

  const titleStyle = {
    color: "var(--primary)",
    fontSize: "1.2rem",
    marginBottom: "10px",
    fontWeight: "600",
  };

  const descStyle = {
    color: "#6c757d",
    marginBottom: "20px",
    fontSize: "0.95rem",
  };

  return (
    <div id="system-management-section" className="content-section">
      <div
        className="system-actions"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Database Management Card */}
        <div className="action-card" style={cardStyle}>
          <div>
            <h3 style={titleStyle}>Database Management</h3>
            <p style={descStyle}>Reset system data to default demo state</p>
          </div>
          <button
            className="btn"
            onClick={handleResetDatabase}
            style={{
              backgroundColor: "#d90429",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Reset Database
          </button>
        </div>

        {/* Password Management Card */}
        <div className="action-card" style={cardStyle}>
          <div>
            <h3 style={titleStyle}>Password Management</h3>
            <p style={descStyle}>Reset all user passwords to default</p>
          </div>
          <button
            className="btn"
            onClick={handleResetPasswords}
            style={{
              backgroundColor: "#e9ecef",
              color: "#212529",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
              width: "fit-content",
            }}
          >
            Reset All Passwords
          </button>
        </div>

        {/* Clear Pending Requests Card */}
        <div className="action-card" style={cardStyle}>
          <div>
            <h3 style={titleStyle}>Clear Pending Requests</h3>
            <p style={descStyle}>Remove all pending course requests</p>
          </div>
          <button
            className="btn"
            onClick={handleClearRequests}
            style={{
              backgroundColor: "#e9ecef",
              color: "#212529",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
              width: "fit-content",
            }}
          >
            Clear All Requests
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemManagement;
