import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';

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
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [purpose, setPurpose] = useState('');

  // 1. Load Instructors Bookings
  const loadBookings = () => {
    universityDB.loadFromStorage();
    const bookings = universityDB.getBookingsByStudent(user.id) || [];
    // Sort by date/time
    bookings.sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    setMyBookings(bookings);
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  // 2. Search Handler
  const handleSearch = () => {
    // Uses the existing DB logic to find rooms free in that time slot
    const rooms = universityDB.getAvailableClassrooms(filters.date, filters.start, filters.end);
    setAvailableRooms(rooms);
  };

  // 3. Open Booking Modal
  const openBookingModal = (room) => {
    setSelectedRoom(room);
    setPurpose('');
    setModalOpen(true);
  };

  // 4. Submit Booking (Instructors = Auto Approved)
  const handleBookingSubmit = () => {
    if (!selectedRoom) return;

    try {
      const booking = {
        classroomId: selectedRoom.id,
        date: filters.date,
        startTime: filters.start,
        endTime: filters.end,
        bookedBy: user.id,
        purpose: purpose || 'Instructor Session',
        status: 'approved' // Instructors are always approved immediately
      };

      universityDB.createBooking(booking);
      
      alert('Classroom booked successfully!');
      setModalOpen(false);
      loadBookings(); // Refresh my bookings list
      handleSearch(); // Refresh available rooms (hides the one just booked)
    } catch (error) {
      alert(error.message);
    }
  };

  // 5. Cancel Booking
  const handleCancelBooking = (id) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        universityDB.deleteBooking(id);
        loadBookings();
        handleSearch();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  return (
    <div id="instructor-bookings-section">
       <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Book Classrooms</h2>

      {/* --- Search Filters (Matches Screenshot UI) --- */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#333' }}>Classroom Availability</h3>
      <div className="classroom-filters" style={{
          display:'flex', 
          gap:'20px', 
          alignItems:'flex-end', 
          marginBottom:'30px', 
          backgroundColor:'white', 
          padding:'20px', 
          borderRadius:'8px', 
          boxShadow:'0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div className="form-group" style={{marginBottom:0, flex:1}}>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'0.9rem'}}>Date</label>
          <input type="date" className="form-control" 
                 value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} 
                 style={{width:'100%', padding:'10px', borderRadius:'4px', border:'1px solid #dee2e6'}} />
        </div>
        <div className="form-group" style={{marginBottom:0, flex:1}}>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'0.9rem'}}>Start Time</label>
          <input type="time" className="form-control" 
                 value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})}
                 style={{width:'100%', padding:'10px', borderRadius:'4px', border:'1px solid #dee2e6'}} />
        </div>
        <div className="form-group" style={{marginBottom:0, flex:1}}>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'600', fontSize:'0.9rem'}}>End Time</label>
          <input type="time" className="form-control" 
                 value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})}
                 style={{width:'100%', padding:'10px', borderRadius:'4px', border:'1px solid #dee2e6'}} />
        </div>
        <button className="btn btn-primary" onClick={handleSearch} style={{height:'42px', padding: '0 25px'}}>Search</button>
      </div>

      {/* --- Available Rooms Grid --- */}
      {availableRooms.length === 0 ? (
          <div className="placeholder-text" style={{ marginBottom: '40px' }}>Search to see available rooms.</div>
      ) : (
          <div className="courses-grid" style={{ marginBottom: '40px' }}>
            {availableRooms.map(room => (
              <div key={room.id} className="course-card" style={{ borderTop: '5px solid var(--success)' }}>
                <h4>{room.id}: {room.name}</h4>
                <p><strong>Capacity:</strong> {room.capacity}</p>
                <p><strong>Location:</strong> {room.location}</p>
                <p><strong>Features:</strong> {room.features ? room.features.join(', ') : 'N/A'}</p>
                
                <div className="course-footer">
                  <button className="btn btn-primary" onClick={() => openBookingModal(room)}>Book This Room</button>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* --- My Bookings List --- */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#333', color: 'var(--secondary)' }}>Your Bookings</h3>
      <div className="widget large" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
        <div className="requests-grid">
          {myBookings.length === 0 ? <p className="placeholder-text">No bookings found.</p> : myBookings.map(b => {
             const room = universityDB.getAllClassrooms().find(r => r.id === b.classroomId) || {name: 'Unknown'};
             return (
               <div key={b.id} className="request-item" style={{ borderLeft: '5px solid var(--primary)' }}>
                 <div className="request-header">
                   <div className="request-info">
                     <h4 style={{ color: 'var(--primary)' }}>{room.name} ({b.classroomId})</h4>
                     <div className="request-meta">{b.date} | {b.startTime} - {b.endTime}</div>
                   </div>
                   <span className={`request-status status-${b.status}`}>{b.status.toUpperCase()}</span>
                 </div>
                 <p className="request-reason">Purpose: {b.purpose}</p>
                 <div className="request-actions">
                    <button className="btn btn-danger" onClick={() => handleCancelBooking(b.id)}>Cancel</button>
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