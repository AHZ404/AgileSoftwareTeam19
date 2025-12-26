import React, { useState } from "react";
import { universityDB } from "../../services/mockData";

const AuthScreen = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginMsg, setLoginMsg] = useState("");
  const [regMsg, setRegMsg] = useState("");

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register State
  const [regData, setRegData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPass: "",
    major: "Undeclared",
    role: "student",
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginMsg("");
    const user = universityDB.getUserByEmail(loginEmail);
    if (user && user.password === loginPass) {
      onLogin(user);
    } else {
      setLoginMsg("Invalid email or password.");
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegMsg("");

    if (regData.password !== regData.confirmPass) {
      setRegMsg("Passwords do not match.");
      return;
    }
    if (universityDB.getUserByEmail(regData.email)) {
      setRegMsg("Email already registered.");
      return;
    }

    const parts = regData.fullName.split(/\s+/);
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ") || "";

    const newUser = {
      email: regData.email.toLowerCase(),
      password: regData.password,
      role: regData.role,
      id: universityDB.getNextUserId(),
      firstName,
      lastName,
      major: regData.role === "student" ? regData.major : null,
      level: regData.role === "student" ? "Freshman" : null,
      gpa: regData.role === "student" ? 0.0 : null,
    };

    if (regData.role === "student") universityDB.students.push(newUser);
    else universityDB.advisors.push(newUser);

    universityDB.saveToStorage();
    setRegMsg("Registration successful! Please log in.");
    setTimeout(() => setActiveTab("login"), 1000);
  };

  return (
    <div className="auth-container" id="auth-screen">
      <div className="auth-box">
        <div className="auth-header">
          <h2>
            <i className="fas fa-graduation-cap"></i> UniPortal
          </h2>
          <p>Student Management System</p>
        </div>

        <div className="auth-tabs">
          <div
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </div>
          <div
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </div>
        </div>

        {activeTab === "login" ? (
          <form className="auth-form active" onSubmit={handleLoginSubmit}>
            <p className="message-text" style={{ color: "red" }}>
              {loginMsg}
            </p>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Log In
            </button>

            {/* --- ADDED DEMO INFO HERE --- */}
            <p className="demo-info">
              Demo accounts:
              <br />
              Student: ahmed.elsayed@university.edu
              <br />
              Advisor: dr.elgohary@university.edu
              <br />
              Admin: admin@university.edu
              <br />
              Password: password123 (for all demo accounts)
            </p>
          </form>
        ) : (
          <form className="auth-form active" onSubmit={handleRegisterSubmit}>
            <p
              className="message-text"
              style={{ color: regMsg.includes("successful") ? "green" : "red" }}
            >
              {regMsg}
            </p>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                required
                value={regData.fullName}
                onChange={(e) =>
                  setRegData({ ...regData, fullName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                required
                value={regData.email}
                onChange={(e) =>
                  setRegData({ ...regData, email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                required
                value={regData.password}
                onChange={(e) =>
                  setRegData({ ...regData, password: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                required
                value={regData.confirmPass}
                onChange={(e) =>
                  setRegData({ ...regData, confirmPass: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                className="form-control"
                value={regData.role}
                onChange={(e) =>
                  setRegData({ ...regData, role: e.target.value })
                }
              >
                <option value="student">Student</option>
                <option value="advisor">Advisor</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
