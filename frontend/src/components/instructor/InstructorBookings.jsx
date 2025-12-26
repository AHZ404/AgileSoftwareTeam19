import React, { useState, useEffect } from 'react';

const InstructorBookings = ({ user }) => {
  // Filter State
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    start: '09:00',
    end: '10:00'
  });
  
  // Data State
  const [availableRooms, setAvailableRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [purpose, setPurpose] = useState('');

  // 1. Load Instructors Bookings
  // FIX: Fetch from /api/bookings and filter by current user's ID
  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const rawBookings = await response.json();
      
      // Filter for this instructor's bookings ONLY
      // Assuming 'BookedBy' attribute stores the user ID
      // Mapping PascalCase from SQL View to useful objects
      const instructorBookings = rawBookings
        .map(b => ({
            id: b.BookingID || b.id,
            date: b.Date || b.BookingDate,
            status: b.Status || b.BookingStatus,
            roomName: b.Room || b.RoomName,
            // View_Bookings doesn't have BookedBy, might need updating view or fetching Entity
            // For now, let's assume we show all approved bookings or filter if we update the view.
            // *CRITICAL*: View_Bookings needs 'BookedBy' column to filter accurately.
            // If not present, we can't filter server side easily without extra logic.
            // Let's assume for now we list all active bookings. 
        }))
        // Optional: Filter by date to show upcoming? 
        .sort((a, b) => (a.date).localeCompare(b.date));

      setMyBookings(instructorBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    handleSearch(); // Load initial rooms
  }, [user.id]);

  // 2. Search Handler (Loads Classrooms)
  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/classrooms');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const rawRooms = await response.json();
      // Normalize
      const rooms = rawRooms.map(r => ({
          id: r.RoomID || r.id,
          name: r.Name || r.RoomName,
          capacity: r.Capacity,
          location: r.Location
      }));
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Error searching classrooms:', error);
      alert('Failed to search available classrooms');
    } finally {
      setLoading(false);
    }
  };

  // 3. Open Booking Modal
  const openBookingModal = (room) => {
    setSelectedRoom(room);
    setPurpose('');
    setModalOpen(true);
  };

  // 4. Submit Booking
  const handleBookingSubmit = async () => {
    if (!selectedRoom) return;
    
    // Generate Booking ID
    const newId = `BKG${Date.now()}`;

    try {
      // FIX: Payload matches EAV 'Attributes' table keys
      const bookingPayload = {
        id: newId,
        type: 'booking',
        attributes: {
            RoomName: selectedRoom.name, // Storing Name for easier display
            BookingDate: filters.date,
            BookingTime: `${filters.start}-${filters.end}`,
            BookedBy: user.id,
            Purpose: purpose || 'Instructor Session',
            BookingStatus: 'approved' // Instructors auto-approve
        }
      };

      const response = await fetch('/api/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      alert('Classroom booked successfully!');
      setModalOpen(false);
      loadBookings();
    } catch (error) {
      console.error('Error booking classroom:', error);
      alert('Failed to book classroom: ' + error.message);
    }
  };

  // 5. Cancel Booking
  const handleCancelBooking = async (id) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        // EAV Delete
        const response = await fetch(`/api/entity/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        loadBookings();
      } catch (error) {
        console.error('Error canceling booking:', error);
        alert('Failed to cancel booking: ' + error.message);
      }
    }
  };

  return (
    <div id="instructor-bookings-section">
       <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Book Classrooms</h2>

      {/* --- Search Filters --- */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#333' }}>Classroom Availability</h3>
      <div className="classroom-filters" style={{
          display:'flex', gap:'20px', alignItems:'flex-end', marginBottom:'30px', 
          backgroundColor:'white', padding:'20px', borderRadius:'8px', boxShadow:'0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div className="form-group" style={{marginBottom:0, flex:1}}>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'0.9rem'}}>Date</label>
          <input type="date" className="form-control" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} style={{width:'100%'}} />
        </div>
        <div className="form-group" style={{marginBottom:0, flex:1}}>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'0.9rem'}}>Start Time</label>
          <input type="time" className="form-control" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} style={{width:'100%'}} />
        </div>
        <div className="form-group" style={{marginBottom:0, flex:1}}>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'0.9rem'}}>End Time</label>
          <input type="time" className="form-control" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} style={{width:'100%'}} />
        </div>
        <button className="btn btn-primary" onClick={handleSearch} style={{height:'42px', padding: '0 25px'}}>Refresh Rooms</button>
      </div>

      {/* --- Available Rooms Grid --- */}
      {availableRooms.length === 0 ? (
          <div className="placeholder-text" style={{ marginBottom: '40px' }}>No classrooms found.</div>
      ) : (
          <div className="courses-grid" style={{ marginBottom: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {availableRooms.map(room => (
              <div key={room.id} className="course-card" style={{ borderTop: '5px solid var(--success)', padding:'15px', backgroundColor:'white', borderRadius:'8px', boxShadow:'0 2px 5px rgba(0,0,0,0.1)' }}>
                <h4 style={{margin:'0 0 10px 0'}}>{room.name}</h4>
                <p style={{fontSize:'0.9rem', margin:'5px 0'}}><strong>Capacity:</strong> {room.capacity}</p>
                <p style={{fontSize:'0.9rem', margin:'5px 0'}}><strong>Location:</strong> {room.location}</p>
                <div className="course-footer" style={{marginTop:'15px', paddingTop:'10px', borderTop:'1px solid #eee'}}>
                  <button className="btn btn-primary" style={{width:'100%'}} onClick={() => openBookingModal(room)}>Book This Room</button>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* --- My Bookings List --- */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--secondary)' }}>All Bookings</h3>
      <div className="widget large" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
        <div className="requests-grid">
          {myBookings.length === 0 ? <p className="placeholder-text">No active bookings found.</p> : myBookings.map(b => (
               <div key={b.id} className="request-item" style={{ borderLeft: '5px solid var(--primary)', backgroundColor:'white', padding:'15px', marginBottom:'10px', borderRadius:'5px' }}>
                 <div className="request-header" style={{display:'flex', justifyContent:'space-between'}}>
                   <div className="request-info">
                     <h4 style={{ color: 'var(--primary)', margin:0 }}>{b.roomName}</h4>
                     <div className="request-meta" style={{fontSize:'0.9rem', color:'#666'}}>{b.date}</div>
                   </div>
                   <span className={`request-status status-${(b.status || 'pending').toLowerCase()}`} style={{fontWeight:'bold', textTransform:'uppercase'}}>
                       {b.status}
                   </span>
                 </div>
                 {/* Only allow cancellation if we assume the user owns it or is admin-like */}
                 <div className="request-actions" style={{marginTop:'10px', textAlign:'right'}}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancelBooking(b.id)}>Cancel</button>
                 </div>
               </div>
          ))}
        </div>
      </div>

      {/* --- Booking Modal --- */}
      {modalOpen && (
        <div className="modal" style={{display:'flex'}}>
          <div className="modal-content">
            <div className="modal-header">
               <h3>Book {selectedRoom?.name}</h3>
               <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <p className="modal-info-text">
                  <strong>Date:</strong> {filters.date} <br/> 
                  <strong>Time:</strong> {filters.start} - {filters.end}
              </p>
              <div className="form-group">
                <label>Purpose</label>
                <input type="text" className="form-control" placeholder="E.g., Extra Lecture, Exam Review" 
                       value={purpose} onChange={e => setPurpose(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
               <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
               <button className="btn btn-primary" onClick={handleBookingSubmit}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorBookings;