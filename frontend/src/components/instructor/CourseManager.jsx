import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';

const CourseManager = ({ course, onBack }) => {
  // --- State Management ---
  // UPDATE: Included 'submissions' in the tab options
  const [activeTab, setActiveTab] = useState('assignments'); 
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [submissions, setSubmissions] = useState([]); // NEW: State for student work

  // Modals and Forms
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', dueDate: '', dueTime: '23:59' });
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'file' });
  const [selectedFile, setSelectedFile] = useState(null);

  // --- Data Loading ---
  useEffect(() => {
    refreshData();
  }, [course.id]);

  const refreshData = () => {
    universityDB.loadFromStorage();
    
    // Load Assignments
    const assignList = (universityDB.assignments || []).filter(a => a.courseId === course.id);
    setAssignments(assignList);
    
    // Load Materials
    const updatedCourse = universityDB.getCourseById(course.id);
    setMaterials(updatedCourse?.materials || []);

    // UPDATE: Load all submissions specifically for this course
    const submissionList = (universityDB.submissions || []).filter(s => s.courseId === course.id);
    setSubmissions(submissionList);
  };

  // --- Helper: Robust Download Function ---
  const downloadFile = (fileData, fileName) => {
    try {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file.");
    }
  };

  // --- Shared File Handler ---
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

  // --- Assignment Handlers ---
  const handleAssignmentSubmit = (e) => {
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
    refreshData();
  };

  const handleRemoveAssignment = (id) => {
    if (confirm('Remove this assignment? This deletes it for all students.')) {
      try {
        universityDB.deleteAssignment(id);
        refreshData();
      } catch (e) { alert(e.message); }
    }
  };

  // --- Material Handlers ---
  const handleMaterialSubmit = (e) => {
    e.preventDefault();
    const newMaterial = {
      title: materialForm.title,
      type: materialForm.type,
      icon: materialForm.type === 'file' ? 'file-pdf' : 'link',
      fileName: selectedFile?.name || null,
      fileData: selectedFile?.data || null
    };

    universityDB.addCourseMaterial(course.id, newMaterial);
    setShowMaterialModal(false);
    setMaterialForm({ title: '', type: 'file' });
    setSelectedFile(null);
    refreshData();
  };

  const handleDeleteMaterial = (index) => {
    if (confirm('Remove this material?')) {
      universityDB.removeCourseMaterial(course.id, index);
      refreshData();
    }
  };

  return (
    <div className="course-manager">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        <i className="fas fa-arrow-left"></i> Back to Courses
      </button>

      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Managing: {course.title}</h2>
      </div>

      {/* --- Tab Navigation --- */}
      {/* UPDATE: Added Submissions tab button */}
      <div className="auth-tabs" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div className={`auth-tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>Assignments</div>
        <div className={`auth-tab ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>Course Materials</div>
        <div className={`auth-tab ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>Submissions</div>
      </div>

      {/* --- ASSIGNMENTS TAB --- */}
      {activeTab === 'assignments' && (
        <div className="widget large">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3>Active Assignments</h3>
            <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>+ New Assignment</button>
          </div>
          <div className="assignments-list">
            {assignments.length === 0 ? <p className="placeholder-text">No assignments uploaded.</p> : assignments.map(a => (
              <div key={a.id} className="assignment-item" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="assignment-info">
                  <div className="assignment-name">{a.title}</div>
                  <div className="assignment-details">
                    <i className="fas fa-calendar-alt"></i> Deadline: {a.dueDate} at {a.dueTime} | 
                    <i className="fas fa-file-alt" style={{ marginLeft: '10px' }}></i> {a.fileName}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-success" onClick={() => downloadFile(a.fileData, a.fileName)}><i className="fas fa-download"></i></button>
                  <button className="btn btn-danger" onClick={() => handleRemoveAssignment(a.id)}><i className="fas fa-trash"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MATERIALS TAB --- */}
      {activeTab === 'materials' && (
        <div className="widget large">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3>Course Materials</h3>
            <button className="btn btn-primary" onClick={() => setShowMaterialModal(true)}>+ Add Material</button>
          </div>
          <div className="materials-list">
            {materials.length === 0 ? <p className="placeholder-text">No materials uploaded yet.</p> : materials.map((mat, index) => (
              <div key={index} className="material-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className={`fas fa-${mat.icon}`} style={{ marginRight: '15px', color: 'var(--primary)', fontSize: '1.2rem' }}></i>
                  <div>
                    <strong style={{ display: 'block' }}>{mat.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{mat.fileName || 'Resource Link'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {mat.fileData && (
                    <button className="btn btn-success" onClick={() => downloadFile(mat.fileData, mat.fileName)}><i className="fas fa-download"></i></button>
                  )}
                  <button className="btn btn-danger" onClick={() => handleDeleteMaterial(index)}><i className="fas fa-trash"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- UPDATE: NEW SUBMISSIONS TAB --- */}
      {activeTab === 'submissions' && (
        <div className="widget large">
          <h3 style={{ marginBottom: '15px' }}>Student Submissions</h3>
          <div className="assignments-list">
            {submissions.length === 0 ? (
              <p className="placeholder-text">No student submissions yet.</p>
            ) : (
              submissions.map(sub => {
                const student = universityDB.getStudentById(sub.studentId);
                const task = assignments.find(a => a.id === sub.assignmentId);
                
                return (
                  <div key={sub.id} className="assignment-item" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="assignment-info">
                      <div className="assignment-name" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                        {student ? `${student.firstName} ${student.lastName}` : `Student ${sub.studentId}`}
                      </div>
                      <div className="assignment-details">
                        <strong>Task:</strong> {task?.title || 'Unknown Assignment'} <br/>
                        <i className="fas fa-clock"></i> Submitted: {sub.submittedAt}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{sub.fileName}</span>
                        <button 
                            className="btn btn-success" 
                            title="Download Submission"
                            onClick={() => downloadFile(sub.fileData, sub.fileName)}
                        >
                            <i className="fas fa-download"></i>
                        </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- MODALS REMAIN UNCHANGED --- */}
      {showUploadModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload New Assignment</h3>
              <span className="close" onClick={() => setShowUploadModal(false)}>&times;</span>
            </div>
            <form onSubmit={handleAssignmentSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Title</label><input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}><label>Date</label><input type="date" className="form-control" required value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} /></div>
                  <div className="form-group" style={{ flex: 1 }}><label>Time</label><input type="time" className="form-control" required value={formData.dueTime} onChange={e => setFormData({ ...formData, dueTime: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>File</label><input type="file" className="form-control" onChange={handleFileChange} required /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMaterialModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Course Material</h3>
              <span className="close" onClick={() => setShowMaterialModal(false)}>&times;</span>
            </div>
            <form onSubmit={handleMaterialSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Title</label><input type="text" className="form-control" required value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} /></div>
                <div className="form-group"><label>Type</label>
                  <select className="form-control" value={materialForm.type} onChange={e => setMaterialForm({...materialForm, type: e.target.value})}>
                    <option value="file">File (PDF, Slides, etc.)</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
                {materialForm.type === 'file' && <div className="form-group"><label>File</label><input type="file" className="form-control" required onChange={handleFileChange} /></div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMaterialModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload Material</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManager;