import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';

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

  const loadBookings = () => {
    universityDB.loadFromStorage();
    const bookings = universityDB.getBookingsByStudent(user.id) || [];
    bookings.sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    setMyBookings(bookings);
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handleSearch = () => {
    const rooms = universityDB.getAvailableClassrooms(filters.date, filters.start, filters.end);
    setAvailableRooms(rooms);
  };

  const openBookingModal = (room) => {
    setSelectedRoom(room);
    setPurpose('');
    setModalOpen(true);
  };

  const handleBookingSubmit = () => {
    if (!selectedRoom) return;

    try {
      const status = user.role === 'advisor' ? 'approved' : 'pending';
      
      const booking = {
        classroomId: selectedRoom.id,
        date: filters.date,
        startTime: filters.start,
        endTime: filters.end,
        bookedBy: user.id,
        purpose: purpose || 'General Booking',
        status: status
      };

      universityDB.createBooking(booking);
      
      alert(user.role === 'advisor' ? 'Booking Approved!' : 'Booking Requested!');
      setModalOpen(false);
      loadBookings(); // Refresh my bookings list
      handleSearch(); // Refresh available rooms list (to hide the one just booked)
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancelBooking = (id) => {
    if (confirm('Cancel this booking?')) {
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
    <div>
      {/* --- Search Filters --- */}
      <h2>Classroom Availability</h2>
      <div className="classroom-filters" style={{display:'flex', gap:'10px', alignItems:'flex-end', marginBottom:'20px', background:'white', padding:'15px', borderRadius:'8px', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
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
        {availableRooms.length === 0 && <p className="placeholder-text" style={{gridColumn:'1/-1'}}>Search to see available rooms.</p>}
        {availableRooms.map(room => (
          <div key={room.id} className="course-card">
            <h4>{room.id}: {room.name}</h4>
            <p><strong>Capacity:</strong> {room.capacity}</p>
            <p><strong>Location:</strong> {room.location}</p>
            
            {/* --- ADDED FEATURES LINE HERE --- */}
            <p><strong>Features:</strong> {room.features ? room.features.join(', ') : 'N/A'}</p>
            
            <div className="course-footer">
              <button className="btn btn-primary" onClick={() => openBookingModal(room)}>Book</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- My Bookings List --- */}
      <div className="widget large" style={{marginTop:'30px'}}>
        <h3>Your Bookings</h3>
        <div className="requests-grid">
          {myBookings.length === 0 ? <p className="placeholder-text">No bookings found.</p> : myBookings.map(b => {
             const room = universityDB.getAllClassrooms().find(r => r.id === b.classroomId) || {name: 'Unknown'};
             return (
               <div key={b.id} className="request-item">
                 <div className="request-header">
                   <div className="request-info">
                     <h4>{room.name} ({b.classroomId})</h4>
                     <div className="request-meta">{b.date} | {b.startTime} - {b.endTime}</div>
                   </div>
                   <span className={`request-status status-${b.status}`}>{b.status.toUpperCase()}</span>
                 </div>
                 <p className="request-reason">Purpose: {b.purpose}</p>
                 {b.status === 'pending' && (
                    <div className="request-actions">
                      <button className="btn btn-danger" onClick={() => handleCancelBooking(b.id)}>Cancel</button>
                    </div>
                 )}
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