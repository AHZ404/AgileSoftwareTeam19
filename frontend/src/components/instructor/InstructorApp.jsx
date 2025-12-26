import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import InstructorDashboard from './InstructorDashboard';
import InstructorBookings from './InstructorBookings';
import InstructorCourseAssignment from './InstructorCourseAssignment';
import InstructorCourses from './InstructorCourses';

const InstructorApp = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- UPDATED: IDs match Sidebar iconMap for visual consistency ---
  const menuItems = [
    { id: 'dashboard',         label: 'Dashboard' },
    { id: 'classrooms',        label: 'Book Classrooms' }, // Changed from 'book-classrooms' to match icon 'door-open'
    { id: 'course-assignment', label: 'Assign Course' },   // Self-assign to teach a course
    { id: 'courses',           label: 'My Courses' },      // Manage Assignments/Materials
    { id: 'grades',            label: 'Student Grading' }, // Changed from 'grading' to match icon
    { id: 'schedule',          label: 'Schedule' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <InstructorDashboard user={user} />;
      case 'classrooms': // Updated ID
        return <InstructorBookings user={user} />;
      case 'course-assignment':
        return <InstructorCourseAssignment user={user} />; 
      case 'courses':
        return <InstructorCourses user={user} />;
      case 'grades': // Updated ID
        return <div className="content-section"><h2>Student Grading (Coming Soon)</h2></div>;
      case 'schedule':
        return <div className="content-section"><h2>Schedule (Coming Soon)</h2></div>;
      default:
        return <InstructorDashboard user={user} />;
    }
  };

  return (
    <div className="container" id="instructor-app-screen">
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