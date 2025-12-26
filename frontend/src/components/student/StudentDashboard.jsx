import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';

// Helper to refresh data
const useForceUpdate = () => {
    const [_, setTick] = useState(0);
    return () => setTick(t => t + 1);
};

const StudentDashboard = ({ user }) => {
  const forceUpdate = useForceUpdate();
  const [stats, setStats] = useState({ enrolled: 0, pending: 0, completed: 0, gpa: 0 });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  
  // Widgets State
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  // Modal State for Materials
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [selectedCourseMaterials, setSelectedCourseMaterials] = useState(null);

  // Modal State for Course Registration
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedRequestCourse, setSelectedRequestCourse] = useState(null);
  const [requestReason, setRequestReason] = useState('');

  // Load Data
  const loadData = () => {
    universityDB.loadFromStorage();
    setStats({
      enrolled: universityDB.getCoursesByStudent(user.id).length,
      pending: universityDB.getPendingAssignmentsCount(user.id),
      completed: universityDB.getCompletedAssignmentsCount(user.id),
      gpa: universityDB.getStudentGPA(user.id)
    });
    setEnrolledCourses(universityDB.getCoursesByStudent(user.id));
    setUpcomingAssignments(universityDB.getUpcomingAssignments(user.id));
    
    // Load data for new widgets
    setAvailableCourses(universityDB.getAvailableCoursesForStudent(user.id));
    setMyRequests(universityDB.getCourseRequestsByStudent(user.id));
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  // Materials Modal Handlers
  const openMaterialsModal = (course) => {
    setSelectedCourseMaterials(course);
    setMaterialsModalOpen(true);
  };

  const closeMaterialsModal = () => {
    setMaterialsModalOpen(false);
    setSelectedCourseMaterials(null);
  };

  // Request Modal Handlers
  const openRequestModal = (course) => {
    setSelectedRequestCourse(course);
    setRequestReason('');
    setRequestModalOpen(true);
  };

  const submitRequest = () => {
    if (!selectedRequestCourse) return;
    try {
        const request = {
            studentId: user.id,
            courseId: selectedRequestCourse.id,
            reason: requestReason || 'No reason provided',
            dateSubmitted: new Date().toISOString().split('T')[0],
            status: 'pending'
        };
        universityDB.createCourseRequest(request);
        alert('Request Submitted Successfully!');
        setRequestModalOpen(false);
        loadData(); // Refresh dashboard data
    } catch (e) {
        alert(e.message);
    }
  };

  return (
    <div id="dashboard-section" className="content-section">
      <div className="dashboard-grid">
        {/* Card 1: Enrolled */}
        <div className="stat-card primary">
          <i className="fas fa-book"></i>
          <div className="stat-info">
            <p>Current Courses</p>
            <span className="stat-value">{stats.enrolled}</span>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="stat-card warning">
          <i className="fas fa-exclamation-triangle"></i>
          <div className="stat-info">
            <p>Pending Assignments</p>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>

        {/* Card 3: GPA */}
        <div className="stat-card success">
          <i className="fas fa-graduation-cap"></i>
          <div className="stat-info">
            <p>Cumulative GPA</p>
            <span className="stat-value">{stats.gpa.toFixed(2)}</span>
          </div>
        </div>

        {/* Card 4: Completed Assignments */}
        <div className="stat-card info">
           <i className="fas fa-check-circle"></i>
           <div className="stat-info">
              <p>Completed Assignments</p>
              <span className="stat-value">{stats.completed}</span>
           </div>
        </div>
      </div>

      {/* Row 1: Current Courses & Upcoming Deadlines */}
      <div className="widgets-container">
        <div className="widget large">
          <h3 style={{ color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px' }}>Current Courses</h3>
          
          <div className="courses-grid">
             {enrolledCourses.length === 0 ? <p className="placeholder-text">Not enrolled in any courses yet.</p> : enrolledCourses.map(c => {
                
                // --- 1. Get Instructor Names (Handles single or multiple) ---
                const instructors = universityDB.getInstructorsForCourse(c);
                const instructorNames = instructors.map(i => `${i.firstName} ${i.lastName}`).join(', ');

                return (
                  <div key={c.id} className="course-card" style={{
                      borderTop: `4px solid ${c.color || 'var(--primary)'}`,
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      padding: '15px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '160px'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#333' }}>{c.id}: {c.title}</h4>
                      
                      {/* Credits Line */}
                      <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: '0 0 8px 0' }}>Credits: {c.credits}</p>

                      {/* --- 2. Instructor Name Display (Under Credits) --- */}
                      <p style={{ 
                          color: '#4361ee', 
                          fontSize: '0.9rem', 
                          margin: 0, 
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                      }}>
                        <i className="fas fa-chalkboard-teacher"></i>
                        {instructorNames || 'Staff'}
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right', marginTop: '15px' }}>
                      <button 
                          onClick={() => openMaterialsModal(c)}
                          style={{
                              backgroundColor: '#4cc9f0', 
                              color: '#212529',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                          }}
                      >
                          <i className="fas fa-file-alt"></i> View Materials
                      </button>
                    </div>
                  </div>
                );
             })}
          </div>
        </div>

        <div className="widget small">
           <h3 style={{ color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px' }}>Upcoming Deadlines</h3>
           <div className="assignments-list">
             {upcomingAssignments.length === 0 ? <p className="placeholder-text">No upcoming assignments.</p> : upcomingAssignments.map(a => (
               <div key={a.id} className="assignment-item">
                 <div className="assignment-name">{a.title}</div>
                 <div className="priority medium">Pending</div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Row 2: Available Courses & My Requests */}
      <div className="widgets-container" style={{ marginTop: '30px' }}>
        {/* Left: Available Courses (Quick Browse) */}
        <div className="widget large">
           <h3 style={{ color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px' }}>Available Courses (Quick Browse)</h3>
           <div className="courses-grid" style={{ gridTemplateColumns: '1fr' }}> 
             {availableCourses.length === 0 ? <p className="placeholder-text">No available courses to display.</p> : availableCourses.slice(0, 3).map(course => { 
                 const instructors = universityDB.getInstructorsForCourse(course);
                 const instructorNames = instructors.map(i => `${i.firstName} ${i.lastName}`).join(', ');

                 return (
                    <div key={course.id} className="course-card" style={{ borderTop: `4px solid ${course.color || 'var(--primary)'}`, marginBottom: '15px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                           <h4 style={{ margin: 0 }}>{course.id}: {course.title}</h4>
                           <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{course.credits} Credits</span>
                       </div>
                       
                       {/* Instructor in Quick Browse as well */}
                       <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#555' }}>
                           <strong>Instructor:</strong> {instructorNames || 'Staff'}
                       </p>
                       
                       <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#555' }}><strong>Schedule:</strong> {course.schedule} | {course.location}</p>
                       <div style={{ textAlign: 'right', marginTop: '10px' }}>
                           <button onClick={() => openRequestModal(course)} style={{
                               backgroundColor: '#f72585',
                               color: 'white',
                               border: 'none',
                               padding: '6px 12px',
                               borderRadius: '4px',
                               cursor: 'pointer',
                               fontWeight: '600'
                           }}>+Request</button>
                       </div>
                    </div>
                 );
             })}
           </div>
        </div>

        {/* Right: My Course Requests */}
        <div className="widget large">
           <h3 style={{ color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px' }}>My Course Requests</h3>
           <div className="assignments-list">
             {myRequests.length === 0 ? (
                 <p className="placeholder-text" style={{ fontStyle: 'italic', color: '#999', textAlign: 'center', padding: '20px' }}>
                    You have no submitted course registration requests.
                 </p>
             ) : myRequests.map(r => {
               const course = universityDB.getCourseById(r.courseId);
               const courseTitle = course ? course.title : 'Unknown Course';

               return (
               <div key={r.id} className="request-item" style={{ 
                   borderLeft: `4px solid ${r.status === 'pending' ? 'var(--warning)' : r.status === 'approved' ? 'var(--success)' : 'var(--danger)'}`,
                   backgroundColor: 'white',
                   padding: '15px',
                   borderRadius: '4px',
                   marginBottom: '10px',
                   boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
               }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{r.courseId}: {courseTitle}</h4>
                    <span className={`status-${r.status}`} style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        backgroundColor: r.status === 'pending' ? '#fff3cd' : r.status === 'approved' ? '#d1edff' : '#f8d7da',
                        color: r.status === 'pending' ? '#856404' : r.status === 'approved' ? '#0d6efd' : '#842029'
                    }}>{r.status.toUpperCase()}</span>
                 </div>
                 <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Submitted: {r.dateSubmitted}</p>
               </div>
             )})}
           </div>
        </div>
      </div>

      {/* --- Materials Modal --- */}
      {materialsModalOpen && selectedCourseMaterials && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
                <h3 style={{ color: 'var(--primary)' }}>{selectedCourseMaterials.id}: {selectedCourseMaterials.title} Materials</h3>
                <span className="close" onClick={closeMaterialsModal}>&times;</span>
            </div>
            
            <div className="modal-body">
                {(() => {
        const instructors = universityDB.getInstructorsForCourse(selectedCourseMaterials);
        const names = instructors.map(i => `${i.firstName} ${i.lastName}`).join(', ');
        
        return (
            <div style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '4px', marginBottom: '20px', color: '#6c757d', fontSize: '0.9rem' }}>
                <strong>Instructor(s):</strong> {names || 'Staff'}
            </div>
            );
        })()}

            <div className="materials-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(selectedCourseMaterials.materials && selectedCourseMaterials.materials.length > 0) ? (
                    selectedCourseMaterials.materials.map((mat, index) => (
                        <div key={index} className="material-item" style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', 
                            border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: 'white' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <i className={`fas fa-${mat.icon || 'file'}`} style={{ fontSize: '1.2rem', color: 'var(--primary)', marginRight: '15px', width: '20px', textAlign: 'center' }}></i>
                                <div>
                                    <span style={{ fontWeight: '500', color: '#212529', display: 'block' }}>{mat.title}</span>
                                    <small style={{ color: '#666' }}>{mat.type.toUpperCase()}</small>
                                </div>
                            </div>

                            {/* Show download button if it is a file */}
                            {mat.type === 'file' && mat.fileData && (
                                <button 
                                    className="btn btn-success" 
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = mat.fileData;
                                        link.download = mat.fileName || 'material';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    style={{ padding: '5px 10px' }}
                                >
                                    <i className="fas fa-download"></i>
                                </button>
                            )}
                        </div>
                       ))
                      ) : (
                    <p style={{ padding: '10px', fontStyle: 'italic', textAlign: 'center' }}>No materials uploaded by the instructor yet.</p>
                    )}
                </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeMaterialsModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Course Request Modal --- */}
      {requestModalOpen && selectedRequestCourse && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
                <h3>Request {selectedRequestCourse.title}</h3>
                <span className="close" onClick={() => setRequestModalOpen(false)}>&times;</span>
            </div>
            <div className="modal-body">
                <p className="modal-info-text">You are about to request registration for <strong>{selectedRequestCourse.id}</strong>.</p>
                <div className="form-group">
                    <label>Reason for Request</label>
                    <textarea className="form-control" rows="3" value={requestReason} onChange={e => setRequestReason(e.target.value)} placeholder="Optional: Explain why you want to take this course..."></textarea>
                </div>
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