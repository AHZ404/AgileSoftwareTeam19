import React, { useState, useEffect } from "react";
import { universityDB } from "../../services/mockData";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    advisors: 0,
    bookings: 0,
    requests: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Load fresh data
    universityDB.loadFromStorage();
    const students = universityDB.getAllStudents() || [];
    const advisors = universityDB.advisors || [];
    const bookings = universityDB.getAllBookings() || [];
    const requests = universityDB.getAllPendingCourseRequests() || [];
    const allRequests = universityDB.courseRequests || [];

    setStats({
      students: students.length,
      advisors: advisors.length,
      bookings: bookings.length,
      requests: requests.length,
    });

    // Get 5 most recent requests for activity feed
    const activity = [...allRequests]
      .sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted))
      .slice(0, 5);
    setRecentActivity(activity);
  }, []);

  // Quick Action Handlers
  const handleResetPasswords = () => {
    if (confirm('Reset ALL user passwords to "0000"?')) {
      const users = [
        ...universityDB.students,
        ...universityDB.advisors,
        ...universityDB.admins,
      ];
      users.forEach((u) => (u.password = "0000"));
      universityDB.saveToStorage();
      alert("Passwords reset.");
    }
  };

  const handleClearRequests = () => {
    if (confirm("Clear ALL pending requests?")) {
      universityDB.courseRequests = universityDB.courseRequests.filter(
        (r) => r.status !== "pending"
      );
      universityDB.saveToStorage();
      alert("Pending requests cleared.");
      window.location.reload();
    }
  };

  const handleResetSystem = () => {
    if (confirm("Reset system to default demo state?")) {
      localStorage.removeItem("universityDB_initialized");
      universityDB.initializeData();
      window.location.reload();
    }
  };

  return (
    <div id="admin-dashboard-section" className="content-section">
      {/* Stats Row */}
      <div
        className="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* Total Students */}
        <div
          className="stat-card"
          style={{
            borderLeft: "5px solid #4361ee",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <i
            className="fas fa-users"
            style={{ fontSize: "36px", color: "#ccc" }}
          ></i>
          <div className="stat-info" style={{ textAlign: "right" }}>
            <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>
              Total Students
            </p>
            <span
              className="stat-value"
              style={{ fontSize: "28px", fontWeight: "700", color: "#212529" }}
            >
              {stats.students}
            </span>
          </div>
        </div>

        {/* Total Advisors */}
        <div
          className="stat-card"
          style={{
            borderLeft: "5px solid #f72585",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <i
            className="fas fa-user-tie"
            style={{ fontSize: "36px", color: "#ccc" }}
          ></i>
          <div className="stat-info" style={{ textAlign: "right" }}>
            <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>
              Total Advisors
            </p>
            <span
              className="stat-value"
              style={{ fontSize: "28px", fontWeight: "700", color: "#212529" }}
            >
              {stats.advisors}
            </span>
          </div>
        </div>

        {/* Active Bookings */}
        <div
          className="stat-card"
          style={{
            borderLeft: "5px solid #4cc9f0",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <i
            className="fas fa-door-open"
            style={{ fontSize: "36px", color: "#ccc" }}
          ></i>
          <div className="stat-info" style={{ textAlign: "right" }}>
            <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>
              Active Bookings
            </p>
            <span
              className="stat-value"
              style={{ fontSize: "28px", fontWeight: "700", color: "#212529" }}
            >
              {stats.bookings}
            </span>
          </div>
        </div>

        {/* Pending Requests */}
        <div
          className="stat-card"
          style={{
            borderLeft: "5px solid #3f37c9",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <i
            className="fas fa-bell"
            style={{ fontSize: "36px", color: "#ccc" }}
          ></i>
          <div className="stat-info" style={{ textAlign: "right" }}>
            <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>
              Pending Requests
            </p>
            <span
              className="stat-value"
              style={{ fontSize: "28px", fontWeight: "700", color: "#212529" }}
            >
              {stats.requests}
            </span>
          </div>
        </div>
      </div>

      {/* Widgets Row */}
      <div
        className="widgets-container"
        style={{ display: "flex", gap: "20px" }}
      >
        {/* Recent Activity Widget */}
        <div
          className="widget large"
          style={{
            flex: 3,
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              color: "#3f37c9",
              borderBottom: "1px solid #e9ecef",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            Recent User Activity
          </h3>
          <div id="admin-recent-activity">
            {recentActivity.length === 0 ? (
              <p
                className="placeholder-text"
                style={{
                  fontStyle: "italic",
                  color: "#999",
                  textAlign: "center",
                  padding: "20px",
                  border: "1px dashed #dee2e6",
                  borderRadius: "4px",
                }}
              >
                No recent activity to display.
              </p>
            ) : (
              recentActivity.map((req, idx) => {
                const student = universityDB.getStudentById(req.studentId) || {
                  firstName: "Unknown",
                  lastName: "",
                };
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #eee",
                      fontSize: "0.9rem",
                    }}
                  >
                    <strong>
                      {student.firstName} {student.lastName}
                    </strong>{" "}
                    requested course <strong>{req.courseId}</strong>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>
                      {req.dateSubmitted} - {req.status}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions Widget */}
        <div
          className="widget small"
          style={{
            flex: 2,
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              color: "#3f37c9",
              borderBottom: "1px solid #e9ecef",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            Quick Actions
          </h3>
          <div
            className="quick-actions"
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <button
              className="btn"
              onClick={handleResetPasswords}
              style={{
                background: "#4361ee",
                color: "white",
                padding: "10px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Reset All Passwords
            </button>
            <button
              className="btn"
              onClick={handleClearRequests}
              style={{
                background: "#e9ecef",
                color: "#212529",
                padding: "10px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Clear Pending Requests
            </button>
            <button
              className="btn"
              onClick={handleResetSystem}
              style={{
                background: "#d90429",
                color: "white",
                padding: "10px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Reset System Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
