import React, { useState, useEffect } from 'react';

const InstructorCourseAssignment = ({ user }) => {
  const [activeCourses, setActiveCourses] = useState([]);
  const [instructorData, setInstructorData] = useState({}); // Stores names like { 'INS001': 'Dr. Smith' }

  // 1. Load Courses
  const loadData = async () => {
    try {
      // Use the View-based API (Fast)
      const coursesRes = await fetch('http://localhost:5000/api/courses');
      const courses = await coursesRes.json() || [];
      setActiveCourses(courses);

      // 2. Fetch details for assigned instructors
      const newInstructorData = {};
      
      // Find unique instructor IDs from the course list
      const instructorIds = [...new Set(courses.map(c => c.InstructorID).filter(id => id))];

      // Fetch details for each instructor (in parallel)
      await Promise.all(instructorIds.map(async (instId) => {
          try {
              const res = await fetch(`http://localhost:5000/api/entity/${instId}`);
              const data = await res.json();
              newInstructorData[instId] = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          } catch (e) {
              console.warn(`Could not load name for ${instId}`);
              newInstructorData[instId] = instId; // Fallback to ID
          }
      }));

      setInstructorData(newInstructorData);

    } catch (err) {
      console.error('Error loading courses:', err);
      setActiveCourses([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 3. Assign Self (Updates 'InstructorId' attribute)
  const handleAssignSelf = async (courseId) => {
    if (confirm('Take over this course as the Instructor?')) {
      try {
        // NOTE: matches the Generic Admin Tool in server.js
        await fetch(`http://localhost:5000/api/entity/${courseId}/InstructorId`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: user.id })
        });
        alert('You are now the instructor for this course!');
        loadData();
      } catch (err) {
        console.error('Error assigning instructor:', err);
        alert('Failed to update course.');
      }
    }
  };

  // 4. Leave Course
  const handleUnassignSelf = async (courseId) => {
    if (confirm('Remove yourself from this course?')) {
      try {
        await fetch(`http://localhost:5000/api/entity/${courseId}/InstructorId`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: '' }) // Clear the value
        });
        alert('You have been removed.');
        loadData();
      } catch (err) {
        console.error('Error removing instructor:', err);
      }
    }
  };

  return (
    <div id="instructor-assignment-section" className="content-section">
      <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Course Assignment</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Select courses you are teaching this semester.
      </p>

      <div className="courses-grid">
        {activeCourses.length === 0 ? (
          <p className="placeholder-text">No courses found in the system.</p>
        ) : (
          activeCourses.map(course => {
            // Check if I am the instructor
            const currentInstId = course.InstructorID;
            const isAssignedToMe = currentInstId === user.id;
            const instructorName = instructorData[currentInstId] || 'Unassigned';

            return (
              <div key={course.CourseID || course.id} className="course-card" style={{ 
                  borderTop: `5px solid ${isAssignedToMe ? 'var(--success)' : 'var(--primary)'}` 
              }}>
                <div className="course-header">
                  <h4>{course.Title}</h4>
                  <span className="course-credits">{course.Credits} Credits</span>
                </div>
                
                <div style={{ marginTop: '15px' }}>
                  <strong>Instructor:</strong> <br/>
                  <span style={{ 
                      color: currentInstId ? '#333' : 'red',
                      fontStyle: currentInstId ? 'normal' : 'italic'
                  }}>
                      {currentInstId ? instructorName : 'No Instructor Assigned'}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                  {course.ScheduleDay} {course.ScheduleTime}
                </p>

                <div className="course-footer" style={{ marginTop: '20px' }}>
                  {isAssignedToMe ? (
                    <button 
                        className="btn" 
                        onClick={() => handleUnassignSelf(course.CourseID || course.id)}
                        style={{ backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }}
                    >
                      <i className="fas fa-times-circle"></i> Leave Course
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleAssignSelf(course.CourseID || course.id)}
                      disabled={!!currentInstId} // Disable if someone else is already assigned (Optional)
                      title={currentInstId ? "Course already has an instructor" : "Assign Self"}
                      style={{ opacity: currentInstId ? 0.6 : 1 }}
                    >
                      {currentInstId ? 'Taken' : 'Teach this Course'}
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