import React, { useState, useEffect } from 'react';
import './assets/styles.css';
import { universityDB } from './utils/database';
import AuthScreen from './components/auth/AuthScreen';
import StudentApp from './components/student/StudentApp';
import AdvisorApp from './components/advisor/AdvisorApp';
import AdminApp from './components/admin/AdminApp';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && (parsed.role === 'student' || parsed.role === 'advisor' || parsed.role === 'admin')) {
          setCurrentUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <>
      {currentUser.role === 'student' && <StudentApp user={currentUser} onLogout={handleLogout} />}
      {currentUser.role === 'advisor' && <AdvisorApp user={currentUser} onLogout={handleLogout} />}
      {currentUser.role === 'admin' && <AdminApp user={currentUser} onLogout={handleLogout} />}
    </>
  );
};

export default App;