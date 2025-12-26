import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';

// Helper to refresh data
const useForceUpdate = () => {
    const [_, setTick] = useState(0);
    return () => setTick(t => t + 1);
};

const InstructorDashboard = ({ user }) => {
  const forceUpdate = useForceUpdate();
  const [stats, setStats] = useState({ coursesManaged: 0, activeBookings: 0, pendingGrades: 0 });
  const [myCourses, setMyCourses] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  // Load Data
  const loadData = () => {
    universityDB.loadFromStorage();

    // 1. Get Courses managed by this instructor
    const allCourses = universityDB.getAllCourses();
    const instructorCourses = allCourses.filter(c => c.instructorId === user.id);

    // 2. Get Bookings
    const bookings = universityDB.getBookingsByStudent(user.id);

    setStats({
      coursesManaged: instructorCourses.length,
      activeBookings: bookings.length,
      pendingGrades: 0 // Placeholder
    });

    setMyCourses(instructorCourses);
    setRecentBookings(bookings);
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  return (
    <div id="dashboard-section" className="content-section">
      {/* 1. Stats Row */}
      <div className="dashboard-grid">
        {/* Card 1: Courses Managed */}
        <div className="stat-card primary">
          <i className="fas fa-chalkboard-teacher"></i>
          <div className="stat-info">
            <p>Courses Managed</p>
            <span className="stat-value">{stats.coursesManaged}</span>
          </div>
        </div>

        {/* Card 2: Active Bookings */}
        <div className="stat-card info">
          <i className="fas fa-door-open"></i>
          <div className="stat-info">
            <p>Classroom Bookings</p>
            <span className="stat-value">{stats.activeBookings}</span>
          </div>
        </div>

        {/* Card 3: Pending Grades */}
        <div className="stat-card warning">
           <i className="fas fa-clipboard-check"></i>
           <div className="stat-info">
              <p>Pending Grades</p>
              <span className="stat-value">{stats.pendingGrades}</span>
           </div>
        </div>
      </div>

      {/* 2. Widgets Row */}
      <div className="widgets-container">
        
        {/* Widget: My Active Courses */}
        <div className="widget large">
          <h3 style={{ color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px' }}>My Active Courses</h3>
          
          <div className="courses-grid">
             {myCourses.length === 0 ? <p className="placeholder-text">No courses assigned yet.</p> : myCourses.map(c => (
                <div key={c.id} className="course-card" style={{
                    borderTop: `4px solid ${c.color || 'var(--primary)'}`,
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    padding: '15px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '120px'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#333' }}>{c.id}: {c.title}</h4>
                    <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: 0 }}>Location: {c.location}</p>
                    <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: 0 }}>Schedule: {c.schedule}</p>
                  </div>
                </div>
             ))}
          </div>
        </div>

        {/* Widget: Recent Bookings */}
        <div className="widget small">
           <h3 style={{ color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px' }}>Recent Bookings</h3>
           <div className="assignments-list">
             {recentBookings.length === 0 ? <p className="placeholder-text">No active bookings.</p> : recentBookings.slice(0, 3).map(b => (
               <div key={b.id} className="assignment-item">
                 <div className="assignment-name">
                    Room {b.classroomId}
                    <div style={{fontSize:'0.8rem', color:'#666'}}>{b.date} ({b.startTime})</div>
                 </div>
                 <div className="priority low">Approved</div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorDashboard;