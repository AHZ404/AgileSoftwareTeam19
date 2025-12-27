import React, { useState, useEffect } from 'react';

const CourseManager = ({ course, onBack, user }) => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState('assignments'); 
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals and Forms
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', dueDate: '', dueTime: '23:59' });
  const [materialForm, setMaterialForm] = useState({ title: '', type: 'file' });
  const [selectedFile, setSelectedFile] = useState(null);

  // --- Data Loading ---
  useEffect(() => {
    if (course?.id || course?.CourseID) {
        refreshData();
    }
  }, [course]);

  const refreshData = async () => {
    const courseId = course.id || course.CourseID;
    try {
      setLoading(true);
      
      // 1. Load Assignments using the View-based API
      const assignResponse = await fetch(`http://localhost:5000/api/assignments/${courseId}`);
      if (assignResponse.ok) {
        const rawAssign = await assignResponse.json();
        const cleanAssign = rawAssign.map(a => ({
            id: a.AssignmentID,
            title: a.Title,
            // Splitting combined deadline back into date and time for the UI
            dueDate: a.Deadline ? a.Deadline.split(' ')[0] : '', 
            dueTime: a.Deadline ? a.Deadline.split(' ')[1] : '23:59',
            fileData: a.FileData,
            extension: a.Extension
        }));
        setAssignments(cleanAssign);
      }
      
      // 2. Load Materials using Attribute 37 filter
      const matResponse = await fetch(`http://localhost:5000/api/materials/${courseId}`);
            if (matResponse.ok) {
              const rawMat = await matResponse.json();
              const cleanMat = rawMat.map(m => ({
                  id: m.MaterialID,
                  title: m.Title,
                  // CRITICAL: Map the 'Extension' column from your SQL View
                  extension: m.Extension || 'link', 
                  fileData: m.FileData
              }));
                  setMaterials(cleanMat);
            }

      // 3. Load Submissions placeholder logic
      try {
          const subResponse = await fetch(`http://localhost:5000/api/submissions?courseId=${courseId}`);
          if (subResponse.ok) {
            const subData = await subResponse.json();
            setSubmissions(subData);
          }
      } catch (e) { console.warn("Submissions API not ready yet"); }

    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Helper: Download Function ---
 const downloadFile = (base64Data, fileName, extension) => {
  if (!base64Data || base64Data === "NULL") return alert("No file data available.");

  try {
    // 1. Clean data: Remove potential XML tags from SQL or Data URI headers
    let cleanBase64 = base64Data.replace(/<[^>]*>/g, "").trim();
    if (cleanBase64.includes(',')) cleanBase64 = cleanBase64.split(',')[1];

    // 2. Decode
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    // 3. Download
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith(extension) ? fileName : `${fileName}${extension}`;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (err) {
    alert("File conversion failed. Try uploading a fresh copy of this assignment.");
  }
};

  // --- Shared File Handler ---
  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      // Extract the extension (e.g., "pdf" or "docx")
      const fileExt = file.name.split('.').pop(); 
      
      setSelectedFile({
        name: file.name,
        type: file.type,
        extension: `.${fileExt}`, // Store the dot extension
        data: readerEvent.target.result
      });
    };
    reader.readAsDataURL(file);
  }
};

  // --- Assignment Handlers (UPDATED) ---
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please upload a file.");

    const courseId = course.id || course.CourseID;
    const newId = `ASG${Date.now()}`;

    try {
        const payload = {
            id: newId,
            type: 'assignment',
            attributes: {
                AssignmentTitle: formData.title,    // Attr 33
                DueDate: `${formData.dueDate} ${formData.dueTime}`, // Attr 34
                
                // 🛑 CHANGE THIS KEY to match image_2cd563.png exactly
                RelatedCourseId: courseId,          // Attr 37
                
                MaterialFile: selectedFile.data,     // Attr 31 or 5
                MaterialType: selectedFile.extension
            }
        };

        const response = await fetch('http://localhost:5000/api/entity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Assignment published!");
            setShowUploadModal(false);
            refreshData(); 
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

  const handleRemoveEntity = async (id) => {
    if (confirm('Are you sure you want to remove this item?')) {
      try {
        await fetch(`http://localhost:5000/api/entity/${id}`, { method: 'DELETE' });
        refreshData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  // --- Material Handlers ---
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    const courseId = course.id || course.CourseID;
    const newId = `MAT${Date.now()}`;
    
    // Extract extension (e.g., ".pdf") if a file is selected
    const fileExt = selectedFile ? `.${selectedFile.name.split('.').pop()}` : '';

    try {
      const payload = {
          id: newId,
    type: 'material',
    attributes: {
      MaterialTitle: materialForm.title,
      // 2. Save the extension into Attribute 30
      MaterialType: materialForm.type === 'file' ? fileExt : 'link', 
      RelatedCourseId: courseId, // Attribute 32
      ...(materialForm.type === 'file' && selectedFile ? { MaterialFile: selectedFile.data } : {})
          }
      };

      const response = await fetch('http://localhost:5000/api/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Material added successfully!");
        setShowMaterialModal(false);
        setMaterialForm({ title: '', type: 'file' });
        setSelectedFile(null);
        refreshData();
      }
    } catch (error) {
      console.error('Error uploading material:', error);
    }
};

  return (
    <div className="course-manager">
      {/* 1. Navigation Header */}
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        <i className="fas fa-arrow-left"></i> Back to Courses
      </button>

      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Managing: {course.title || course.Title}</h2>
      </div>

      {/* 2. Tab Menu */}
      <div className="auth-tabs" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div className={`auth-tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>Assignments</div>
        <div className={`auth-tab ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>Course Materials</div>
        <div className={`auth-tab ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>Submissions</div>
      </div>

      {/* 3. Tab Content: Assignments */}
      {activeTab === 'assignments' && (
        <div className="widget large">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3>Active Assignments</h3>
            <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>+ New Assignment</button>
          </div>
          <div className="assignments-list">
            {assignments.length === 0 ? (
              <p className="placeholder-text">No assignments uploaded.</p>
            ) : (
              assignments.map(a => (
                <div key={a.id} className="assignment-item" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                  <div className="assignment-info">
                    <div className="assignment-name" style={{fontWeight:'bold'}}>{a.title}</div>
                    <div className="assignment-details" style={{fontSize:'0.9rem', color:'#666'}}>
                      <i className="fas fa-calendar-alt"></i> Due: {a.dueDate} at {a.dueTime}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {/* UPDATED: Passing a.extension to the download function */}
                    <button className="btn btn-success" onClick={() => downloadFile(a.fileData, a.title, a.extension)}>
                      <i className="fas fa-download"></i>
                    </button>
                    <button className="btn btn-danger" onClick={() => handleRemoveEntity(a.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. Tab Content: Materials */}
      {activeTab === 'materials' && (
        <div className="widget large">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3>Course Materials</h3>
            <button className="btn btn-primary" onClick={() => setShowMaterialModal(true)}>+ Add Material</button>
          </div>
          <div className="materials-list">
            {materials.length === 0 ? (
              <p className="placeholder-text">No materials uploaded yet.</p>
            ) : (
              materials.map((mat) => (
                <div key={mat.id} className="material-item" style={{ display:'flex', justifyContent: 'space-between', padding:'10px', borderBottom:'1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {/* Icon changes based on whether it is a link or a file extension */}
                      <i className={`fas fa-${mat.extension === 'link' ? 'link' : 'file-pdf'}`} 
                        style={{ marginRight: '15px', color: 'var(--primary)', fontSize: '1.2rem' }}></i>
                      <div>
                        <strong style={{ display: 'block' }}>{mat.title}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{mat.extension}</span>
                      </div>
                    </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {/* UPDATED: Materials also use a.extension for downloads */}
                              {mat.extension !== 'link' && (
                  <button className="btn btn-success" onClick={() => downloadFile(mat.fileData, mat.title, mat.extension)}>
                    <i className="fas fa-download"></i>
                  </button>
                )}
                <button className="btn btn-danger" onClick={() => handleRemoveEntity(mat.id)}>
                  <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. Tab Content: Submissions */}
      {activeTab === 'submissions' && (
        <div className="widget large">
          <h3 style={{ marginBottom: '15px' }}>Student Submissions</h3>
          <p className="placeholder-text">Total Submissions: {submissions.length}</p>
          <p className="placeholder-text">Submissions feature is currently under development.</p>
        </div>
      )}

      {/* --- MODALS --- */}
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
                  <div className="form-group" style={{ flex: 1 }}><label>Deadline Date</label><input type="date" className="form-control" required value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} /></div>
                  <div className="form-group" style={{ flex: 1 }}><label>Deadline Time</label><input type="time" className="form-control" required value={formData.dueTime} onChange={e => setFormData({ ...formData, dueTime: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Assignment File</label><input type="file" className="form-control" onChange={handleFileChange} required /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Assignment</button>
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
}
export default CourseManager;