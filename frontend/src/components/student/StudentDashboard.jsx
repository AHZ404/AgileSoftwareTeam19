import React, { useState, useEffect } from 'react';

const StudentDashboard = ({ user, navigateTo }) => {
  const [stats, setStats] = useState({ enrolled: 0, pending: 0, completed: 0, gpa: 0 });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [instructorMap, setInstructorMap] = useState({});

  // Modal State
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [selectedCourseMaterials, setSelectedCourseMaterials] = useState(null);
  const [courseMaterialsList, setCourseMaterialsList] = useState([]);

  // Request Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedRequestCourse, setSelectedRequestCourse] = useState(null);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    if (user && user.id) {
        loadData();
    }
  }, [user.id]);

  const loadData = async () => {
    try {
      console.log("🔄 Loading Dashboard Data...");

      // 1. Fetch ALL data in parallel
      const [myCoursesRes, allCoursesRes, requestsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/my-courses/${user.id}`), // Approved Courses
        fetch('http://localhost:5000/api/courses'),               // All Courses
        fetch(`http://localhost:5000/api/requests/${user.id}`)    // My Requests
      ]);

      const myCoursesData = await myCoursesRes.json() || [];
      const allCoursesData = await allCoursesRes.json() || [];
      const requestsData = await requestsRes.json() || [];

      console.log("✅ Data Received:", { myCoursesData, allCoursesData, requestsData });

      // 2. Process Enrolled Courses (Robust Mapping)
      // Handles CourseID, CourseId, or Id
      const enrolled = myCoursesData.map(c => ({
          id: c.CourseID || c.CourseId || c.Id, 
          title: c.Title || c.CourseTitle || 'Untitled Course',
          credits: c.Credits,
          instructorId: c.InstructorID || c.InstructorId,
          color: c.Color || '#4361ee', // Default color if missing
          schedule: c.ScheduleDay ? `${c.ScheduleDay} ${c.ScheduleTime}` : 'TBA'
      }));
      setEnrolledCourses(enrolled);

      // 3. Process Requests
      const processedRequests = requestsData.map(r => {
          // Find title if missing
          const rId = r.CourseId || r.CourseID;
          const courseInfo = allCoursesData.find(c => (c.CourseID || c.Id) === rId);
          return {
              ...r,
              // Ensure we have a CourseId property for filtering later
              CourseId: rId, 
              Title: r.Title || (courseInfo ? (courseInfo.Title || courseInfo.CourseTitle) : 'Unknown Course')
          };
      });
      setMyRequests(processedRequests);

      // 4. Process Available Courses
      // Logic: Start with ALL courses, remove Enrolled, remove Pending
      const enrolledIds = new Set(enrolled.map(c => c.id));
      const pendingIds = new Set(processedRequests.filter(r => (r.Status || '').toLowerCase() === 'pending').map(r => r.CourseId));
      
      const available = allCoursesData
        .filter(c => {
            const cId = c.CourseID || c.Id;
            return !enrolledIds.has(cId) && !pendingIds.has(cId);
        })
        .map(c => ({
            id: c.CourseID || c.Id,
            title: c.Title || c.CourseTitle,
            credits: c.Credits,
            instructorId: c.InstructorID || c.InstructorId,
            schedule: c.ScheduleDay ? `${c.ScheduleDay} ${c.ScheduleTime}` : 'TBA',
            location: c.Location
        }));
      setAvailableCourses(available);

      // 5. Calculate Stats
      setStats({
        enrolled: enrolled.length,
        pending: processedRequests.filter(r => (r.Status || '').toLowerCase() === 'pending').length,
        completed: 0, 
        gpa: 3.8 
      });

      // 6. Fetch Instructor Names
      const uniqueInstructorIds = [...new Set([...enrolled, ...available].map(c => c.instructorId).filter(id => id))];
      const newInstructorMap = {};
      
      await Promise.all(uniqueInstructorIds.map(async (instId) => {
          try {
              const res = await fetch(`http://localhost:5000/api/entity/${instId}`);
              if (res.ok) {
                  const data = await res.json();
                  newInstructorMap[instId] = `${data.firstName || ''} ${data.lastName || ''}`;
              }
          } catch(e) { 
              // Silent fail for names
          }
      }));
      setInstructorMap(newInstructorMap);

    } catch (err) {
      console.error('❌ Error loading dashboard:', err);
    }
  };

  // --- Handlers ---
  const openMaterialsModal = async (course) => {
    setSelectedCourseMaterials(course);
    setMaterialsModalOpen(true);
    setCourseMaterialsList([]); 

    try {
        const res = await fetch(`http://localhost:5000/api/materials/${course.id}`);
        const data = await res.json() || [];
        setCourseMaterialsList(data);
    } catch (err) {
        console.error("Failed to load materials", err);
    }
  };

  const downloadFile = (fileName, fileData) => {
      if(fileData) {
          const link = document.createElement('a');
          link.href = fileData;
          link.download = fileName;
          link.click();
      } else {
          alert("Downloading..."); 
      }
  };

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
                courseId: selectedRequestCourse.id, 
                reason: requestReason || 'No reason provided'
            })
        });

        if (response.ok) {
            alert('Request Submitted Successfully!');
            setRequestModalOpen(false);
            loadData(); // Refresh immediately
        } else {
            alert('Error submitting request.');
        }
    } catch (e) {
        alert('Error: ' + e.message);
    }
  };

  return (
    <div id="dashboard-section" className="content-section">
      <div className="dashboard-grid">
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
                <div key={c.id} className="course-card" style={{borderTop: `4px solid ${c.color}`}}>
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

        {/* Recent Requests */}
        <div className="widget small">
           <h3 style={{color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px'}}>Recent Requests</h3>
           <div className="assignments-list">
             {myRequests.length === 0 ? <p className="placeholder-text">No active requests.</p> : myRequests.slice(0, 3).map(r => (
               <div key={r.Id} className="assignment-item" style={{borderLeft: `4px solid ${r.Status === 'pending' ? 'orange' : r.Status === 'approved' ? 'green' : 'red'}`}}>
                 <div className="assignment-name">
                   {r.CourseId}: {r.Title}
                   <div style={{fontSize:'0.8rem', color:'#666'}}>{r.EnrolledAt ? new Date(r.EnrolledAt).toLocaleDateString() : 'N/A'}</div>
                 </div>
                 <div style={{textTransform:'uppercase', fontSize:'0.75rem', fontWeight:'bold'}}>{r.Status}</div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Available Courses */}
      <div className="widget large" style={{marginTop:'30px'}}>
         <h3 style={{color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px'}}>Available Courses</h3>
         <div className="courses-grid">
            {availableCourses.length === 0 ? <p className="placeholder-text">No new courses available.</p> : availableCourses.slice(0, 4).map(c => (
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