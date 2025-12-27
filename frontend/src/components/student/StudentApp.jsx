import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import StudentDashboard from './StudentDashboard';
import StudentCourses from './StudentCourses';
import StudentClassrooms from './StudentClassrooms';
import StudentAssignments from './StudentAssignments'; 
import StudentSchedule from './StudentSchedule';       
import StudentGrades from './StudentGrades';          

const StudentApp = ({ user, onLogout }) => {
  // Fix: Default state matches the new ID
  const [activeSection, setActiveSection] = useState('student-dashboard');

  // Fix: Changed 'dashboard' to 'student-dashboard' to match Sidebar iconMap
  const navItems = [
    { id: 'student-dashboard', label: 'Dashboard' },
    { id: 'courses', label: 'Courses Registration' },
    { id: 'classrooms', label: 'Classrooms' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'grades', label: 'Grades' }
  ];

  const renderContent = () => {
    switch(activeSection) {
      case 'student-dashboard': return <StudentDashboard user={user} navigateTo={setActiveSection} />;
      case 'courses': return <StudentCourses user={user} />;
      case 'classrooms': return <StudentClassrooms user={user} />;
      case 'assignments': return <StudentAssignments user={user} />;
      case 'schedule': return <StudentSchedule user={user} />;
      case 'grades': return <StudentGrades user={user} />;
      default: return <div className="placeholder-text">Section under construction</div>;
    }
  };

  return (
    <div className="container" id="student-app-screen">
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

export default StudentApp;