import React, { useState, useEffect } from 'react';

const InstructorDashboard = ({ user }) => {
  const [stats, setStats] = useState({ coursesManaged: 0, activeBookings: 0, pendingGrades: 0 });
  const [myCourses, setMyCourses] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  const loadData = async () => {
    try {
      // 1. Fetch Courses (Fast View)
      const coursesRes = await fetch('http://localhost:5000/api/courses');
      const allCourses = await coursesRes.json() || [];
      
      const instructorCourses = allCourses
        .filter(c => c.InstructorID === user.id)
        .map(c => ({
            id: c.CourseID,
            title: c.Title,
            location: 'Main Campus', 
            schedule: `${c.ScheduleDay} ${c.ScheduleTime}`,
            color: c.Color
        }));
      
      // 2. Fetch Room Bookings
      const bookingsRes = await fetch('http://localhost:5000/api/bookings');
      const allBookings = await bookingsRes.json() || [];

      // --- NEW LOGIC: Filter bookings for the logged-in instructor ---
      // We check RequesterID against user.id
      const instructorOnlyBookings = allBookings.filter(b => 
        String(b.RequesterID) === String(user.id)
      );

      // Normalize Bookings for the Recent Bookings widget
      const myRecentBookings = instructorOnlyBookings.map(b => ({
          id: b.BookingID,
          room: b.Room,
          date: b.Date,
          status: (b.Status || 'pending').toLowerCase()
      })).reverse().slice(0, 5); // Latest first, top 5

      setStats({
        coursesManaged: instructorCourses.length,
        // Card 2 now shows only this instructor's bookings
        activeBookings: instructorOnlyBookings.length, 
        pendingGrades: 0 
      });

      setMyCourses(instructorCourses);
      setRecentBookings(myRecentBookings);

    } catch (err) {
      console.error('Error loading instructor dashboard:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  return (
    <div id="dashboard-section" className="content-section">
      {/* 1. Stats Row */}
      <div className="dashboard-grid">
        <div className="stat-card primary">
          <i className="fas fa-chalkboard-teacher"></i>
          <div className="stat-info">
            <p>Courses Managed</p>
            <span className="stat-value">{stats.coursesManaged}</span>
          </div>
        </div>

        {/* Card 2: Shows logged-in instructor's booking count */}
        <div className="stat-card info">
          <i className="fas fa-door-open"></i>
          <div className="stat-info">
            <p>My Total Bookings</p>
            <span className="stat-value">{stats.activeBookings}</span>
          </div>
        </div>

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
        <div className="widget large">
          <h3 style={{ color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px' }}>My Active Courses</h3>
          <div className="courses-grid">
             {myCourses.length === 0 ? (
                <div className="placeholder-text">
                    <p>No courses assigned.</p>
                    <small>Go to "Assign Course" to select your classes.</small>
                </div>
             ) : (
                myCourses.map(c => (
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
                    <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: 0 }}>Schedule: {c.schedule}</p>
                  </div>
                </div>
              )))}
          </div>
        </div>

        <div className="widget small">
           <h3 style={{ color: 'var(--secondary)', borderBottom: '2px solid #e9ecef', paddingBottom: '10px', marginBottom: '15px' }}>My Recent Bookings</h3>
           <div className="assignments-list">
             {recentBookings.length === 0 ? <p className="placeholder-text">No active bookings.</p> : recentBookings.map(b => (
               <div key={b.id} className="assignment-item" style={{ 
                 borderLeft: `4px solid ${b.status === 'approved' ? '#28a745' : '#ffc107'}` 
               }}>
                 <div className="assignment-name">
                   <strong>{b.room}</strong>
                   <div style={{fontSize:'0.8rem', color:'#666'}}>{b.date}</div>
                 </div>
                 <div className={`priority ${b.status === 'approved' ? 'low' : 'high'}`} style={{textTransform:'uppercase'}}>
                   {b.status}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;