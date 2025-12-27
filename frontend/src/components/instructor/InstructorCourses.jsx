import React, { useState, useEffect } from 'react';
import CourseManager from './CourseManager';

const InstructorCourses = ({ user }) => {
  const [myCourses, setMyCourses] = useState([]);
  const [enrollmentMap, setEnrollmentMap] = useState({}); // Stores list of students per course
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Modal for viewing students
  const [viewingStudentsCourse, setViewingStudentsCourse] = useState(null);
  const [currentStudentList, setCurrentStudentList] = useState([]);

  useEffect(() => {
    loadCourses();
  }, [user.id]);

  const loadCourses = async () => {
    try {
      // 1. Fetch ALL Courses (Fast View)
      const coursesRes = await fetch('http://localhost:5000/api/courses');
      const allCourses = await coursesRes.json() || [];

      // 2. Filter: Only courses where "InstructorID" matches current user
      const myTeachingCourses = allCourses.filter(c => c.InstructorID === user.id);
      setMyCourses(myTeachingCourses);

      // 3. Fetch Enrollment Counts (Optimized)
      // We fetch all enrollments once to count them. 
      // Note: In a huge real app, we'd make a specific SQL query count, 
      // but for this size, fetching /api/enrollments is fine.
      const enrollRes = await fetch('http://localhost:5000/api/enrollments');
      const allEnrollments = await enrollRes.json() || [];

      // 3. Group by CourseId using the exact column names from image_2e8973
      const eMap = {};
      allEnrollments.forEach(e => {
          // Note: Use 'CourseId' (PascalCase) to match your table
          const cId = e.CourseId; 
          if (!eMap[cId]) eMap[cId] = [];
          eMap[cId].push(e);
      });
      setEnrollmentMap(eMap);

    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  // --- Helper to load student names for a specific course ---
  const handleViewStudents = async (course) => {
    setViewingStudentsCourse(course);
    setCurrentStudentList([]); // Clear previous list

    const enrollments = enrollmentMap[course.CourseID] || [];
    if (enrollments.length === 0) return;

    // Fetch details for these specific students only
    const studentPromises = enrollments.map(async (e) => {
        try {
            const sid = e.StudentId || e.studentId;
            const res = await fetch(`http://localhost:5000/api/entity/${sid}`);
            const sData = await res.json();
            return {
                id: sid,
                name: `${sData.firstName} ${sData.lastName}`,
                status: e.Status || e.status
            };
        } catch (err) {
            return { id: e.StudentId, name: 'Unknown Student', status: 'error' };
        }
    });

    const resolvedStudents = await Promise.all(studentPromises);
    setCurrentStudentList(resolvedStudents);
  };

  if (selectedCourse) {
    // Pass the normalized course object
    return <CourseManager course={{...selectedCourse, id: selectedCourse.CourseID}} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div id="instructor-courses-section" className="content-section">
      <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>My Courses</h2>

      <div className="courses-grid">
        {myCourses.length === 0 ? (
          <div className="placeholder-text" style={{ gridColumn: '1 / -1' }}>
             <p>You are not assigned to any courses.</p>
             <button className="btn btn-secondary" style={{marginTop:'10px'}}>Go to Course Assignment</button>
          </div>
        ) : (
          myCourses.map(course => {
            // Note: SQL View returns PascalCase 'CourseID'
            const enrollments = enrollmentMap[course.CourseID] || [];
            const enrolledCount = enrollments.filter(e => (e.Status||e.status) === 'approved').length;
            const pendingCount = enrollments.filter(e => (e.Status||e.status) === 'pending').length;

            return (
              <div key={course.CourseID} className="course-card" style={{ 
                  borderTop: `5px solid ${course.Color || 'var(--primary)'}`,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px'
              }}>
                <div>
                    <div className="course-header">
                      <h4>{course.CourseID}: {course.Title}</h4>
                      <span className="course-credits">{course.Credits} Credits</span>
                    </div>
                    
                    <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9rem' }}>
                      <i className="fas fa-clock" style={{ width: '20px' }}></i> {course.ScheduleDay} {course.ScheduleTime}
                    </p>

                    {/* --- Clickable Student Stats --- */}
                    <div 
                      className="enrolled-students-trigger"
                      onClick={() => handleViewStudents(course)}
                      style={{ 
                        marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', 
                        borderRadius: '4px', cursor: 'pointer', border: '1px solid #eee'
                      }}
                    >
                        <div style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                            <i className="fas fa-user-graduate"></i> {enrolledCount} Active Students
                        </div>
                        {pendingCount > 0 && (
                            <div style={{ fontSize:'0.85rem', color: 'orange', marginTop:'5px' }}>
                                <i className="fas fa-exclamation-circle"></i> {pendingCount} Pending Approval
                            </div>
                        )}
                    </div>
                </div>

                <div className="course-footer" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedCourse(course)}>
                    Manage Course Content
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- Student List Modal --- */}
      {viewingStudentsCourse && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Students: {viewingStudentsCourse.Title}</h3>
              <span className="close" onClick={() => setViewingStudentsCourse(null)}>&times;</span>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="assignments-list">
                {currentStudentList.length === 0 ? (
                    <p className="placeholder-text">Loading student list...</p>
                ) : (
                    currentStudentList.map(s => (
                      <div key={s.id} className="assignment-item" style={{ 
                          borderLeft: `4px solid ${s.status === 'approved' ? 'green' : 'orange'}`,
                          padding: '10px'
                      }}>
                        <div className="assignment-name">
                          {s.name}
                        </div>
                        <div className="assignment-details" style={{ display:'flex', justifyContent:'space-between', width:'100%' }}>
                            <span>ID: {s.id}</span>
                            <span style={{ 
                                textTransform: 'uppercase', 
                                fontSize: '0.75rem', 
                                fontWeight:'bold',
                                color: s.status === 'approved' ? 'green' : 'orange' 
                            }}>{s.status}</span>
                        </div>
                      </div>
                    ))
                )}
                {currentStudentList.length === 0 && enrollmentMap[viewingStudentsCourse.CourseID]?.length === 0 && (
                    <p className="placeholder-text">No students enrolled yet.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingStudentsCourse(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;