import React, { useState, useEffect } from "react";
import { universityDB } from "../../services/mockData";

const AdvisorBookings = ({ currentUser }) => {
  const [bookings, setBookings] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  const loadData = () => {
    universityDB.loadFromStorage();
    setBookings(universityDB.getAllBookings() || []);
    setClassrooms(universityDB.getAllClassrooms() || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    if (
      confirm(
        `${newStatus === "approved" ? "Approve" : "Reject"} this booking?`
      )
    ) {
      universityDB.setBookingStatus(id, newStatus);
      loadData();
    }
  };

  const handleDelete = (id) => {
    if (confirm("Cancel this booking?")) {
      universityDB.deleteBooking(id);
      loadData();
    }
  };

  if (bookings.length === 0) {
    return <p className="placeholder-text">No bookings found.</p>;
  }

  return (
    <div className="requests-grid">
      {bookings.map((booking) => {
        const room = classrooms.find((r) => r.id === booking.classroomId) || {
          name: "Unknown Room",
          id: booking.classroomId,
        };
        const student = universityDB.getStudentById(booking.bookedBy) ||
          universityDB.getAdvisorById(booking.bookedBy) || {
            firstName: "Unknown",
            lastName: "",
            id: booking.bookedBy,
          };
        const isOwnBooking = booking.bookedBy === currentUser.id;

        return (
          <div key={booking.id} className="request-item">
            <div className="request-header">
              <div className="request-info">
                <h4>
                  {room.id}: {room.name}
                </h4>
                <div className="request-meta">
                  Booked by: {student.firstName} {student.lastName} (
                  {student.id}) | Date: {booking.date} {booking.startTime}-
                  {booking.endTime}
                </div>
              </div>
              <span
                className={`request-status status-${
                  booking.status || "pending"
                }`}
              >
                {(booking.status || "pending").toUpperCase()}
              </span>
            </div>
            <p className="request-reason">
              <strong>Purpose:</strong> {booking.purpose || "N/A"}
            </p>

            <div className="request-actions">
              {isOwnBooking ? (
                // Advisor's own booking: Can only Cancel (Edit omitted for brevity as per original strict logic)
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(booking.id)}
                >
                  Cancel
                </button>
              ) : (
                // Student booking: Approve or Reject
                <>
                  <button
                    className="btn btn-success"
                    onClick={() => handleStatusChange(booking.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleStatusChange(booking.id, "rejected")}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdvisorBookings;
