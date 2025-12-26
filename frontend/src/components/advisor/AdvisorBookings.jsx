import React, { useState, useEffect } from 'react';

const AdvisorBookings = ({ currentUser }) => {
  const [bookings, setBookings] = useState([]);
  const [userMap, setUserMap] = useState({});

  const loadData = async () => {
    try {
      // 1. Fetch All Enrollments
      const enrollmentsRes = await fetch('http://localhost:5000/api/enrollments');
      const enrollmentsData = await enrollmentsRes.json() || [];
      
      // --- FIX: Convert SQL PascalCase to camelCase ---
      const cleanEnrollments = enrollmentsData.map(e => ({
          id: e.Id,
          studentId: e.StudentId,
          courseId: e.CourseId,
          status: e.Status || 'pending', // Default to pending if null
          reason: e.Reason
      }));

      // 2. Fetch User Info (To show names instead of IDs)
      const entitiesRes = await fetch('http://localhost:5000/api/entities');
      const entitiesData = await entitiesRes.json() || [];
      
      const uMap = {};
      entitiesData.forEach(e => {
        // Backend /api/entities already handles lowercase conversion, so this is safe
        uMap[e.id] = e;
      });
      setUserMap(uMap);
      
      setBookings(cleanEnrollments);

    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (confirm(`${newStatus === 'approved' ? 'Approve' : 'Reject'} this booking?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/enrollments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (res.ok) {
            loadData(); // Refresh list to see the green/red status change
        } else {
            alert("Failed to update status");
        }
      } catch (err) {
        console.error('Error updating booking:', err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Cancel this booking?')) {
      try {
        await fetch(`http://localhost:5000/api/enrollments/${id}`, { method: 'DELETE' });
        loadData();
      } catch (err) {
        console.error('Error deleting booking:', err);
      }
    }
  };

  if (bookings.length === 0) {
    return <p className="placeholder-text">No bookings found in database.</p>;
  }

  return (
    <div className="requests-grid">
      {bookings.map((booking) => {
        // Safe User Lookup
        const user = userMap[booking.studentId] || { firstName: 'Unknown', lastName: `(${booking.studentId})` };
        const isOwnBooking = booking.studentId === currentUser.id;

        return (
          <div key={booking.id} className="request-item" style={{
              borderLeft: `5px solid ${booking.status === 'approved' ? 'green' : booking.status === 'rejected' ? 'red' : 'orange'}`
          }}>
            <div className="request-header">
              <div className="request-info">
                <h4>Course: {booking.courseId}</h4>
                <div className="request-meta">
                  Requested by: <strong>{user.firstName} {user.lastName}</strong>
                </div>
              </div>
              <span className={`request-status status-${booking.status}`}>
                {booking.status.toUpperCase()}
              </span>
            </div>
            <p className="request-reason"><strong>Reason:</strong> {booking.reason || 'N/A'}</p>
            
            <div className="request-actions">
               {/* Advisors can Approve/Reject student requests */}
               <button className="btn btn-success" onClick={() => handleStatusChange(booking.id, 'approved')}>Approve</button>
               <button className="btn btn-danger" onClick={() => handleStatusChange(booking.id, 'rejected')}>Reject</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdvisorBookings;