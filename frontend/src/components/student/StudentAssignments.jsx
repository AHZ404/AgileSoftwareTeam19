import React, { useState, useEffect } from 'react';

const StudentAssignments = ({ user }) => {
  const [myAssignments, setMyAssignments] = useState([]);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      // 1. Fetch Enrolled Courses
      // Use the correct endpoint from our server.js
      const coursesRes = await fetch(`http://localhost:5000/api/my-courses/${user.id}`);
      const enrolledCourses = await coursesRes.json() || [];

      if (enrolledCourses.length === 0) {
        setMyAssignments([]);
        return;
      }

      // 2. Fetch Assignments for EACH Course
      // We run these requests in parallel for speed
      const assignmentPromises = enrolledCourses.map(async (course) => {
          // Note: SQL View returns PascalCase 'CourseID'
          const cId = course.CourseID || course.id; 
          const res = await fetch(`http://localhost:5000/api/assignments/${cId}`);
          const assignments = await res.json() || [];
          
          // Attach course title to each assignment for display
          return assignments.map(a => ({
              ...a,
              courseTitle: course.Title || course.title,
              courseId: cId
          }));
      });

      const results = await Promise.all(assignmentPromises);
      const allAssignments = results.flat(); // Combine into one list

      // 3. Load Student's Previous Submissions (Optional, but good for UI)
      // Since we don't have a specific GET /submissions API for students yet,
      // we will assume "submissionStatus" is false for now. 
      // In a full app, you'd fetch your submissions here to show green checks.
      
      setMyAssignments(allAssignments);
      
    } catch (err) {
      console.error('Error loading assignments:', err);
      setMyAssignments([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSubmissionFile({
          name: file.name,
          data: event.target.result // Base64 string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionFile) return alert("Please select a file to submit.");

    // Generate Submission ID
    const newId = `SUB${Date.now()}`;

    try {
      // FIX: Use the Generic EAV Endpoint
      const payload = {
          id: newId,
          type: 'submission',
          attributes: {
              StudentId: user.id,
              AssignmentId: selectedAssignment.AssignmentID || selectedAssignment.id,
              CourseId: selectedAssignment.courseId,
              SubmissionDate: new Date().toISOString(),
              File: submissionFile.data, // Base64
              FileName: submissionFile.name
          }
      };

      const response = await fetch('http://localhost:5000/api/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Assignment submitted successfully!");
        setSubmitModalOpen(false);
        setSubmissionFile(null);
        // Ideally we would reload data here or mark this assignment as 'submitted' locally
      } else {
        alert("Error submitting assignment");
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert('Error: ' + err.message);
    }
  };

  // Helper to download the Instructor's assignment file
  const downloadInstruction = async (assignment) => {
     // Use the backend entity ID if available, or just alert if only view data
     alert("Downloading instructions...");
     // In real app: fetch(`http://localhost:5000/api/entity/${assignment.id}`)
  };

  return (
    <div id="assignments-section" className="content-section">
      <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Your Course Work</h2>
      
      <div className="requests-grid">
        {myAssignments.length === 0 ? (
          <p className="placeholder-text">No assignments posted for your courses.</p>
        ) : (
          myAssignments.map(a => {
            // Mapping keys from SQL View (PascalCase) or lowercase fallback
            const aId = a.AssignmentID || a.id;
            const aTitle = a.Title || a.title;
            const aDue = a.DueDate || a.dueDate;

            return (
              <div key={aId} className="request-item" style={{ 
                  borderLeft: '5px solid var(--primary)', 
                  backgroundColor: 'white',
                  marginBottom: '15px'
              }}>
                <div className="request-header">
                  <div className="request-info">
                    <h4 style={{ color: 'var(--primary)' }}>{a.courseId}: {a.courseTitle}</h4>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{aTitle}</div>
                  </div>
                  {/* Status badge - defaulted to Pending as we aren't fetching submissions yet */}
                  <span className="request-status status-pending">
                    PENDING
                  </span>
                </div>

                <div style={{ 
                    backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', 
                    marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#dc3545', fontWeight: 'bold' }}>
                      <i className="fas fa-clock"></i> Due: {aDue}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Submit Button */}
                    <button className="btn btn-primary" onClick={() => {
                        setSelectedAssignment(a);
                        setSubmitModalOpen(true);
                    }}>
                        Submit Work
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Modal */}
      {submitModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submit: {selectedAssignment?.Title || selectedAssignment?.title}</h3>
              <span className="close" onClick={() => setSubmitModalOpen(false)}>&times;</span>
            </div>
            <form onSubmit={handleSubmitWork}>
              <div className="modal-body">
                <p><strong>Course:</strong> {selectedAssignment?.courseId}</p>
                <div className="form-group">
                  <label>Select Your File (PDF, Word, etc.)</label>
                  <input type="file" className="form-control" required onChange={handleFileChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSubmitModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;