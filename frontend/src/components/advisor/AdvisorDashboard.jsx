import React, { useState, useEffect } from 'react';

const AdvisorDashboard = () => {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalStudents: 0,
    totalBookings: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // 1. Fetch Students (Entities)
      const entitiesRes = await fetch('http://localhost:5000/api/entities/student');
      const studentsData = await entitiesRes.json() || [];
      const studentCount = studentsData.length;
      
      // 2. Fetch Enrollments (For Pending Requests)
      const enrollmentsRes = await fetch('http://localhost:5000/api/enrollments');
      const enrollmentsData = await enrollmentsRes.json() || [];
      
      // FIX: Use Capital 'S' for Status (SQL returns PascalCase)
      const pendingCount = enrollmentsData.filter(e => (e.Status || e.status) === 'pending').length;
      
      // 3. Fetch Classroom Bookings (Actual Room Reservations)
      // If "Classroom Bookings" refers to room reservations, use the /bookings API we made
      const bookingsRes = await fetch('http://localhost:5000/api/bookings');
      const bookingsData = await bookingsRes.json() || [];

      setStats({
        pendingRequests: pendingCount,
        totalStudents: studentCount,
        totalBookings: bookingsData.length // Or use enrollmentsData.length if you meant Course Registrations
      });

    } catch (err) {
      console.error('Error loading advisor stats:', err);
    }
  };

  return (
    <div id="advisor-dashboard-section" className="content-section">
      <div className="dashboard-grid">
        {/* Pending Requests Card */}
        <div className="stat-card warning">
          <i className="fas fa-inbox"></i>
          <div className="stat-info">
            <p>Pending Requests</p>
            <span className="stat-value">{stats.pendingRequests}</span>
          </div>
        </div>

        {/* Classroom Bookings Card */}
        <div className="stat-card info">
          <i className="fas fa-door-open"></i>
          <div className="stat-info">
            <p>Classroom Bookings</p>
            <span className="stat-value">{stats.totalBookings}</span>
          </div>
        </div>

        {/* Managed Students Card */}
        <div className="stat-card primary">
          <i className="fas fa-users"></i>
          <div className="stat-info">
            <p>Managed Students</p>
            <span className="stat-value">{stats.totalStudents}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorDashboard;