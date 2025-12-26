import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';

const InstructorCourseAssignment = ({ user }) => {
  const [activeCourses, setActiveCourses] = useState([]);

  const loadData = () => {
    universityDB.loadFromStorage();
    const courses = universityDB.getActiveCoursesWithEnrollments();
    setActiveCourses(courses);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignSelf = (courseId) => {
    if (confirm('Are you sure you want to co-teach this course?')) {
      try {
        universityDB.assignInstructorToCourse(courseId, user.id);
        alert('You have been added to this course!');
        loadData(); 
      } catch (e) {
        alert(e.message);
      }
    }
  };

  // --- NEW: Handle Unassign ---
  const handleUnassignSelf = (courseId) => {
    if (confirm('Are you sure you want to leave this course? You will no longer be listed as an instructor.')) {
      try {
        universityDB.removeInstructorFromCourse(courseId, user.id);
        alert('You have been removed from this course.');
        loadData();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  return (
    <div id="instructor-assignment-section" className="content-section">
      <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Course Assignment</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Assign yourself to active courses. You will be added as a co-instructor.
      </p>

      <div className="courses-grid">
        {activeCourses.length === 0 ? (
          <p className="placeholder-text">No active courses available.</p>
        ) : (
          activeCourses.map(course => {
            const instructors = universityDB.getInstructorsForCourse(course);
            const isAssignedToMe = instructors.some(inst => inst.id === user.id);

            return (
              <div key={course.id} className="course-card" style={{ borderTop: `5px solid ${course.color || 'var(--primary)'}` }}>
                <div className="course-header">
                  <h4>{course.id}: {course.title}</h4>
                  <span className="course-credits">{course.credits} Credits</span>
                </div>
                
                <div style={{ marginTop: '15px' }}>
                  <strong>Current Instructor(s):</strong> <br/>
                  {instructors.length > 0 ? (
                    <div style={{ marginTop: '5px' }}>
                        {instructors.map((inst, idx) => (
                            <span key={idx} style={{ 
                                display: 'inline-block',
                                backgroundColor: inst.id === user.id ? '#d1e7dd' : '#f8f9fa',
                                color: inst.id === user.id ? '#0f5132' : '#212529',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                marginRight: '5px',
                                marginBottom: '5px',
                                border: '1px solid #dee2e6'
                            }}>
                                {inst.firstName} {inst.lastName} {inst.id === user.id ? '(You)' : ''}
                            </span>
                        ))}
                    </div>
                  ) : (
                    <span style={{ color: 'red', fontStyle: 'italic' }}>Unassigned</span>
                  )}
                </div>

                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                  {course.schedule} | {course.location}
                </p>

                <div className="course-footer" style={{ marginTop: '20px' }}>
                  {isAssignedToMe ? (
                    // --- UPDATED: Leave Course Button ---
                    <button 
                        className="btn" 
                        onClick={() => handleUnassignSelf(course.id)}
                        style={{ 
                            backgroundColor: '#f8d7da', 
                            color: '#721c24', 
                            border: '1px solid #f5c6cb',
                            cursor: 'pointer' 
                        }}
                    >
                      <i className="fas fa-times-circle"></i> Leave Course
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleAssignSelf(course.id)}
                    >
                      Join as Instructor
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InstructorCourseAssignment;