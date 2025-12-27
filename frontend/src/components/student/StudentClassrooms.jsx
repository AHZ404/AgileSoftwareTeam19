import React, { useState, useEffect } from 'react';

const StudentClassrooms = ({ user }) => {
  // --- State ---
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    start: '09:00',
    end: '10:00'
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  
  // State for Lists
  const [myBookings, setMyBookings] = useState([]);      // Shows ALL my history
  const [pendingRequests, setPendingRequests] = useState([]); // Shows only PENDING (for advisors)
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [purpose, setPurpose] = useState('');

  // --- 1. Load Data (Fixed Logic) ---
  const loadData = async () => {
    try {
      // A. Load All Bookings
      const bookingsRes = await fetch('http://localhost:5000/api/bookings');
      const allBookings = await bookingsRes.json() || [];
      console.log("--- DEBUG BOOKINGS DATA ---");
      allBookings.forEach(b => {
          console.log(`Booking: ${b.BookingID} | Status: ${b.Status} | Requester: ${b.RequesterID}`);
          });
      
      // B. Filter: "My Bookings" (SHOW EVERYTHING: Pending, Approved, Rejected)
      // We do NOT filter by status here, so approved items stay visible.
      const myOwn = allBookings.filter(b => 
        (b.RequesterID === user.id || b.bookedBy === user.id)
      );
      setMyBookings(myOwn);

      // C. Filter: "Pending Requests" (For Advisors Only)
      // This list ONLY shows pending items because the advisor needs to act on them.
      if (user.role === 'advisor') {
        const pending = allBookings.filter(b => {
          const status = (b.Status || b.BookingStatus || 'pending').toLowerCase();
          return status === 'pending' && b.RequesterID !== user.id;
        });
        setPendingRequests(pending);
      }

    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const loadRooms = async () => {
    try {
      const roomsRes = await fetch('http://localhost:5000/api/classrooms');
      const rooms = await roomsRes.json() || [];
      
      const cleanRooms = rooms.map(r => ({
          id: r.RoomID || r.id,
          name: r.Name || r.RoomName || 'Unnamed Room',
          capacity: r.Capacity,
          location: r.Location
      }));
      setAvailableRooms(cleanRooms);
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadRooms();
  }, [user.id, user.role]); 

  // --- 2. Booking Logic (Create) ---
  const openBookingModal = (room) => {
    // Conflict Check
    const isConflict = myBookings.some(b => 
        (b.Room === room.name || b.RoomName === room.name) &&
        (b.Date === filters.date || b.BookingDate === filters.date) &&
        (b.Time === `${filters.start}-${filters.end}` || b.BookingTime === `${filters.start}-${filters.end}`) &&
        (b.Status !== 'rejected') // Optional: Allow re-booking if previous was rejected
    );

    if (isConflict) {
        alert("You have already booked this room for this date and time!");
        return; 
    }
    
    setSelectedRoom(room);
    setPurpose('');
    setModalOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedRoom) return;

    const status = user.role === 'advisor' ? 'approved' : 'pending';
    const newId = `BKG${Date.now()}`;

    try {
      const payload = {
        id: newId,
        type: 'booking',
        attributes: {
            RoomName: selectedRoom.name,
            BookingDate: filters.date,
            BookingTime: `${filters.start}-${filters.end}`,
            BookedBy: user.id,
            Purpose: purpose || (user.role === 'advisor' ? 'Advisor Reservation' : 'Student Booking'),
            BookingStatus: status
        }
      };
      
      const res = await fetch('http://localhost:5000/api/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(user.role === 'advisor' ? 'Room Booked Successfully!' : 'Request Sent! Waiting for approval.');
        setModalOpen(false);
        loadData();
      } else {
        alert('Error creating booking');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // --- 3. Advisor Logic (Approve/Reject) ---
  const handleReview = async (bookingId, decision) => {
    if (!confirm(`${decision === 'approved' ? 'Approve' : 'Reject'} this booking?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision })
      });

      if (res.ok) {
        loadData(); 
      } else {
        alert("Failed to update booking status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 4. Cancel Logic ---
  const handleCancel = async (id) => {
    if (confirm('Cancel this booking?')) {
      await fetch(`http://localhost:5000/api/entity/${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  return (
    <div>
     
      {/* --- SECTION B: SEARCH FILTERS --- */}
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
      </div>

      {/* --- SECTION C: AVAILABLE ROOMS --- */}
      <div className="courses-grid" style={{marginBottom:'30px'}}>
        {availableRooms.map(room => (
          <div key={room.id} className="course-card" style={{borderTop:'4px solid var(--info)'}}>
            <h4 style={{marginTop:0}}>{room.name}</h4>
            <p style={{marginBottom:'5px'}}><strong>Capacity:</strong> {room.capacity}</p>
            <p><strong>Location:</strong> {room.location}</p>
            <button className="btn btn-primary" style={{width:'100%', marginTop:'10px'}} onClick={() => openBookingModal(room)}>
               {user.role === 'advisor' ? 'Reserve Now' : 'Request Booking'}
            </button>
          </div>
        ))}
      </div>

      {/* --- SECTION D: MY BOOKINGS (SHOWS ALL STATUSES) --- */}
      <div className="widget large" style={{background:'transparent', padding:0, boxShadow:'none'}}>
        <h3 style={{color:'var(--secondary)'}}>Your Bookings</h3>
        <div className="requests-grid">
          {myBookings.length === 0 ? <p className="placeholder-text">You have no bookings.</p> : myBookings.map(b => {
              // Normalize status to lowercase to handle 'Approved' vs 'approved'
              const bStatus = (b.Status || b.BookingStatus || 'pending').toLowerCase();
              
              return (
                <div key={b.BookingID || b.id} className="request-item" style={{
                    background:'white', 
                    // Green for approved, Red for rejected, Orange for pending
                    borderLeft:`5px solid ${bStatus === 'approved' ? 'green' : bStatus === 'rejected' ? 'red' : 'orange'}`
                }}>
                  <div className="request-header">
                    <div>
                      <h4 style={{margin:0}}>{b.Room || b.RoomName}</h4>
                      <div style={{fontSize:'0.9em', color:'#666', marginTop:'5px'}}>
                        📅 {b.Date || b.BookingDate} <br/> 
                        ⏰ {b.Time || b.BookingTime}
                      </div>
                    </div>
                    {/* Display Status Badge */}
                    <span className={`request-status status-${bStatus}`} 
                          style={{
                              backgroundColor: bStatus === 'approved' ? '#d4edda' : bStatus === 'rejected' ? '#f8d7da' : '#fff3cd',
                              color: bStatus === 'approved' ? '#155724' : bStatus === 'rejected' ? '#721c24' : '#856404',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              fontSize: '0.8rem'
                          }}>
                        {bStatus.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Cancel Button */}
                  <div style={{marginTop:'10px'}}>
                     {bStatus === 'pending' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.BookingID || b.id)}>Cancel Request</button>
                     )}
                     {bStatus === 'approved' && (
                        <span style={{color:'green', fontSize:'0.9em'}}>✔ Confirmed</span>
                     )}
                     {bStatus === 'rejected' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleCancel(b.BookingID || b.id)}>Clear</button>
                     )}
                  </div>
                </div>
              )
          })}
        </div>
      </div>

      {/* --- MODAL --- */}
      {modalOpen && (
        <div className="modal" style={{display:'flex'}}>
          <div className="modal-content">
            <div className="modal-header">
               <h3>Confirm {user.role === 'advisor' ? 'Reservation' : 'Request'}</h3>
               <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <p><strong>Room:</strong> {selectedRoom?.name}</p>
              <p><strong>Time:</strong> {filters.date} {filters.start}-{filters.end}</p>
              <label>Purpose:</label>
              <input className="form-control" value={purpose} onChange={e => setPurpose(e.target.value)} />
            </div>
            <div className="modal-footer">
               <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
               <button className="btn btn-primary" onClick={handleBookingSubmit}>
                 {user.role === 'advisor' ? 'Confirm & Book' : 'Send Request'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentClassrooms;