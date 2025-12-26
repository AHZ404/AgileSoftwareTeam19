import React, { useState, useEffect } from "react";
import { universityDB } from "../../services/mockData";

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);

  const loadRequests = () => {
    universityDB.loadFromStorage();
    const sortedRequests = [...(universityDB.courseRequests || [])].sort(
      (a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted)
    );
    setRequests(sortedRequests);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this course request?")) {
      try {
        const index = universityDB.courseRequests.findIndex((r) => r.id === id);
        if (index !== -1) {
          universityDB.courseRequests.splice(index, 1);
          universityDB.saveToStorage();
          loadRequests();
          alert("Request deleted successfully.");
        }
      } catch (e) {
        alert("Error deleting request: " + e.message);
      }
    }
  };

  return (
    <div id="all-requests-section" className="content-section">
      <h2 style={{ color: "var(--primary)", marginBottom: "20px" }}>
        All Course Requests
      </h2>
      <div className="requests-grid">
        {requests.length === 0 ? (
          <p className="placeholder-text">No course requests found.</p>
        ) : (
          requests.map((request) => {
            const course = universityDB.getCourseById(request.courseId) || {
              title: "Unknown Course",
            };
            const student = universityDB.getStudentById(request.studentId) || {
              firstName: "Unknown",
              lastName: "",
            };

            return (
              <div
                key={request.id}
                className="request-item"
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "15px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  borderLeft: "5px solid var(--primary)",
                  position: "relative",
                }}
              >
                <div
                  className="request-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div className="request-info">
                    <h4
                      style={{
                        margin: "0 0 5px 0",
                        color: "var(--primary)",
                        fontSize: "1.1rem",
                      }}
                    >
                      {request.courseId}: {course.title}
                    </h4>
                    <div
                      className="request-meta"
                      style={{ color: "#6c757d", fontSize: "0.9rem" }}
                    >
                      Student: {student.firstName} {student.lastName} (
                      {request.studentId}) | Submitted: {request.dateSubmitted}
                    </div>
                  </div>
                  <span
                    className={`request-status status-${request.status}`}
                    style={{
                      backgroundColor:
                        request.status === "pending"
                          ? "#fff3cd"
                          : request.status === "approved"
                          ? "#d1edff"
                          : "#f8d7da",
                      color:
                        request.status === "pending"
                          ? "#856404"
                          : request.status === "approved"
                          ? "#0d6efd"
                          : "#842029",
                      padding: "5px 10px",
                      borderRadius: "15px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    {request.status}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "15px",
                    borderRadius: "5px",
                    margin: "15px 0",
                    fontSize: "0.95rem",
                  }}
                >
                  <strong>Reason:</strong>{" "}
                  {request.reason || "No reason provided."}
                </div>

                <div className="request-actions">
                  <button
                    className="btn"
                    onClick={() => handleDelete(request.id)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "8px 15px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
