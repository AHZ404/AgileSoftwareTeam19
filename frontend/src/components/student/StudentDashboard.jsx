import React, { useState, useEffect } from 'react';

const StudentDashboard = ({ user, navigateTo }) => {
  const [stats, setStats] = useState({ enrolled: 0, pending: 0, completed: 0, gpa: 0 });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [instructorMap, setInstructorMap] = useState({}); // Stores names like { 'INS001': 'Dr. Smith' }

  // Modal State
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [selectedCourseMaterials, setSelectedCourseMaterials] = useState(null);
  const [courseMaterialsList, setCourseMaterialsList] = useState([]); // Stores actual files

  // Request Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedRequestCourse, setSelectedRequestCourse] = useState(null);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      // 1. Fetch Enrolled Courses
      const myCoursesRes = await fetch(`http://localhost:5000/api/my-courses/${user.id}`);
      const myCoursesData = await myCoursesRes.json() || [];
      
      // Normalize Enrolled Data
      const enrolled = myCoursesData.map(c => ({
          id: c.CourseID,
          title: c.Title,
          credits: c.Credits,
          instructorId: c.InstructorID,
          color: c.Color,
          schedule: `${c.ScheduleDay} ${c.ScheduleTime}`
      }));
      setEnrolledCourses(enrolled);

      // 2. Fetch All Available Courses
      const allCoursesRes = await fetch('http://localhost:5000/api/courses');
      const allCoursesData = await allCoursesRes.json() || [];
      
      // Filter out courses I am already enrolled in
      const enrolledIds = enrolled.map(c => c.id);
      const available = allCoursesData
        .filter(c => !enrolledIds.includes(c.CourseID))
        .map(c => ({
            id: c.CourseID,
            title: c.Title,
            credits: c.Credits,
            instructorId: c.InstructorID,
            schedule: `${c.ScheduleDay} ${c.ScheduleTime}`,
            location: c.Location
        }));
      setAvailableCourses(available);

      // 3. Fetch My Requests
      const requestsRes = await fetch(`http://localhost:5000/api/requests/${user.id}`);
      const requestsData = await requestsRes.json() || [];
      setMyRequests(requestsData);

      // 4. Calculate Stats
      setStats({
        enrolled: enrolled.length,
        pending: requestsData.filter(r => r.Status === 'pending').length,
        completed: 0, // Placeholder
        gpa: 3.8 // Placeholder (Calculated from Grades later)
      });

      // 5. Fetch Instructor Names (Optimization: Only fetch unique IDs)
      const instructorIds = [...new Set([...enrolled, ...available].map(c => c.instructorId).filter(id => id))];
      const newInstructorMap = {};
      
      await Promise.all(instructorIds.map(async (instId) => {
          try {
              const res = await fetch(`http://localhost:5000/api/entity/${instId}`);
              const data = await res.json();
              newInstructorMap[instId] = `${data.firstName} ${data.lastName}`;
          } catch(e) { 
              newInstructorMap[instId] = "Unknown Instructor"; 
          }
      }));
      setInstructorMap(newInstructorMap);

    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  // --- Materials Handlers ---
  const openMaterialsModal = async (course) => {
    setSelectedCourseMaterials(course);
    setMaterialsModalOpen(true);
    setCourseMaterialsList([]); // Reset

    try {
        const res = await fetch(`http://localhost:5000/api/materials/${course.id}`);
        const data = await res.json() || [];
        setCourseMaterialsList(data);
    } catch (err) {
        console.error("Failed to load materials", err);
    }
  };

  const downloadFile = (fileName, fileData) => {
      // If we have data, download it. If not, alert (demo)
      if(fileData) {
          const link = document.createElement('a');
          link.href = fileData;
          link.download = fileName;
          link.click();
      } else {
          alert("Downloading..."); // Real app would fetch blob
      }
  };

  // --- Request Handlers ---
  const openRequestModal = (course) => {
    setSelectedRequestCourse(course);
    setRequestReason('');
    setRequestModalOpen(true);
  };

  const submitRequest = async () => {
    if (!selectedRequestCourse) return;
    try {
        const response = await fetch('http://localhost:5000/api/course-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: user.id,
                courseId: selectedRequestCourse.id, // ID from our normalized object
                reason: requestReason || 'No reason provided'
            })
        });

        if (response.ok) {
            alert('Request Submitted Successfully!');
            setRequestModalOpen(false);
            loadData(); // Refresh lists
        } else {
            alert('Error submitting request. You might already have a pending request.');
        }
    } catch (e) {
        alert('Error: ' + e.message);
    }
  };

  return (
    <div id="dashboard-section" className="content-section">
      <div className="dashboard-grid">
        {/* Stats Cards */}
        <div className="stat-card primary">
          <i className="fas fa-book"></i>
          <div className="stat-info">
            <p>Current Courses</p>
            <span className="stat-value">{stats.enrolled}</span>
          </div>
        </div>
        <div className="stat-card warning">
          <i className="fas fa-exclamation-triangle"></i>
          <div className="stat-info">
            <p>Pending Requests</p>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card success">
          <i className="fas fa-graduation-cap"></i>
          <div className="stat-info">
            <p>GPA</p>
            <span className="stat-value">{stats.gpa}</span>
          </div>
        </div>
        <div className="stat-card info">
           <i className="fas fa-check-circle"></i>
           <div className="stat-info">
              <p>Completed Credits</p>
              <span className="stat-value">0</span>
           </div>
        </div>
      </div>

      <div className="widgets-container">
        
        {/* Enrolled Courses */}
        <div className="widget large">
          <h3 style={{color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px'}}>Current Courses</h3>
          <div className="courses-grid">
             {enrolledCourses.length === 0 ? <p className="placeholder-text">Not enrolled in any courses.</p> : enrolledCourses.map(c => (
                <div key={c.id} className="course-card" style={{borderTop: `4px solid ${c.color || 'var(--primary)'}`}}>
                   <h4 style={{margin: '0 0 5px 0'}}>{c.id}: {c.title}</h4>
                   <p style={{fontSize: '0.9rem', color: '#666', margin: '0 0 5px 0'}}>Credits: {c.credits}</p>
                   <p style={{fontSize: '0.9rem', color: '#4361ee', fontWeight:'bold'}}>
                       <i className="fas fa-chalkboard-teacher"></i> {instructorMap[c.instructorId] || 'Staff'}
                   </p>
                   <div style={{textAlign: 'right', marginTop: '15px'}}>
                      <button className="btn btn-info btn-sm" onClick={() => openMaterialsModal(c)}>
                          <i className="fas fa-file-alt"></i> Materials
                      </button>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Upcoming Requests */}
        <div className="widget small">
           <h3 style={{color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px'}}>Recent Requests</h3>
           <div className="assignments-list">
             {myRequests.length === 0 ? <p className="placeholder-text">No active requests.</p> : myRequests.slice(0, 3).map(r => (
               <div key={r.Id} className="assignment-item" style={{borderLeft: `4px solid ${r.Status === 'pending' ? 'orange' : r.Status === 'approved' ? 'green' : 'red'}`}}>
                 <div className="assignment-name">
                   {r.CourseId}: {r.Title}
                   <div style={{fontSize:'0.8rem', color:'#666'}}>{new Date(r.EnrolledAt).toLocaleDateString()}</div>
                 </div>
                 <div style={{textTransform:'uppercase', fontSize:'0.75rem', fontWeight:'bold'}}>{r.Status}</div>
               </div>
             ))}
           </div>
        </div>

      </div>

      {/* Available Courses Row */}
      <div className="widget large" style={{marginTop:'30px'}}>
         <h3 style={{color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px'}}>Available Courses</h3>
         <div className="courses-grid">
            {availableCourses.length === 0 ? <p className="placeholder-text">No other courses available.</p> : availableCourses.slice(0, 4).map(c => (
               <div key={c.id} className="course-card">
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                      <h4 style={{margin:0}}>{c.id}: {c.title}</h4>
                      <span className="badge" style={{background:'var(--primary)', color:'white', padding:'2px 6px', borderRadius:'4px'}}>{c.credits} Cr</span>
                  </div>
                  <p style={{fontSize:'0.9rem', color:'#555', margin:'5px 0'}}>
                      <strong>Instructor:</strong> {instructorMap[c.instructorId] || 'Staff'}
                  </p>
                  <div style={{textAlign:'right', marginTop:'10px'}}>
                      <button className="btn btn-primary btn-sm" onClick={() => openRequestModal(c)}>+ Request</button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Materials Modal */}
      {materialsModalOpen && selectedCourseMaterials && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{maxWidth:'600px'}}>
            <div className="modal-header">
                <h3>{selectedCourseMaterials.title} Materials</h3>
                <span className="close" onClick={() => setMaterialsModalOpen(false)}>&times;</span>
            </div>
            <div className="modal-body">
                {courseMaterialsList.length === 0 ? (
                    <p className="placeholder-text">No materials uploaded yet.</p>
                ) : (
                    courseMaterialsList.map(m => (
                        <div key={m.MaterialID} className="material-item" style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #eee'}}>
                            <div>
                                <strong>{m.Title}</strong> <br/>
                                <small>{m.Type}</small>
                            </div>
                            {/* Pass null for fileData, let helper handle logic if needed */}
                            <button className="btn btn-success btn-sm" onClick={() => downloadFile(m.Title, null)}>Download</button>
                        </div>
                    ))
                )}
            </div>
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setMaterialsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {requestModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
                <h3>Request {selectedRequestCourse?.title}</h3>
                <span className="close" onClick={() => setRequestModalOpen(false)}>&times;</span>
            </div>
            <div className="modal-body">
                <p>Register for <strong>{selectedRequestCourse?.id}</strong>?</p>
                <textarea className="form-control" rows="3" placeholder="Reason (Optional)" value={requestReason} onChange={e => setRequestReason(e.target.value)}></textarea>
            </div>
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setRequestModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitRequest}>Submit Request</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;