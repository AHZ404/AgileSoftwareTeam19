import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthScreen from "../pages/auth/AuthScreen";
import StudentApp from "../pages/student/StudentApp";
import AdvisorApp from "../pages/advisor/AdvisorApp";
import AdminApp from "../pages/admin/AdminApp";
import { useAuth } from "../context/AuthContext";

const Protected = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (role && user.role !== role) return <Navigate to="/auth" />;
  return children;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/auth" element={<AuthScreen />} />
      <Route
        path="/student/*"
        element={
          <Protected>
            <StudentApp />
          </Protected>
        }
      />
      <Route
        path="/advisor/*"
        element={
          <Protected>
            <AdvisorApp />
          </Protected>
        }
      />
      <Route
        path="/admin/*"
        element={
          <Protected>
            <AdminApp />
          </Protected>
        }
      />
      <Route path="/" element={<Navigate to="/auth" />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
