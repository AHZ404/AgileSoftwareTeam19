import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import InstructorDashboard from './InstructorDashboard';
import InstructorBookings from './InstructorBookings';
import InstructorCourseAssignment from './InstructorCourseAssignment';
import InstructorCourses from './InstructorCourses';

const InstructorApp = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // 1. Define the menu items explicitly
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'book-classrooms', label: 'Book Classrooms' },
    { id: 'course-assignment', label: 'Course Assignment' },
    { id: 'courses', label: 'My Courses' },
    { id: 'grading', label: 'Student Grading' },
    { id: 'schedule', label: 'Schedule' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <InstructorDashboard user={user} />;
      case 'book-classrooms':
        return <InstructorBookings user={user} />;
       case 'course-assignment':
        return <InstructorCourseAssignment user={user} />; 
      case 'courses':
        return <InstructorCourses user={user} />;
        case 'grading':
        return <div className="content-section"><h2>Student Grading (Coming Soon)</h2></div>;
      case 'schedule':
        return <div className="content-section"><h2>Schedule (Coming Soon)</h2></div>;
      default:
        return <InstructorDashboard user={user} />;
    }
  };

  return (
    <div className="container" id="instructor-app-screen">
      {/* 2. Pass menuItems to the 'items' prop */}
      <Sidebar 
        user={user} 
        activeSection={activeTab} 
        onNavigate={setActiveTab} 
        onLogout={onLogout} 
        items={menuItems} 
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default InstructorApp;