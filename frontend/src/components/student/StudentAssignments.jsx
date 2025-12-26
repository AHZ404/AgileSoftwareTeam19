import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';

const StudentAssignments = ({ user }) => {
  const [myAssignments, setMyAssignments] = useState([]);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = () => {
    universityDB.loadFromStorage();
    const enrolledCourses = universityDB.getCoursesByStudent(user.id) || [];
    const courseIds = enrolledCourses.map(c => c.id);
    const allAssignments = universityDB.assignments || [];
    
    const filtered = allAssignments.filter(a => courseIds.includes(a.courseId));
    setMyAssignments(filtered);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSubmissionFile({
          name: file.name,
          data: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitWork = (e) => {
    e.preventDefault();
    if (!submissionFile) return alert("Please select a file to submit.");

    universityDB.submitAssignment({
      studentId: user.id,
      assignmentId: selectedAssignment.id,
      courseId: selectedAssignment.courseId,
      fileName: submissionFile.name,
      fileData: submissionFile.data,
      submittedAt: new Date().toLocaleString()
    });

    alert("Assignment submitted successfully!");
    setSubmitModalOpen(false);
    setSubmissionFile(null);
    loadData();
  };

  return (
    <div id="assignments-section" className="content-section">
      <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Your Course Work</h2>
      
      <div className="requests-grid">
        {myAssignments.length === 0 ? (
          <p className="placeholder-text">No assignments posted for your courses.</p>
        ) : (
          myAssignments.map(a => {
            const course = universityDB.getCourseById(a.courseId);
            const submission = universityDB.getSubmission(user.id, a.id);
            
            return (
              <div key={a.id} className="request-item" style={{ borderLeft: '5px solid var(--primary)', backgroundColor: 'white' }}>
                <div className="request-header">
                  <div className="request-info">
                    <h4 style={{ color: 'var(--primary)' }}>{a.courseId}: {course?.title}</h4>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{a.title}</div>
                  </div>
                  <span className={`request-status status-${submission ? 'approved' : 'pending'}`}>
                    {submission ? 'SUBMITTED' : 'NOT SUBMITTED'}
                  </span>
                </div>

                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#dc3545', fontWeight: 'bold' }}>
                      <i className="fas fa-clock"></i> Due: {a.dueDate} at {a.dueTime}
                    </p>
                    {submission && (
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#28a745' }}>
                            <i className="fas fa-check-circle"></i> Done: {submission.submittedAt}
                        </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Instructor's File Download */}
                    <button className="btn btn-secondary" onClick={() => {
                        const link = document.createElement('a');
                        link.href = a.fileData;
                        link.download = a.fileName;
                        link.click();
                    }} title="Download Assignment Instructions">
                        <i className="fas fa-file-download"></i>
                    </button>

                    {/* Submit Button */}
                    {!submission ? (
                        <button className="btn btn-primary" onClick={() => {
                            setSelectedAssignment(a);
                            setSubmitModalOpen(true);
                        }}>
                            Submit Work
                        </button>
                    ) : (
                        <button className="btn" disabled style={{ backgroundColor: '#d1e7dd', color: '#0f5132' }}>
                            Submitted
                        </button>
                    )}
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
              <h3>Submit: {selectedAssignment.title}</h3>
              <span className="close" onClick={() => setSubmitModalOpen(false)}>&times;</span>
            </div>
            <form onSubmit={handleSubmitWork}>
              <div className="modal-body">
                <p>Course: {selectedAssignment.courseId}</p>
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