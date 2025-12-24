import React, { useState, useEffect } from 'react';
import { universityDB } from '../../utils/database';

const AdvisorDashboard = () => {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalStudents: 0,
    totalBookings: 0
  });

  useEffect(() => {
    // Load data from DB
    universityDB.loadFromStorage();
    setStats({
      pendingRequests: universityDB.getAllPendingCourseRequests().length,
      totalStudents: universityDB.getAllStudents().length,
      totalBookings: (universityDB.getAllBookings() || []).length
    });
  }, []);

  return (
    <div id="advisor-dashboard-section" className="content-section">
      <div className="dashboard-grid">
        <div className="stat-card warning">
          <i className="fas fa-inbox"></i>
          <div className="stat-info">
            <p>Pending Requests</p>
            <span className="stat-value">{stats.pendingRequests}</span>
          </div>
        </div>
        <div className="stat-card info">
          <i className="fas fa-door-open"></i>
          <div className="stat-info">
            <p>Classroom Bookings</p>
            <span className="stat-value">{stats.totalBookings}</span>
          </div>
        </div>
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