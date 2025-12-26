import React, { useState, useEffect } from "react";
import { universityDB } from "../../services/mockData";

const StudentCourses = ({ user }) => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reason, setReason] = useState("");

  const loadData = () => {
    universityDB.loadFromStorage();
    setAvailableCourses(universityDB.getAvailableCoursesForStudent(user.id));
    setMyRequests(universityDB.getCourseRequestsByStudent(user.id));
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleRequestClick = (course) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const submitRequest = () => {
    if (!selectedCourse) return;
    const request = {
      studentId: user.id,
      courseId: selectedCourse.id,
      reason: reason || "No reason provided",
      dateSubmitted: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    universityDB.createCourseRequest(request);
    setModalOpen(false);
    setReason("");
    loadData();
    alert("Request Submitted!");
  };

  return (
    <div>
      <h2>Available Courses</h2>
      <div className="courses-grid">
        {availableCourses.length === 0 ? (
          <p className="placeholder-text">No available courses.</p>
        ) : (
          availableCourses.map((course) => {
            const instructor = universityDB.getAdvisorById(
              course.instructorId
            ) || { firstName: "Staff", lastName: "" };
            return (
              <div
                key={course.id}
                className="course-card"
                style={{ borderTopColor: course.color || "var(--primary)" }}
              >
                <div className="course-header">
                  <h4 style={{ fontSize: "1.2rem", margin: 0 }}>
                    {course.id}: {course.title}
                  </h4>
                  <span
                    className="course-credits"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    {course.credits} Credits
                  </span>
                </div>
                <div style={{ marginTop: "10px", color: "#444" }}>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Instructor:</strong> {instructor.firstName}{" "}
                    {instructor.lastName}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Schedule:</strong> {course.schedule} |{" "}
                    {course.location}
                  </p>
                </div>
                <p
                  className="course-description"
                  style={{
                    fontStyle: "italic",
                    color: "#666",
                    marginTop: "10px",
                    marginBottom: "15px",
                  }}
                >
                  {course.description}
                </p>
                <div
                  className="course-footer"
                  style={{
                    borderTop: "1px solid #eee",
                    paddingTop: "15px",
                    textAlign: "right",
                  }}
                >
                  <button
                    className="btn btn-register"
                    onClick={() => handleRequestClick(course)}
                    style={{
                      backgroundColor: "#f72585",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    +Register Course
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <h2 style={{ marginTop: "40px" }}>My Requests</h2>
      <div className="requests-grid">
        {myRequests.length === 0 ? (
          <p className="placeholder-text">No requests found.</p>
        ) : (
          myRequests.map((r) => (
            <div
              key={r.id}
              className="request-item"
              style={{
                borderLeftColor:
                  r.status === "pending"
                    ? "var(--warning)"
                    : r.status === "approved"
                    ? "var(--success)"
                    : "var(--danger)",
                marginTop: "10px",
              }}
            >
              <div className="request-header">
                <h4>{r.courseId}</h4>
                <span className={`request-status status-${r.status}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                Reason: {r.reason}
              </p>
            </div>
          ))
        )}

        {modalOpen && (
          <div className="modal" style={{ display: "flex" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Request {selectedCourse?.title}</h3>
                <span className="close" onClick={() => setModalOpen(false)}>
                  &times;
                </span>
              </div>
              <div className="modal-body">
                <p className="modal-info-text">
                  You are about to request registration for{" "}
                  <strong>{selectedCourse?.id}</strong>.
                </p>
                <div className="form-group">
                  <label>Reason for Request</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Optional: Explain why you want to take this course..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={submitRequest}>
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourses;
