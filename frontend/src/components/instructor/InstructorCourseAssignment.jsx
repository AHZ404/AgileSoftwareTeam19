import React, { useState, useEffect } from 'react';

const InstructorCourseAssignment = ({ user }) => {
  const [activeCourses, setActiveCourses] = useState([]);
  const [instructorData, setInstructorData] = useState({}); // { 'INST_ID': 'Full Name' }

  const loadData = async () => {
    try {
      // 1. Fetch courses from the View
      const coursesRes = await fetch('http://localhost:5000/api/courses');
      const courses = await coursesRes.json() || [];
      setActiveCourses(courses);

      // 2. Identify unique instructor IDs from the list
      const instructorIds = [...new Set(courses.map(c => c.InstructorID).filter(id => id))];
      const newInstructorData = { ...instructorData };

      // 3. Fetch names for these instructors to display on the cards
      await Promise.all(instructorIds.map(async (instId) => {
        if (!newInstructorData[instId]) {
          try {
            const res = await fetch(`http://localhost:5000/api/entity/${instId}`);
            const data = await res.json();
            // Map the name from the entity attributes
            newInstructorData[instId] = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          } catch (e) {
            console.warn(`Could not load name for ${instId}`);
            newInstructorData[instId] = instId; // Fallback to ID
          }
        }
      }));

      setInstructorData(newInstructorData);
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleAssignSelf = async (courseId) => {
    if (!confirm('Take over this course as the Instructor?')) return;

    try {
      // Uses the POST endpoint we defined to update Attribute 27
      const res = await fetch('http://localhost:5000/api/courses/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            courseId: courseId, 
            instructorId: user.id 
        })
      });

      if (res.ok) {
        alert('You are now the instructor for this course!');
        loadData();
      } else {
        alert('Failed to assign course.');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleUnassignSelf = async (courseId) => {
    if (!confirm('Are you sure you want to leave this course?')) return;
    
    try {
      // Calling the new DELETE API specifically for unassigning
      const res = await fetch(`http://localhost:5000/api/courses/unassign/${courseId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        alert('You have successfully left the course.');
        // Refresh data so the View_Courses re-renders with 'Unassigned'
        loadData();
      } else {
        const errorData = await res.json();
        alert(`Failed to leave course: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('A network error occurred.');
    }
  };

  return (
    <div id="instructor-assignment-section" className="content-section">
      <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Course Assignment</h2>
      
      <div className="courses-grid">
        {activeCourses.length === 0 ? (
          <p className="placeholder-text">No courses found.</p>
        ) : (
          activeCourses.map(course => {
            const currentInstId = course.InstructorID;
            const isAssignedToMe = String(currentInstId) === String(user.id);
            
            // Logic to display the name correctly under the course title
            let displayName = 'Unassigned';
            if (isAssignedToMe) {
                displayName = "You (Assigned)";
            } else if (currentInstId) {
                displayName = instructorData[currentInstId] || currentInstId;
            }

            return (
              <div key={course.CourseID} className="course-card" style={{ 
                  borderTop: `5px solid ${isAssignedToMe ? 'var(--success)' : 'var(--primary)'}` 
              }}>
                <div className="course-header">
                  <h4>{course.Title}</h4>
                  <span className="course-credits">{course.Credits} Credits</span>
                </div>
                
                <div style={{ marginTop: '15px' }}>
                  <strong>Instructor:</strong> <br/>
                  <span style={{ 
                      color: currentInstId ? (isAssignedToMe ? 'green' : '#333') : 'red',
                      fontWeight: isAssignedToMe ? 'bold' : 'normal'
                  }}>
                      {displayName}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                  {course.ScheduleDay} | {course.ScheduleTime}
                </p>

                <div className="course-footer" style={{ marginTop: '20px' }}>
                  {isAssignedToMe ? (
                    <button className="btn btn-danger btn-sm" onClick={() => handleUnassignSelf(course.CourseID)}>
                      Leave Course
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleAssignSelf(course.CourseID)}
                      disabled={!!currentInstId} // Disable if someone else is already there
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