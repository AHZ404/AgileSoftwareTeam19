import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    advisors: 0,
    bookings: 0,
    requests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch all entities to count students, advisors, etc.
      const entitiesRes = await fetch('http://localhost:5000/api/entities');
      const entities = await entitiesRes.json() || [];
      
      const students = entities.filter(e => e.type === 'student').length;
      const advisors = entities.filter(e => e.type === 'advisor').length;
      
      // Fetch enrollments for bookings and requests
      const enrollmentsRes = await fetch('http://localhost:5000/api/enrollments');
      const enrollments = await enrollmentsRes.json() || [];
      
      const requests = enrollments.filter(e => e.status === 'pending').length;
      
      setStats({
        students: students,
        advisors: advisors,
        bookings: enrollments.length,
        requests: requests
      });
      
      // Get recent activity - pending requests
      const recentRequests = enrollments.filter(e => e.status === 'pending').slice(0, 5);
      setRecentActivity(recentRequests);
    } catch (err) {
      console.error('Error loading admin stats:', err);
    }
  };

  // Quick Action Handlers
  const handleResetPasswords = async () => {
    if (confirm('Reset ALL user passwords to "0000"?')) {
      try {
        // Note: This is a security operation - in production, implement proper authorization
        alert('Password reset would require direct backend implementation.');
      } catch (err) {
        console.error(err);
        alert('Error resetting passwords');
      }
    }
  };

  const handleClearRequests = async () => {
    if (confirm('Clear ALL pending requests?')) {
      try {
        // Get all pending enrollments
        const enrollmentsRes = await fetch('http://localhost:5000/api/enrollments');
        const enrollments = await enrollmentsRes.json() || [];
        
        const pending = enrollments.filter(e => e.status === 'pending');
        
        // Delete each pending enrollment
        for (const enrollment of pending) {
          await fetch(`http://localhost:5000/api/enrollments/${enrollment.id}`, { method: 'DELETE' });
        }
        
        alert('Pending requests cleared.');
        loadStats();
      } catch (err) {
        console.error(err);
        alert('Error clearing requests');
      }
    }
  };

  const handleResetSystem = async () => {
    if (confirm('Reset system to default state?')) {
      alert('System reset would require backend implementation.');
    }
  };

  return (
    <div id="admin-dashboard-section" className="content-section">
      
      {/* Stats Row */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Total Students */}
        <div className="stat-card" style={{ borderLeft: '5px solid #4361ee', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <i className="fas fa-users" style={{ fontSize: '36px', color: '#ccc' }}></i>
          <div className="stat-info" style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>Total Students</p>
            <span className="stat-value" style={{ fontSize: '28px', fontWeight: '700', color: '#212529' }}>{stats.students}</span>
          </div>
        </div>

        {/* Total Advisors */}
        <div className="stat-card" style={{ borderLeft: '5px solid #f72585', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <i className="fas fa-user-tie" style={{ fontSize: '36px', color: '#ccc' }}></i>
          <div className="stat-info" style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>Total Advisors</p>
            <span className="stat-value" style={{ fontSize: '28px', fontWeight: '700', color: '#212529' }}>{stats.advisors}</span>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="stat-card" style={{ borderLeft: '5px solid #4cc9f0', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <i className="fas fa-door-open" style={{ fontSize: '36px', color: '#ccc' }}></i>
          <div className="stat-info" style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>Active Bookings</p>
            <span className="stat-value" style={{ fontSize: '28px', fontWeight: '700', color: '#212529' }}>{stats.bookings}</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="stat-card" style={{ borderLeft: '5px solid #3f37c9', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <i className="fas fa-bell" style={{ fontSize: '36px', color: '#ccc' }}></i>
          <div className="stat-info" style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>Pending Requests</p>
            <span className="stat-value" style={{ fontSize: '28px', fontWeight: '700', color: '#212529' }}>{stats.requests}</span>
          </div>
        </div>
      </div>

      {/* Widgets Row */}
      <div className="widgets-container" style={{ display: 'flex', gap: '20px' }}>
        
        {/* Recent Activity Widget */}
        <div className="widget large" style={{ flex: 3, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#3f37c9', borderBottom: '1px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px' }}>Recent User Activity</h3>
          <div id="admin-recent-activity">
            {recentActivity.length === 0 ? (
              <p className="placeholder-text" style={{ fontStyle: 'italic', color: '#999', textAlign: 'center', padding: '20px', border: '1px dashed #dee2e6', borderRadius: '4px' }}>
                No recent activity to display.
              </p>
            ) : (
              recentActivity.map((req, idx) => {
                const student = universityDB.getStudentById(req.studentId) || { firstName: 'Unknown', lastName: '' };
                return (
                  <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
                    <strong>{student.firstName} {student.lastName}</strong> requested course <strong>{req.courseId}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{req.dateSubmitted} - {req.status}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions Widget */}
        <div className="widget small" style={{ flex: 2, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#3f37c9', borderBottom: '1px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px' }}>Quick Actions</h3>
          <div className="quick-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn" onClick={handleResetPasswords} style={{ background: '#4361ee', color: 'white', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
              Reset All Passwords
            </button>
            <button className="btn" onClick={handleClearRequests} style={{ background: '#e9ecef', color: '#212529', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
              Clear Pending Requests
            </button>
            <button className="btn" onClick={handleResetSystem} style={{ background: '#d90429', color: 'white', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
              Reset System Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;