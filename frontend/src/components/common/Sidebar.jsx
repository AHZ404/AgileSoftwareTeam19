import React from 'react';

const Sidebar = ({ user, activeSection, onNavigate, onLogout, items }) => {
  const iconMap = {
    // Shared / Generic
    dashboard: 'chart-line',
    
    // Student IDs
    'student-dashboard': 'chart-line',
    courses: 'book-open',
    classrooms: 'door-open',
    assignments: 'tasks',
    schedule: 'calendar-alt',
    grades: 'clipboard-list',
    
    // Advisor IDs
    'advisor-dashboard': 'chart-line',
    'pending-requests': 'bell',
    'advisor-classrooms': 'door-open',
    'manage-bookings': 'calendar-check', // Changed to calendar-check for better context
    'student-management': 'users',
    
    // Instructor IDs (Future proofing)
    'instructor-dashboard': 'chart-line',
    'course-management': 'chalkboard',
    
    // Admin IDs
    'user-management': 'users-cog',
    'all-bookings': 'door-closed'
  };

  // Determine icon based on role
  const userIcon = user.role === 'admin' ? 'user-shield' : (user.role === 'advisor' ? 'user-tie' : (user.role === 'instructor' ? 'chalkboard-teacher' : 'user-graduate'));

  return (
    <div className="sidebar">
      <div className="logo">
        <i className={`fas fa-${userIcon}`}></i>
        <div className="user-info">
          <h3>{user.firstName || user.FirstName || ''} {user.lastName || user.LastName || ''}</h3>
          <p>{user.role === 'student' ? `${user.major || user.Major || 'Undeclared'}` : (user.role === 'advisor' ? 'Academic Advisor' : (user.role === 'instructor' ? 'Course Instructor' : 'System Admin'))}</p>
        </div>
      </div>
      <div className="nav-menu">
        {/* ADDED || [] HERE TO FIX THE CRASH */}
        {(items || []).map(item => (
          <a key={item.id} href="#" 
             className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
             onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}>
            <i className={`fas fa-${iconMap[item.id] || 'circle'}`}></i> {item.label}
          </a>
        ))}
      </div>
      <button onClick={onLogout} className="btn btn-secondary logout-btn">
        <i className="fas fa-sign-out-alt"></i> Logout
      </button>
    </div>
  );
};

export default Sidebar;