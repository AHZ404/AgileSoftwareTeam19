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
      // Use Promise.all to fetch everything in parallel (Faster)
      const [entitiesRes, enrollmentsRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/entities'),    // 1. Get All Users
        fetch('http://localhost:5000/api/enrollments'), // 2. Get All Enrollments
        fetch('http://localhost:5000/api/bookings')     // 3. Get All Bookings
      ]);

      const entitiesData = await entitiesRes.json() || [];
      const enrollmentsData = await enrollmentsRes.json() || [];
      const bookingsData = await bookingsRes.json() || [];

      // --- CALCULATIONS ---

      // 1. Calculate Managed Students
      // We filter the generic entities list for role 'student'
      const studentCount = entitiesData.filter(u => (u.role || '').toLowerCase() === 'student').length;

      // 2. Calculate Pending Requests
      // We check for 'Status' (PascalCase from DB) and ensure case-insensitivity
      const pendingCount = enrollmentsData.filter(e => 
        (e.Status || e.status || '').toLowerCase() === 'pending'
      ).length;

      // 3. Set State
      setStats({
        pendingRequests: pendingCount,
        totalStudents: studentCount,
        totalBookings: bookingsData.length
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