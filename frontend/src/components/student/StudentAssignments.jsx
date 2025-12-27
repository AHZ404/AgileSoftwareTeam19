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
      const coursesRes = await fetch(`http://localhost:5000/api/my-courses/${user.id}`);
      const enrolledCourses = await coursesRes.json() || [];

      if (enrolledCourses.length === 0) {
        setMyAssignments([]);
        return;
      }

      const assignmentPromises = enrolledCourses.map(async (course) => {
          const cId = course.CourseId || course.CourseID; 
          const res = await fetch(`http://localhost:5000/api/assignments/${cId}`);
          const assignments = await res.json() || [];
          
          return assignments.map(a => ({
              ...a,
              courseTitle: course.Title || course.title,
              courseId: cId,
              status: 'PENDING' // Default status
          }));
      });

      const results = await Promise.all(assignmentPromises);
      setMyAssignments(results.flat());
      
    } catch (err) {
      console.error('Error loading assignments:', err);
      setMyAssignments([]);
    }
  };

  const downloadInstruction = (base64Data, fileName, extension) => {
    if (!base64Data) return alert("No instruction file available.");
    try {
      const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const byteCharacters = atob(base64Content.trim());
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}${extension || '.pdf'}`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      alert("Error downloading instructions.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSubmissionFile({
          name: file.name,
          extension: `.${file.name.split('.').pop()}`,
          data: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitWork = async (e) => {
  e.preventDefault();
  if (!submissionFile) return alert("Please select a file to submit.");

  // Use the ID from the selectedAssignment state
  const targetAssignmentId = selectedAssignment.AssignmentID;
  const targetCourseId = selectedAssignment.courseId;
  const newId = `SUB${Date.now()}`;

  try {
    const payload = {
        id: newId,
        type: 'submission',
        attributes: {
            // These keys must match your SQL View exactly to avoid NULLs
            StudentId: user.id,
            AssignmentId: targetAssignmentId, 
            CourseId: targetCourseId,
            SubmissionDate: new Date().toLocaleString(),
            MaterialFile: submissionFile.data,
            MaterialType: submissionFile.extension 
        }
    };

    const response = await fetch('http://localhost:5000/api/entity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("Assignment submitted successfully!");
      
      // Update local state so the badge turns green
      setMyAssignments(prev => prev.map(asgn => 
        asgn.AssignmentID === targetAssignmentId ? { ...asgn, status: 'SUBMITTED' } : asgn
      ));

      setSubmitModalOpen(false);
      setSubmissionFile(null);
    }
  } catch (err) {
    console.error('Error submitting assignment:', err);
    alert("Submission failed. Check console for details.");
  }
};

  return (
    <div id="assignments-section" className="content-section">
      <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Your Course Work</h2>
      
      <div className="requests-grid">
        {myAssignments.length === 0 ? (
          <p className="placeholder-text">No assignments posted for your courses.</p>
        ) : (
          myAssignments.map(a => (
            <div key={a.AssignmentID} className="request-item" style={{ 
              borderLeft: `5px solid ${a.status === 'SUBMITTED' ? '#28a745' : 'var(--primary)'}`, 
              backgroundColor: 'white', 
              marginBottom: '15px' 
            }}>
              <div className="request-header">
                <div className="request-info">
                  <h4 style={{ color: 'var(--primary)' }}>{a.courseId}: {a.courseTitle}</h4>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{a.Title}</div>
                </div>
                <span className="request-status" style={{ 
                  backgroundColor: a.status === 'SUBMITTED' ? '#28a745' : '#ffc107', 
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {a.status}
                </span>
              </div>

              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#dc3545', fontWeight: 'bold' }}>
                    <i className="fas fa-clock"></i> Due: {a.Deadline}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-success" onClick={() => downloadInstruction(a.FileData, a.Title, a.Extension)}>
                    <i className="fas fa-download"></i> Instructions
                  </button>
                  
                  {a.status === 'SUBMITTED' ? (
                    <button className="btn btn-secondary" disabled>Handed In</button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => {
                        setSelectedAssignment(a);
                        setSubmitModalOpen(true);
                    }}>
                      Submit Work
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {submitModalOpen && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submit: {selectedAssignment?.Title}</h3>
              <span className="close" onClick={() => setSubmitModalOpen(false)}>&times;</span>
            </div>
            <form onSubmit={handleSubmitWork}>
              <div className="modal-body">
                <p><strong>Course:</strong> {selectedAssignment?.courseId}</p>
                <div className="form-group">
                  <label>Select Your File</label>
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