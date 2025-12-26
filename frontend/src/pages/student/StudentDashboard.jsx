import React, { useState, useEffect } from "react";
import { universityDB } from "../../services/mockData";

const useForceUpdate = () => {
  const [_, setTick] = useState(0);
  return () => setTick((t) => t + 1);
};

const StudentDashboard = ({ user }) => {
  const forceUpdate = useForceUpdate();
  const [stats, setStats] = useState({
    enrolled: 0,
    pending: 0,
    completed: 0,
    gpa: 0,
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [selectedCourseMaterials, setSelectedCourseMaterials] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedRequestCourse, setSelectedRequestCourse] = useState(null);
  const [requestReason, setRequestReason] = useState("");

  const loadData = () => {
    universityDB.loadFromStorage();
    setStats({
      enrolled: universityDB.getCoursesByStudent(user.id).length,
      pending: universityDB.getPendingAssignmentsCount(user.id),
      completed: universityDB.getCompletedAssignmentsCount(user.id),
      gpa: universityDB.getStudentGPA(user.id),
    });
    setEnrolledCourses(universityDB.getCoursesByStudent(user.id));
    setUpcomingAssignments(universityDB.getUpcomingAssignments(user.id));
    setAvailableCourses(universityDB.getAvailableCoursesForStudent(user.id));
    setMyRequests(universityDB.getCourseRequestsByStudent(user.id));
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const openMaterialsModal = (course) => {
    setSelectedCourseMaterials(course);
    setMaterialsModalOpen(true);
  };
  const closeMaterialsModal = () => {
    setMaterialsModalOpen(false);
    setSelectedCourseMaterials(null);
  };
  const openRequestModal = (course) => {
    setSelectedRequestCourse(course);
    setRequestReason("");
    setRequestModalOpen(true);
  };

  const submitRequest = () => {
    if (!selectedRequestCourse) return;
    try {
      const request = {
        studentId: user.id,
        courseId: selectedRequestCourse.id,
        reason: requestReason || "No reason provided",
        dateSubmitted: new Date().toISOString().split("T")[0],
        status: "pending",
      };
      universityDB.createCourseRequest(request);
      alert("Request Submitted Successfully!");
      setRequestModalOpen(false);
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div id="dashboard-section" className="content-section">
      <div className="dashboard-grid">
        <div className="stat-card primary">
          <i className="fas fa-book"></i>
          <div className="stat-info">
            <p>Current Courses</p>
            <span className="stat-value">{stats.enrolled}</span>
          </div>
        </div>
        <div className="stat-card warning">
          <i className="fas fa-exclamation-triangle"></i>
          <div className="stat-info">
            <p>Pending Assignments</p>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card success">
          <i className="fas fa-graduation-cap"></i>
          <div className="stat-info">
            <p>Cumulative GPA</p>
            <span className="stat-value">{stats.gpa.toFixed(2)}</span>
          </div>
        </div>
        <div className="stat-card info">
          <i className="fas fa-check-circle"></i>
          <div className="stat-info">
            <p>Completed Assignments</p>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
      </div>

      <div className="widgets-container">
        <div className="widget large">
          <h3
            style={{
              color: "var(--secondary)",
              borderBottom: "2px solid #e9ecef",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            Current Courses
          </h3>
          <div className="courses-grid">
            {enrolledCourses.length === 0 ? (
              <p className="placeholder-text">
                Not enrolled in any courses yet.
              </p>
            ) : (
              enrolledCourses.map((c) => (
                <div
                  key={c.id}
                  className="course-card"
                  style={{
                    borderTop: `4px solid ${c.color || "var(--primary)"}`,
                    borderRadius: "8px",
                    backgroundColor: "white",
                    padding: "15px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "140px",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: "0 0 5px 0",
                        fontSize: "1.1rem",
                        color: "#333",
                      }}
                    >
                      {c.id}: {c.title}
                    </h4>
                    <p
                      style={{
                        color: "#6c757d",
                        fontSize: "0.9rem",
                        margin: 0,
                      }}
                    >
                      Credits: {c.credits}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", marginTop: "15px" }}>
                    <button
                      onClick={() => openMaterialsModal(c)}
                      style={{
                        backgroundColor: "#4cc9f0",
                        color: "#212529",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="fas fa-file-alt"></i> View Materials
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="widget small">
          <h3
            style={{
              color: "var(--secondary)",
              borderBottom: "2px solid #e9ecef",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            Upcoming Deadlines
          </h3>
          <div className="assignments-list">
            {upcomingAssignments.length === 0 ? (
              <p className="placeholder-text">No upcoming assignments.</p>
            ) : (
              upcomingAssignments.map((a) => (
                <div key={a.id} className="assignment-item">
                  <div className="assignment-name">{a.title}</div>
                  <div className="priority medium">Pending</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="widgets-container" style={{ marginTop: "30px" }}>
        <div className="widget large">
          <h3
            style={{
              color: "var(--secondary)",
              borderBottom: "2px solid #e9ecef",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            Available Courses (Quick Browse)
          </h3>
          <div className="courses-grid" style={{ gridTemplateColumns: "1fr" }}>
            {availableCourses.length === 0 ? (
              <p className="placeholder-text">
                No available courses to display.
              </p>
            ) : (
              availableCourses.slice(0, 3).map((course) => {
                const instructor = universityDB.getAdvisorById(
                  course.instructorId
                ) || { firstName: "Staff", lastName: "" };
                return (
                  <div
                    key={course.id}
                    className="course-card"
                    style={{
                      borderTop: `4px solid ${
                        course.color || "var(--primary)"
                      }`,
                      marginBottom: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <h4 style={{ margin: 0 }}>
                        {course.id}: {course.title}
                      </h4>
                      <span
                        style={{
                          backgroundColor: "var(--primary)",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                        }}
                      >
                        {course.credits} Credits
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "0.9rem",
                        color: "#555",
                      }}
                    >
                      <strong>Instructor:</strong> {instructor.firstName}{" "}
                      {instructor.lastName}
                    </p>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "0.9rem",
                        color: "#555",
                      }}
                    >
                      <strong>Schedule:</strong> {course.schedule} |{" "}
                      {course.location}
                    </p>
                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                      <button
                        onClick={() => openRequestModal(course)}
                        style={{
                          backgroundColor: "#f72585",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        +Request
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="widget large">
          <h3
            style={{
              color: "var(--secondary)",
              borderBottom: "2px solid #e9ecef",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            My Course Requests
          </h3>
          <div className="assignments-list">
            {myRequests.length === 0 ? (
              <p
                className="placeholder-text"
                style={{
                  fontStyle: "italic",
                  color: "#999",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                You have no submitted course registration requests.
              </p>
            ) : (
              myRequests.map((r) => {
                const course = universityDB.getCourseById(r.courseId);
                const courseTitle = course ? course.title : "Unknown Course";
                return (
                  <div
                    key={r.id}
                    className="request-item"
                    style={{
                      borderLeft: `4px solid ${
                        r.status === "pending"
                          ? "var(--warning)"
                          : r.status === "approved"
                          ? "var(--success)"
                          : "var(--danger)"
                      }`,
                      backgroundColor: "white",
                      padding: "15px",
                      borderRadius: "4px",
                      marginBottom: "10px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                      }}
                    >
                      <h4 style={{ margin: 0, fontSize: "1rem" }}>
                        {r.courseId}: {courseTitle}
                      </h4>
                      <span
                        className={`status-${r.status}`}
                        style={{
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          backgroundColor:
                            r.status === "pending"
                              ? "#fff3cd"
                              : r.status === "approved"
                              ? "#d1edff"
                              : "#f8d7da",
                          color:
                            r.status === "pending"
                              ? "#856404"
                              : r.status === "approved"
                              ? "#0d6efd"
                              : "#842029",
                        }}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                    <p
                      style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}
                    >
                      Submitted: {r.dateSubmitted}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {materialsModalOpen && selectedCourseMaterials && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3 style={{ color: "var(--primary)" }}>
                {selectedCourseMaterials.id}: {selectedCourseMaterials.title}{" "}
                Materials
              </h3>
              <span className="close" onClick={closeMaterialsModal}>
                &times;
              </span>
            </div>
            <div className="modal-body">
              <div
                style={{
                  backgroundColor: "#e9ecef",
                  padding: "10px",
                  borderRadius: "4px",
                  marginBottom: "20px",
                  color: "#6c757d",
                  fontSize: "0.9rem",
                }}
              >
                Instructor:{" "}
                {
                  universityDB.getAdvisorById(
                    selectedCourseMaterials.instructorId
                  )?.firstName
                }{" "}
                {
                  universityDB.getAdvisorById(
                    selectedCourseMaterials.instructorId
                  )?.lastName
                }
              </div>
              <div
                className="materials-list"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {selectedCourseMaterials.materials &&
                selectedCourseMaterials.materials.length > 0 ? (
                  selectedCourseMaterials.materials.map((mat, index) => (
                    <div
                      key={index}
                      className="material-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                    >
                      <i
                        className={`fas fa-${mat.icon || "file"}`}
                        style={{
                          fontSize: "1.2rem",
                          color: "var(--primary)",
                          marginRight: "15px",
                          width: "20px",
                          textAlign: "center",
                        }}
                      ></i>
                      <span style={{ fontWeight: "500", color: "#212529" }}>
                        {mat.title} ({mat.type?.toUpperCase() || "FILE"})
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ padding: "10px", fontStyle: "italic" }}>
                    No materials available.
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeMaterialsModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {requestModalOpen && selectedRequestCourse && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request {selectedRequestCourse.title}</h3>
              <span
                className="close"
                onClick={() => setRequestModalOpen(false)}
              >
                &times;
              </span>
            </div>
            <div className="modal-body">
              <p className="modal-info-text">
                You are about to request registration for{" "}
                <strong>{selectedRequestCourse.id}</strong>.
              </p>
              <div className="form-group">
                <label>Reason for Request</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Optional: Explain why you want to take this course..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setRequestModalOpen(false)}
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
  );
};

export default StudentDashboard;
