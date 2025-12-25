import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  const loadData = () => {
    universityDB.loadFromStorage();
    setBookings(universityDB.getAllBookings() || []);
    setClassrooms(universityDB.getAllClassrooms() || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this booking?')) {
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
        const room = classrooms.find(r => r.id === booking.classroomId) || { name: 'Unknown Room', id: booking.classroomId };
        const student = universityDB.getStudentById(booking.bookedBy) || universityDB.getAdvisorById(booking.bookedBy) || { firstName: 'Unknown', lastName: '', id: booking.bookedBy };

        return (
          <div key={booking.id} className="request-item">
            <div className="request-header">
              <div className="request-info">
                <h4>{room.name} ({room.id})</h4>
                <div className="request-meta">
                  Booked by: {student.firstName} {student.lastName} ({student.id}) | 
                  Date: {booking.date} {booking.startTime}-{booking.endTime}
                </div>
              </div>
              <span className={`request-status status-${booking.status || 'pending'}`}>
                {(booking.status || 'pending').toUpperCase()}
              </span>
            </div>
            <p className="request-reason"><strong>Purpose:</strong> {booking.purpose || 'N/A'}</p>
            <div className="request-actions">
              <button className="btn btn-danger" onClick={() => handleDelete(booking.id)}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminBookings;