import React, { useState, useEffect } from 'react';

const CourseManager = ({ course, onBack }) => {
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
      
      // 1. Load Assignments
      const assignResponse = await fetch(`http://localhost:5000/api/assignments/${courseId}`);
      if (assignResponse.ok) {
        const rawAssign = await assignResponse.json();
        // Normalize Data
        const cleanAssign = rawAssign.map(a => ({
            id: a.AssignmentID || a.id,
            title: a.Title || a.AssignmentTitle,
            dueDate: a.DueDate ? a.DueDate.split('T')[0] : '', // Handle SQL Date format
            dueTime: '23:59', // SQL View might not have time, default it
            fileName: 'Download', // View might not return filename, generic label
            // Note: View_Assignments might need file data to download, but usually we fetch specific entity for that.
            // For now, we assume simple list. If you need file data in list, View needs updating.
        }));
        setAssignments(cleanAssign);
      }
      
      // 2. Load Materials
      const matResponse = await fetch(`http://localhost:5000/api/materials/${courseId}`);
      if (matResponse.ok) {
        const rawMat = await matResponse.json();
        const cleanMat = rawMat.map(m => ({
            id: m.MaterialID,
            title: m.Title || m.MaterialTitle,
            type: m.Type || m.MaterialType,
            fileName: 'Download',
            fileEntityID: m.FileEntityID // Crucial for downloading
        }));
        setMaterials(cleanMat);
      }

      // 3. Load Submissions (Assuming you have an endpoint or using Entity logic)
      // Since we didn't explicitly build GET /api/submissions in server.js yet, 
      // we might skip this or use a generic fetch if you added it.
      // For now, keeping your code but wrapping in try/catch to not block others.
      try {
          const subResponse = await fetch(`/api/submissions?courseId=${courseId}`);
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

  // --- Helper: Robust Download Function ---
  // If we have direct base64 data, download it. 
  // If we only have an ID (from View), fetch the full entity then download.
  const downloadFile = async (fileData, fileName, entityId) => {
    try {
      let dataToDownload = fileData;
      let nameToDownload = fileName;

      // If we don't have the binary data but have the ID, fetch it first
      if (!dataToDownload && entityId) {
          const res = await fetch(`http://localhost:5000/api/entity/${entityId}`);
          const entity = await res.json();
          // Logic depends on how you saved it. 
          // If saved as 'File' attribute:
          dataToDownload = entity.File || entity.MaterialFile || entity.file; 
          // If strictly binary in DB, backend returns "FILE_BINARY_DATA". 
          // Real apps usually stream bytes. For this EAV demo, 
          // we might need the specific Attribute that holds the Base64 string.
          // Since our server GET /entity/:id returns "FILE_BINARY_DATA" text for binary columns,
          // direct download from that endpoint in this specific setup is tricky without a specific "download" endpoint.
          // However, if you saved 'File' as Base64 string in ValueText (small files), it works.
          // If saved in ValueBinary, we need a specific endpoint to stream it back.
          
          // For this specific project scope/demo:
          alert("File download simulated. In a real app, this streams the binary data.");
          return;
      }

      if (!dataToDownload) return alert("No file data available.");

      const link = document.createElement('a');
      link.href = dataToDownload; // Assumes Base64 Data URI
      link.download = nameToDownload || 'download';
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
          data: readerEvent.target.result // Base64 string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Assignment Handlers ---
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please upload a file.");

    const courseId = course.id || course.CourseID;
    // Generate ID: ASG + Timestamp
    const newId = `ASG${Date.now()}`;

    try {
      const payload = {
        id: newId,
        type: 'assignment',
        attributes: {
            AssignmentTitle: formData.title,
            DueDate: formData.dueDate, // YYYY-MM-DD
            RelatedCourseId: courseId,
            File: selectedFile.data // Save Base64 directly (for demo simplicity)
        }
      };

      const response = await fetch('http://localhost:5000/api/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      alert("Assignment uploaded successfully!");
      setShowUploadModal(false);
      setFormData({ title: '', dueDate: '', dueTime: '23:59' });
      setSelectedFile(null);
      refreshData();
    } catch (error) {
      console.error('Error uploading assignment:', error);
      alert('Failed to upload assignment');
    }
  };

  const handleRemoveAssignment = async (id) => {
    if (confirm('Remove this assignment?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/entity/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        refreshData();
      } catch (error) {
        console.error('Error deleting assignment:', error);
        alert('Failed to delete assignment');
      }
    }
  };

  // --- Material Handlers ---
  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    const courseId = course.id || course.CourseID;
    const newId = `MAT${Date.now()}`;
    
    try {
      const payload = {
          id: newId,
          type: 'material',
          attributes: {
              MaterialTitle: materialForm.title,
              MaterialType: materialForm.type,
              RelatedCourseId: courseId,
              // Only save file if type is file
              ...(materialForm.type === 'file' && selectedFile ? { MaterialFile: selectedFile.data } : {})
          }
      };

      const response = await fetch('http://localhost:5000/api/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      setShowMaterialModal(false);
      setMaterialForm({ title: '', type: 'file' });
      setSelectedFile(null);
      refreshData();
    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Failed to upload material');
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (confirm('Remove this material?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/entity/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        refreshData();
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Failed to delete material');
      }
    }
  };

  return (
    <div className="course-manager">
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
        <i className="fas fa-arrow-left"></i> Back to Courses
      </button>

      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Managing: {course.title || course.Title}</h2>
      </div>

      {/* --- Tab Navigation --- */}
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
              <div key={a.id} className="assignment-item" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <div className="assignment-info">
                  <div className="assignment-name" style={{fontWeight:'bold'}}>{a.title}</div>
                  <div className="assignment-details" style={{fontSize:'0.9rem', color:'#666'}}>
                    <i className="fas fa-calendar-alt"></i> Due: {a.dueDate}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
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
              <div key={mat.id || index} className="material-item" style={{ display:'flex', justifyContent: 'space-between', padding:'10px', borderBottom:'1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className={`fas fa-${mat.type === 'file' ? 'file-pdf' : 'link'}`} style={{ marginRight: '15px', color: 'var(--primary)', fontSize: '1.2rem' }}></i>
                  <div>
                    <strong style={{ display: 'block' }}>{mat.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{mat.type}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                   {/* We pass the entityID so the downloader can fetch the file content if needed */}
                   <button className="btn btn-success" onClick={() => downloadFile(null, mat.title, mat.fileEntityID)}><i className="fas fa-download"></i></button>
                   <button className="btn btn-danger" onClick={() => handleDeleteMaterial(mat.id)}><i className="fas fa-trash"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBMISSIONS TAB --- */}
      {activeTab === 'submissions' && (
        <div className="widget large">
          <h3 style={{ marginBottom: '15px' }}>Student Submissions</h3>
          <p className="placeholder-text">Feature coming soon (requires submission API).</p>
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
                  <div className="form-group" style={{ flex: 1 }}><label>Date</label><input type="date" className="form-control" required value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} /></div>
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