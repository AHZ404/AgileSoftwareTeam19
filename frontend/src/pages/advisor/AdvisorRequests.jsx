import React, { useState, useEffect } from "react";
import { universityDB } from "../../services/mockData";

const AdvisorRequests = () => {
  const [requests, setRequests] = useState([]);

  const loadRequests = () => {
    universityDB.loadFromStorage();
    setRequests(universityDB.getAllPendingCourseRequests());
  };
  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = (id, action) => {
    if (!confirm(`Are you sure you want to ${action}?`)) return;
    if (action === "approve") universityDB.approveCourseRequest(id);
    else universityDB.rejectCourseRequest(id);
    loadRequests();
  };

  return (
    <div>
      {requests.length === 0 ? (
        <p className="placeholder-text">No pending requests.</p>
      ) : (
        requests.map((req) => {
          const student = universityDB.getStudentById(req.studentId);
          return (
            <div
              key={req.id}
              className="request-item"
              style={{ borderLeftColor: "var(--warning)" }}
            >
              <div className="request-header">
                <h4>Course: {req.courseId}</h4>
                <p>
                  Student: {student?.firstName} {student?.lastName}
                </p>
              </div>
              <p>Reason: {req.reason}</p>
              <div className="request-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleAction(req.id, "approve")}
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleAction(req.id, "reject")}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdvisorRequests;
