import React, { useState, useEffect } from 'react';

const StudentCourses = ({ user }) => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reason, setReason] = useState('');

  // --- Load Data from Backend ---
  const loadData = async () => {
    try {
      // 1. Fetch Available Courses
      const coursesRes = await fetch('http://localhost:5000/api/courses');
      const coursesData = await coursesRes.json();
      setAvailableCourses(coursesData || []);

      // 2. Fetch My Requests
      const requestsRes = await fetch(`http://localhost:5000/api/requests/${user.id}`);
      const requestsData = await requestsRes.json();
      setMyRequests(requestsData || []);
      
    } catch (err) {
      console.error("Failed to load course data", err);
    }
  };

  useEffect(() => { 
    if(user.id) loadData(); 
  }, [user.id]);

  const handleRequestClick = (course) => {
    setSelectedCourse(course);
    setReason(''); // Reset reason
    setModalOpen(true);
  };

  // --- Submit to Backend ---
  const submitRequest = async () => {
    if (!selectedCourse) return;

    try {
      const response = await fetch('http://localhost:5000/api/course-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          // Ensure we use the correct ID property (CourseID from View_Courses)
          courseId: selectedCourse.CourseID || selectedCourse.Id, 
          reason: reason || 'No reason provided'
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Request Submitted Successfully!');
        setModalOpen(false);
        setReason('');
        loadData(); // Refresh list to update button status immediately
      } else {
        alert(result.message || 'Failed to submit request');
      }
    } catch (err) {
      alert('Error submitting request. Is the server running?');
    }
  };

  return (
    <div>
      <h2 style={{color: 'var(--primary)'}}>Available Courses</h2>
      <div className="courses-grid">
        {availableCourses.length === 0 ? <p className="placeholder-text">No available courses found.</p> : availableCourses.map(course => {
          
          // --- LOGIC: Check status for this specific course ---
          const cId = course.CourseID || course.Id;
          const existingRequest = myRequests.find(r => r.CourseId === cId);
          
          const status = existingRequest ? (existingRequest.Status || '').toLowerCase() : null;
          const isPending = status === 'pending';
          const isApproved = status === 'approved';
          const isRejected = status === 'rejected';

          return (
            <div key={cId} className="course-card" style={{borderTop: `4px solid ${isApproved ? '#28a745' : 'var(--primary)'}`, padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
               
               {/* Header */}
               <div className="course-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                 <h4 style={{fontSize: '1.1rem', margin: 0, color: '#333'}}>{cId}: {course.Title}</h4>
                 <span className="course-credits" style={{
                     backgroundColor: isApproved ? '#28a745' : 'var(--primary)', 
                     color: 'white',
                     padding: '4px 8px',
                     borderRadius: '4px',
                     fontSize: '0.8rem',
                     fontWeight: '600'
                 }}>
                    {course.Credits} Cr
                 </span>
               </div>

               {/* Details */}
               <div style={{color: '#555', fontSize: '0.9rem'}}>
                   <p style={{margin: '4px 0'}}><i className="fas fa-calendar-day"></i> {course.ScheduleDay || 'TBA'}</p>
                   <p style={{margin: '4px 0'}}><i className="fas fa-clock"></i> {course.ScheduleTime || 'TBA'}</p>
                   <p style={{margin: '4px 0'}}><strong>Instructor:</strong> {course.InstructorID || 'Staff'}</p>
               </div>

               {/* Footer: Dynamic Button based on Status */}
               <div className="course-footer" style={{borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px', textAlign: 'right'}}>
                 
                 {isApproved ? (
                    <button className="btn" disabled style={{
                        backgroundColor: '#28a745', 
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        opacity: 0.8,
                        cursor: 'not-allowed'
                    }}>
                        <i className="fas fa-check-circle"></i> Enrolled
                    </button>
                 ) : isPending ? (
                    <button className="btn" disabled style={{
                        backgroundColor: '#ffc107', 
                        color: '#333',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'not-allowed',
                        fontWeight: 'bold'
                    }}>
                        <i className="fas fa-clock"></i> Pending...
                    </button>
                 ) : (
                    <button className="btn" onClick={() => handleRequestClick(course)} style={{
                        backgroundColor: isRejected ? '#dc3545' : '#f72585', // Red if rejected (try again), Pink if new
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        {isRejected ? 'Request Again' : '+ Request'}
                    </button>
                 )}

               </div>
            </div>
          );
        })}
      </div>

      <h2 style={{marginTop: '40px', color: 'var(--primary)'}}>My Enrollment Requests</h2>
      <div className="requests-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
        {myRequests.length === 0 ? <p className="placeholder-text">No active requests.</p> : myRequests.map(r => (
           <div key={r.Id} className="request-item" style={{
               borderLeft: `5px solid ${r.Status === 'pending' ? '#ffc107' : r.Status === 'approved' ? '#28a745' : '#dc3545'}`,
               backgroundColor: 'white',
               padding: '15px',
               borderRadius: '5px',
               boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
           }}>
             <div className="request-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                <h4 style={{margin: 0}}>{r.CourseId}: {r.Title}</h4>
                <span className={`status-${r.Status}`} style={{
                    textTransform: 'uppercase', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    color: r.Status === 'pending' ? '#856404' : r.Status === 'approved' ? '#155724' : '#721c24'
                }}>
                    {r.Status}
                </span>
             </div>
             <p style={{fontSize:'0.9rem', color:'#666', margin: '5px 0'}}>Reason: {r.Reason}</p>
             {/* Note: EnrolledAt might be undefined if removed from backend, so we check first */}
             {r.EnrolledAt && <small style={{color: '#999'}}>Date: {new Date(r.EnrolledAt).toLocaleDateString()}</small>}
           </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal" style={{display: 'flex'}}>
          <div className="modal-content">
            <div className="modal-header">
                <h3>Request {selectedCourse?.Title}</h3>
                <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
            </div>
            <div className="modal-body">
                <p>You are about to request registration for <strong>{selectedCourse?.CourseID || selectedCourse?.Id}</strong>.</p>
                <div className="form-group">
                    <label>Reason for Request</label>
                    <textarea className="form-control" rows="3" value={reason} onChange={e => setReason(e.target.value)} placeholder="Optional: Explain why you want to take this course..."></textarea>
                </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRequest}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;