import React, { useState } from 'react';
import './assets/styles.css';
import AuthScreen from './components/auth/AuthScreen';
import StudentApp from './components/student/StudentApp';
import AdvisorApp from './components/advisor/AdvisorApp';
import AdminApp from './components/admin/AdminApp';
import InstructorApp from './components/instructor/InstructorApp';`` 

const App = () => {
  const [user, setUser] = useState(null);

  // --- CRASH PROOF LOGIN HANDLER ---
  const handleLogin = (userData) => {
    console.log("App received user:", userData);

    // 1. Sanitize the user object to prevent crashes
    // If any field is missing, we default it to an empty string or safe value
    const safeUser = {
        id:        userData.id || "UNKNOWN_ID",
        firstName: userData.firstName || userData.FirstName || "User",
        lastName:  userData.lastName  || userData.LastName  || "",
        email:     userData.email     || userData.Email     || "",
        role:      (userData.role || userData.Role || "student").toLowerCase(), // Ensure lowercase for checks
        major:     userData.major     || userData.Major     || "Undeclared"
    };

    console.log("Setting Safe User:", safeUser);
    setUser(safeUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // --- RENDER LOGIC ---
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Render the correct app based on the sanitized role
  try {
      if (user.role === 'student') {
        return <StudentApp user={user} onLogout={handleLogout} />;
      } 
      else if (user.role === 'instructor') {
        return <InstructorApp user={user} onLogout={handleLogout} />;
      } 
      else if (user.role === 'advisor') {
        return <AdvisorApp user={user} onLogout={handleLogout} />;
      } 
      else {
        // Fallback for unknown roles (Prevents White Screen)
        return (
            <div style={{ padding: 20, textAlign: 'center' }}>
                <h2>Unknown Role: {user.role}</h2>
                <p>Please contact support.</p>
                <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </div>
        );
      }
  } catch (error) {
      // Last resort error boundary
      console.error("Dashboard Render Crash:", error);
      return (
          <div style={{ padding: 20, color: 'red' }}>
              <h2>Application Error</h2>
              <p>{error.message}</p>
              <button onClick={handleLogout}>Reset</button>
          </div>
      );
  }
};

export default App;