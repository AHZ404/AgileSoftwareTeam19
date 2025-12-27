import React, { useState, useEffect } from 'react';

const AdvisorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [studentMap, setStudentMap] = useState({});

  const loadRequests = async () => {
    try {
      // 1. Fetch all enrollments
      const enrollmentsRes = await fetch('http://localhost:5000/api/enrollments');
      const rawEnrollments = await enrollmentsRes.json() || [];

      // --- CRITICAL FIX: Normalizing Data (PascalCase -> camelCase) ---
      const cleanEnrollments = rawEnrollments.map(e => ({
        id: e.Id,
        studentId: e.StudentId,
        courseId: e.CourseId,
        status: (e.Status || 'pending').toLowerCase(), // Ensure 'Pending' matches 'pending'
        reason: e.Reason
      }));

      // 2. Filter for Pending only
      const pending = cleanEnrollments.filter(e => e.status === 'pending');
      
      // 3. Fetch Student Info
      const entitiesRes = await fetch('http://localhost:5000/api/entities');
      const entities = await entitiesRes.json() || [];
      
      const sMap = {};
      entities.forEach(e => {
        sMap[e.id] = e;
      });
      setStudentMap(sMap);
      
      setRequests(pending);

    } catch (err) {
      console.error('Error loading requests:', err);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleAction = async (id, action) => {
    if(!confirm(`Are you sure you want to ${action}?`)) return;
    try {
      // The backend expects "approved" or "rejected"
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      const res = await fetch(`http://localhost:5000/api/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        loadRequests(); // Refresh the list to remove the processed item
      } else {
        alert("Server failed to update request.");
      }
    } catch (err) {
      console.error('Error updating request:', err);
      alert('Error updating request');
    }
  };

  return (
    <div>
      {requests.length === 0 ? <p className="placeholder-text">No pending requests found.</p> : (
        requests.map(req => {
          // Safe lookup for student name
          const student = studentMap[req.studentId] || { firstName: 'Unknown', lastName: `(${req.studentId})` };
          
          return (
            <div key={req.id} className="request-item" style={{
                borderLeft: '5px solid var(--warning)',
                backgroundColor: 'white',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '5px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
               <div className="request-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                     <h4 style={{margin:0, color: 'var(--primary)'}}>Course: {req.courseId}</h4>
                     <p style={{margin:'5px 0', fontSize:'0.9rem'}}>Student: <strong>{student.firstName} {student.lastName}</strong></p>
                  </div>
               </div>
               
               <p style={{fontStyle:'italic', color:'#555', marginTop:'10px'}}>Reason: "{req.reason || 'No reason provided'}"</p>
               
               <div className="request-actions" style={{marginTop:'15px', display:'flex', gap:'10px'}}>
                  <button className="btn btn-success" onClick={() => handleAction(req.id, 'approve')}>Approve</button>
                  <button className="btn btn-danger" onClick={() => handleAction(req.id, 'reject')}>Reject</button>
               </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdvisorRequests;