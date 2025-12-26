import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import AdvisorDashboard from './AdvisorDashboard';
import AdvisorRequests from './AdvisorRequests';
import StudentClassrooms from '../student/StudentClassrooms'; // Reusing for booking creation
import AdvisorBookings from './AdvisorBookings';

const AdvisorApp = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('advisor-dashboard');

  const navItems = [
    { id: 'advisor-dashboard', label: 'Dashboard' },
    { id: 'pending-requests', label: 'Pending Requests' },
    { id: 'advisor-classrooms', label: 'Book Classrooms' }, // Advisor can book too
    { id: 'manage-bookings', label: 'Manage Bookings' },    // <--- NEW LINK
    { id: 'student-management', label: 'Student Management' }
  ];

  const renderContent = () => {
    switch(activeSection) {
      case 'advisor-dashboard': return <AdvisorDashboard />;
      case 'pending-requests': return <AdvisorRequests />;
      // Advisor reuses the "Classroom search/book" UI from student but acts as advisor
      case 'advisor-classrooms': return <StudentClassrooms user={user} />;
      case 'manage-bookings': return <AdvisorBookings currentUser={user} />;
      case 'student-management': return <div className="placeholder-text">Student Management List (Coming Soon)</div>;
      default: return null;
    }
  };

  return (
    <div className="container" id="advisor-app-screen">
      <Sidebar user={user} activeSection={activeSection} onNavigate={setActiveSection} onLogout={onLogout} items={navItems} />
      <div className="main-content">
         <div className="header">
            <h1>{navItems.find(n => n.id === activeSection)?.label}</h1>
         </div>
         <div className="content-wrapper">
            {renderContent()}
         </div>
      </div>
    </div>
  );
};

export default AdvisorApp;