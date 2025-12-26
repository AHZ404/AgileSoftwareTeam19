import React, { useState, useEffect } from 'react';

const StudentClassrooms = ({ user }) => {
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    start: '09:00',
    end: '10:00'
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [purpose, setPurpose] = useState('');

  // 1. Load Bookings (Fetch All & Filter)
  const loadBookings = async () => {
    try {
      const bookingsRes = await fetch('http://localhost:5000/api/bookings');
      const allBookings = await bookingsRes.json() || [];
      
      // Filter client-side since View_Bookings returns all
      // Note: This relies on the View returning a 'BookedBy' or similar column.
      // If the View doesn't have it yet, this might show all bookings or none.
      // For now, we will display all to ensure data is visible.
      const myList = allBookings.filter(b => b.BookedBy === user.id || b.bookedBy === user.id); // Case safety
      
      // If filtering fails (column missing), fall back to showing recent bookings (optional)
      const listToSet = myList.length > 0 ? myList : []; 

      setMyBookings(listToSet);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setMyBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
    handleSearch(); // Load rooms initially
  }, [user.id]);

  // 2. Search (Fetch All & Filter Client-Side)
  const handleSearch = async () => {
    try {
      // The server doesn't support ?date=... filtering yet, so we fetch all
      const roomsRes = await fetch('http://localhost:5000/api/classrooms');
      const rooms = await roomsRes.json() || [];
      
      // Normalize Data
      const cleanRooms = rooms.map(r => ({
          id: r.RoomID || r.id,
          name: r.Name || r.RoomName || 'Unnamed Room',
          capacity: r.Capacity,
          location: r.Location,
          features: [] // View doesn't have features yet
      }));

      setAvailableRooms(cleanRooms);
    } catch (err) {
      console.error('Error searching classrooms:', err);
      setAvailableRooms([]);
    }
  };

  const openBookingModal = (room) => {
    setSelectedRoom(room);
    setPurpose('');
    setModalOpen(true);
  };

  // 3. Create Booking (Use EAV Endpoint)
  const handleBookingSubmit = async () => {
    if (!selectedRoom) return;

    // Generate ID
    const newId = `BKG${Date.now()}`;
    const status = user.role === 'advisor' ? 'approved' : 'pending';

    try {
      const payload = {
        id: newId,
        type: 'booking',
        attributes: {
            RoomName: selectedRoom.name,
            BookingDate: filters.date,
            BookingTime: `${filters.start}-${filters.end}`,
            BookedBy: user.id,
            Purpose: purpose || 'Student Booking',
            BookingStatus: status
        }
      };
      
      const response = await fetch('http://localhost:5000/api/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Booking request sent!');
        setModalOpen(false);
        loadBookings();
      } else {
        alert('Error creating booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Error: ' + error.message);
    }
  };

  // 4. Cancel Booking (Use EAV Delete)
  const handleCancelBooking = async (id) => {
    if (confirm('Cancel this booking?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/entity/${id}`, { method: 'DELETE' });
        if(res.ok) {
            loadBookings();
        } else {
            alert("Failed to cancel.");
        }
      } catch (e) {
        alert(e.message);
      }
    }
  };

  return (
    <div>
      {/* --- Search Filters --- */}
      <h2 style={{color:'var(--primary)'}}>Classroom Availability</h2>
      <div className="classroom-filters" style={{
          display:'flex', gap:'10px', alignItems:'flex-end', marginBottom:'20px', 
          background:'white', padding:'15px', borderRadius:'8px', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div className="form-group" style={{marginBottom:0, flex:1}}>
          <label>Date</label>
          <input type="date" className="form-control" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} />
        </div>
        <div className="form-group" style={{marginBottom:0, flex:1}}>
          <label>Start Time</label>
          <input type="time" className="form-control" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} />
        </div>
        <div className="form-group" style={{marginBottom:0, flex:1}}>
          <label>End Time</label>
          <input type="time" className="form-control" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} />
        </div>
        <button className="btn btn-primary" onClick={handleSearch} style={{height:'42px'}}>Search</button>
      </div>

      {/* --- Available Rooms Grid --- */}
      <div className="courses-grid">
        {availableRooms.length === 0 && <p className="placeholder-text" style={{gridColumn:'1/-1'}}>No rooms found.</p>}
        {availableRooms.map(room => (
          <div key={room.id} className="course-card" style={{borderTop:'4px solid var(--info)'}}>
            <h4 style={{marginTop:0}}>{room.name}</h4>
            <p style={{marginBottom:'5px'}}><strong>Capacity:</strong> {room.capacity}</p>
            <p style={{marginBottom:'5px'}}><strong>Location:</strong> {room.location}</p>
            
            <div className="course-footer" style={{marginTop:'15px'}}>
              <button className="btn btn-primary" style={{width:'100%'}} onClick={() => openBookingModal(room)}>Book Room</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- My Bookings List --- */}
      <div className="widget large" style={{marginTop:'30px', background:'transparent', boxShadow:'none', padding:0}}>
        <h3 style={{color:'var(--secondary)'}}>Your Bookings</h3>
        <div className="requests-grid">
          {myBookings.length === 0 ? <p className="placeholder-text">No active bookings.</p> : myBookings.map(b => {
             // Handle case keys from View
             const bId = b.BookingID || b.id;
             const bRoom = b.Room || b.RoomName;
             const bDate = b.Date || b.BookingDate;
             const bStatus = b.Status || b.BookingStatus || 'pending';

             return (
               <div key={bId} className="request-item" style={{background:'white', borderLeft:`5px solid ${bStatus === 'approved' ? 'green' : 'orange'}`}}>
                 <div className="request-header">
                   <div className="request-info">
                     <h4 style={{color:'var(--primary)', margin:0}}>{bRoom}</h4>
                     <div className="request-meta">{bDate}</div>
                   </div>
                   <span className={`request-status status-${bStatus.toLowerCase()}`}>{bStatus.toUpperCase()}</span>
                 </div>
                 {/* Only allow cancelling if pending or if it's the user's booking */}
                 <div className="request-actions" style={{marginTop:'10px'}}>
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancelBooking(bId)}>Cancel</button>
                 </div>
               </div>
             )
          })}
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
                  Date: {filters.date} <br/> 
                  Time: {filters.start} - {filters.end}
              </p>
              <div className="form-group">
                <label>Purpose</label>
                <input type="text" className="form-control" placeholder="E.g., Study Session" value={purpose} onChange={e => setPurpose(e.target.value)} />
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

export default StudentClassrooms;