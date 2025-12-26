import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';

const CourseManager = ({ course, onBack }) => {
  const [assignments, setAssignments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', dueDate: '', dueTime: '23:59' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, [course.id]);

  const loadAssignments = () => {
    universityDB.loadFromStorage();
    const list = (universityDB.assignments || []).filter(a => a.courseId === course.id);
    setAssignments(list);
  };

  // --- ADDED: Robust Download Function ---
  const downloadFile = (fileData, fileName) => {
    try {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup with a slight delay to ensure the browser processes the download
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setSelectedFile({
          name: file.name,
          type: file.type,
          data: readerEvent.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please upload a file.");

    const newAssignment = {
      courseId: course.id,
      title: formData.title,
      dueDate: formData.dueDate,
      dueTime: formData.dueTime,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      fileData: selectedFile.data
    };

    universityDB.createAssignment(newAssignment);
    alert("Assignment uploaded successfully!");
    setShowUploadModal(false);
    setFormData({ title: '', dueDate: '', dueTime: '23:59' });
    setSelectedFile(null);
    loadAssignments();
  };

  const handleRemoveAssignment = (id) => {
    if (confirm('Are you sure you want to remove this assignment? This will delete it for all students.')) {
      try {
        universityDB.deleteAssignment(id);
        loadAssignments();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  return (
    <div className="course-manager">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        <i className="fas fa-arrow-left"></i> Back to Courses
      </button>

      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Managing: {course.title}</h2>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          <i className="fas fa-plus"></i> New Assignment
        </button>
      </div>

      <div className="widget large" style={{ marginTop: '20px' }}>
        <h3>Active Assignments</h3>
        <div className="assignments-list">
          {assignments.length === 0 ? (
            <p className="placeholder-text">No assignments uploaded.</p>
          ) : (
            assignments.map(a => (
              <div key={a.id} className="assignment-item" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="assignment-info">
                  <div className="assignment-name">{a.title}</div>
                  <div className="assignment-details">
                    <i className="fas fa-calendar-alt"></i> Deadline: {a.dueDate} at {a.dueTime} | 
                    <i className="fas fa-file-alt" style={{ marginLeft: '10px' }}></i> {a.fileName}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Download Button */}
                  <button 
                    className="btn btn-success" 
                    title="Download Assignment"
                    type="button"
                    onClick={() => downloadFile(a.fileData, a.fileName)}
                  >
                    <i className="fas fa-download"></i>
                  </button>

                  {/* Remove Button */}
                  <button className="btn btn-danger" onClick={() => handleRemoveAssignment(a.id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload New Assignment</h3>
              <span className="close" onClick={() => setShowUploadModal(false)}>&times;</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Assignment Title</label>
                  <input type="text" className="form-control" required
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Deadline Date</label>
                    <input type="date" className="form-control" required
                      value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Due Time</label>
                    <input type="time" className="form-control" required
                      value={formData.dueTime} onChange={e => setFormData({ ...formData, dueTime: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Upload File</label>
                  <input type="file" className="form-control" onChange={handleFileChange} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManager;