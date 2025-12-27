import React, { useState, useEffect } from 'react';

const AdvisorBookings = ({ currentUser }) => {
  const [bookings, setBookings] = useState([]);
  const [userMap, setUserMap] = useState({});

  const loadData = async () => {
    try {
      // 1. Fetch from the Bookings View
      const bookingsRes = await fetch('http://localhost:5000/api/bookings');
      const bookingsData = await bookingsRes.json() || [];
      
      // 2. Map the SQL 'View_Bookings' columns
      const cleanBookings = bookingsData.map(b => ({
          id: b.BookingID,
          studentId: b.RequesterID,
          classroom: b.Room,
          bookingDate: b.Date,
          timeSlot: b.Time,
          status: (b.Status || 'pending').toLowerCase(), // Normalize to lowercase just in case
          reason: b.Purpose
      }));

      // --- FILTER: Hide 'approved' bookings ---
      // We only keep bookings that are NOT approved (shows pending and rejected)
      // If you want to hide rejected ones too, use: b.status === 'pending'
      const activeBookings = cleanBookings.filter(b => b.status !== 'approved');

      // 3. Fetch User Info
      const entitiesRes = await fetch('http://localhost:5000/api/entities');
      const entitiesData = await entitiesRes.json() || [];
      
      const uMap = {};
      entitiesData.forEach(e => {
        uMap[e.id] = e;
      });
      setUserMap(uMap);
      
      setBookings(activeBookings);

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
        const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (res.ok) {
            loadData(); // This triggers a reload, and the approved item will disappear
        } else {
            alert("Failed to update status");
        }
      } catch (err) {
        console.error('Error updating booking:', err);
      }
    }
  };

  if (bookings.length === 0) {
    return <p className="placeholder-text">No pending bookings found.</p>;
  }

  return (
    <div className="requests-grid">
      {bookings.map((booking) => {
        const user = userMap[booking.studentId] || { firstName: 'User', lastName: booking.studentId };
        
        const dateDisplay = booking.bookingDate 
          ? new Date(booking.bookingDate).toLocaleDateString() 
          : 'Date Not Set';

        return (
          <div key={booking.id} className="request-item" style={{
              borderLeft: `5px solid ${booking.status === 'rejected' ? 'red' : 'orange'}`
          }}>
            <div className="request-header">
              <div className="request-info">
                <h4>📍 {booking.classroom || 'Unknown Room'}</h4>
                
                <div className="booking-time-details" style={{ fontSize: '0.95em', color: '#444', marginTop: '4px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold' }}>📅 {dateDisplay}</div>
                    <div style={{ color: '#007bff' }}>⏰ {booking.timeSlot || 'All Day'}</div>
                </div>

                <div className="request-meta">
                  Requested by: <strong>{user.firstName} {user.lastName}</strong>
                </div>
              </div>
              
              <span className={`request-status status-${booking.status}`}>
                {booking.status.toUpperCase()}
              </span>
            </div>
            
            <p className="request-reason"><strong>Purpose:</strong> {booking.reason || 'N/A'}</p>
            
            <div className="request-actions">
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