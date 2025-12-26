import React, { useState } from 'react';
// We don't strictly need universityDB for auth anymore, but keeping it for other app parts
import { universityDB } from '../../utils/database'; 

const AuthScreen = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginMsg, setLoginMsg] = useState('');
  const [regMsg, setRegMsg] = useState('');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register State
  const [regData, setRegData] = useState({
    fullName: '', email: '', password: '', confirmPass: '', major: 'Undeclared', role: 'student'
  });

  // --- UPDATED: LOGIN VIA BACKEND API ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginMsg(''); // Clear previous errors

    try {
      console.log("Attempting login for:", loginEmail);
      
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            loginId: loginEmail, 
            password: loginPass 
        })
      });

      // 1. Check if the response is actually JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error("Server sent non-JSON response. Check API URL.");
      }

      const data = await response.json();
      if (data.success) {
        // --- SAFETY PATCH START ---
        // Create a copy of the user and fix the casing manually
        // This prevents the white screen if the backend sends "FirstName"
        const safeUser = { 
            ...data.user,
            firstName: data.user.firstName || data.user.FirstName || '',
            lastName:  data.user.lastName  || data.user.LastName  || '',
            email:     data.user.email     || data.user.Email     || '',
            role:      data.user.role      || data.user.Role      || '',
            major:     data.user.major     || data.user.Major     || '',
            id:        data.user.id
        };

        console.log("Logged in with Safe User:", safeUser);
        onLogin(safeUser); 
        // --- SAFETY PATCH END ---
      } else {
        setLoginMsg(data.message || 'Login failed.');
      }
      console.log("Server response:", data);

      if (data.success) {
        onLogin(data.user); // Success! Switch screens
      } else {
        // Handle 401 or other API errors gracefully
        setLoginMsg(data.message || 'Login failed. Please try again.');
      }

    } catch (err) {
      console.error("Login Crash:", err);
      // This prevents the white screen by showing a readable error
      setLoginMsg('Connection Error: ' + err.message);
    }
  };

  // --- UPDATED: REGISTER VIA BACKEND API ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegMsg('');
    
    if (regData.password !== regData.confirmPass) {
      setRegMsg('Passwords do not match.');
      return;
    }

    try {
      // 1. Prepare Data for EAV Model
      const parts = regData.fullName.split(/\s+/);
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || '';
      
      // Generate a unique ID (e.g., STU + timestamp)
      const newId = (regData.role === 'student' ? 'STU' : 'USR') + Date.now().toString().slice(-6);

      const payload = {
        id: newId,
        type: regData.role, // 'student', 'instructor', etc.
        attributes: {
          FirstName: firstName,
          LastName: lastName,
          Email: regData.email.toLowerCase(),
          Password: regData.password, // Make sure 'Password' exists in your SQL Attributes table!
          Role: regData.role,
          // Note: 'Major' will only save if you added 'Major' to your SQL Attributes table
          ...(regData.role === 'student' ? { Major: regData.major } : {})
        }
      };

      // 2. Send to Node.js backend
      const response = await fetch('http://localhost:5000/api/entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setRegMsg('Registration successful! Please log in.');
        setTimeout(() => {
             setActiveTab('login');
             setLoginEmail(regData.email);
        }, 1500);
      } else {
        const errText = await response.text();
        setRegMsg('Registration failed: ' + errText);
      }

    } catch (err) {
      console.error("Register Error:", err);
      setRegMsg('Cannot connect to server.');
    }
  };

  return (
    <div className="auth-container" id="auth-screen">
      <div className="auth-box">
        <div className="auth-header">
          <h2><i className="fas fa-graduation-cap"></i> UniPortal</h2>
          <p>Student Management System</p>
        </div>
        
        <div className="auth-tabs">
          <div className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>Login</div>
          <div className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>Register</div>
        </div>

        {activeTab === 'login' ? (
          <form className="auth-form active" onSubmit={handleLoginSubmit}>
            <p className="message-text" style={{color: 'red'}}>{loginMsg}</p>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" placeholder="Enter your email" required 
                     value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" placeholder="Enter password" required 
                     value={loginPass} onChange={e => setLoginPass(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Log In</button>
            
            <p className="demo-info">
                Demo accounts (SQL):<br/>
                Create a new user via Register tab<br/>
                or use the test user created in Postman.
            </p>
          </form>
        ) : (
          <form className="auth-form active" onSubmit={handleRegisterSubmit}>
            <p className="message-text" style={{color: regMsg.includes('successful') ? 'green' : 'red'}}>{regMsg}</p>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" required 
                     value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" required 
                     value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" required 
                     value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" className="form-control" required 
                     value={regData.confirmPass} onChange={e => setRegData({...regData, confirmPass: e.target.value})} />
            </div>
            <div className="form-group">
               <label>Role</label>
               <select className="form-control" value={regData.role} onChange={e => setRegData({...regData, role: e.target.value})}>
                 <option value="student">Student</option>
                 <option value="advisor">Advisor</option>
                 <option value="instructor">Instructor</option>
               </select>
            </div>
            {/* Show Major only if Student */}
            {regData.role === 'student' && (
                <div className="form-group">
                    <label>Major</label>
                    <select className="form-control" value={regData.major} onChange={e => setRegData({...regData, major: e.target.value})}>
                        <option value="Undeclared">Undeclared</option>
                        <option value="CS">Computer Science</option>
                        <option value="ENG">Engineering</option>
                        <option value="BUS">Business</option>
                    </select>
                </div>
            )}
            <button type="submit" className="btn btn-primary btn-block">Register</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;