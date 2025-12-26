import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';
import CourseManager from './CourseManager';

const InstructorCourses = ({ user }) => {
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // --- NEW: State for viewing student list ---
  const [viewingStudentsCourse, setViewingStudentsCourse] = useState(null);

  useEffect(() => {
    universityDB.loadFromStorage();
    const allCourses = universityDB.getAllCourses();
    const filtered = allCourses.filter(c => {
        const ids = c.instructorIds || [];
        const effectiveIds = ids.length > 0 ? ids : (c.instructorId ? [c.instructorId] : []);
        return effectiveIds.includes(user.id);
    });
    setMyCourses(filtered);
  }, [user.id]);

  if (selectedCourse) {
    return <CourseManager course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div id="instructor-courses-section" className="content-section">
      <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>My Courses</h2>

      <div className="courses-grid">
        {myCourses.length === 0 ? (
          <p className="placeholder-text">You have not assigned yourself to any courses yet.</p>
        ) : (
          myCourses.map(course => {
            const enrollments = (universityDB.enrollments || []).filter(e => e.courseId === course.id);
            const enrolledCount = enrollments.length;

            return (
              <div key={course.id} className="course-card" style={{ 
                  borderTop: `5px solid ${course.color || 'var(--primary)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '200px'
              }}>
                <div>
                    <div className="course-header">
                      <h4>{course.id}: {course.title}</h4>
                      <span className="course-credits">{course.credits} Credits</span>
                    </div>
                    
                    <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9rem' }}>
                      <i className="fas fa-clock" style={{ width: '20px' }}></i> {course.schedule}
                    </p>
                    <p style={{ marginTop: '5px', color: '#666', fontSize: '0.9rem' }}>
                      <i className="fas fa-map-marker-alt" style={{ width: '20px' }}></i> {course.location}
                    </p>

                    {/* --- UPDATED: Clickable/Hoverable Students Enrolled Area --- */}
                    <div 
                      className="enrolled-students-trigger"
                      onClick={() => setViewingStudentsCourse(course)}
                      style={{ 
                        marginTop: '15px', 
                        padding: '10px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      // Inline hover simulation (Note: CSS classes are preferred for hover)
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    >
                        <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                            <i className="fas fa-user-graduate"></i> {enrolledCount} Students Enrolled
                        </span>
                    </div>
                </div>

                <div className="course-footer" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedCourse(course)}>
                    Manage Course
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --- NEW: Enrolled Students Modal --- */}
      {viewingStudentsCourse && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Students: {viewingStudentsCourse.id}</h3>
              <span className="close" onClick={() => setViewingStudentsCourse(null)}>&times;</span>
            </div>
            <div className="modal-body">
              <div className="assignments-list">
                {(() => {
                  const enrollments = (universityDB.enrollments || []).filter(e => e.courseId === viewingStudentsCourse.id);
                  if (enrollments.length === 0) return <p className="placeholder-text">No students enrolled.</p>;
                  
                  return enrollments.map(e => {
                    const student = universityDB.getStudentById(e.studentId);
                    return (
                      <div key={e.studentId} className="assignment-item" style={{ borderLeftColor: 'var(--success)' }}>
                        <div className="assignment-name">
                          {student ? `${student.firstName} ${student.lastName}` : `Student ID: ${e.studentId}`}
                        </div>
                        <div className="assignment-details">ID: {e.studentId}</div>
                      </div>
                    );
                  });
                })()}
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