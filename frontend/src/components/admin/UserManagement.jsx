import React, { useState, useEffect } from "react";
import { universityDB } from "../../services/mockdata";

const UserManagement = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const loadUsers = () => {
    universityDB.loadFromStorage();
    setUsers(universityDB.getAllUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = (id) => {
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        universityDB.deleteUser(id);
        alert("User deleted successfully.");
        loadUsers();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const handleResetPassword = (id) => {
    if (confirm('Reset this user\'s password to "0000"?')) {
      const user = users.find((u) => u.id === id);
      if (user) {
        user.password = "0000";
        universityDB.saveToStorage();
        alert('Password reset to "0000".');
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({ ...user });
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editingUser) return;
    // Find the correct array to update
    let userArray;
    if (editingUser.role === "student") userArray = universityDB.students;
    else if (editingUser.role === "advisor") userArray = universityDB.advisors;
    else if (editingUser.role === "admin") userArray = universityDB.admins;

    const index = userArray.findIndex((u) => u.id === editingUser.id);
    if (index !== -1) {
      userArray[index] = { ...userArray[index], ...editFormData };
      universityDB.saveToStorage();
      alert("User updated successfully.");
      setEditModalOpen(false);
      loadUsers();
    }
  };

  // Filter Logic
  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Styles based on screenshot
  const getRoleColor = (role) => {
    switch (role) {
      case "student":
        return "#0dcaf0"; // Cyan
      case "advisor":
        return "#d63384"; // Pink
      case "admin":
        return "#dc3545"; // Red
      default:
        return "#6c757d";
    }
  };

  return (
    <div id="user-management-section">
      <h2 style={{ marginBottom: "20px", color: "#333" }}>User Management</h2>

      {/* Filters Row */}
      <div
        className="user-filters"
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "25px",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            Filter by Role
          </label>
          <select
            className="form-control"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          >
            <option value="all">All Users</option>
            <option value="student">Student</option>
            <option value="advisor">Advisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ flex: 2 }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            Search
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="users-list">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="user-card"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "15px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              borderLeft: `5px solid ${getRoleColor(user.role)}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left Side: Info */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "5px",
                }}
              >
                <h4 style={{ margin: 0, fontSize: "1.1rem", color: "#212529" }}>
                  {user.firstName} {user.lastName}
                </h4>
                <span
                  style={{
                    backgroundColor: getRoleColor(user.role),
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: "12px",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {user.role}
                </span>
              </div>
              <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>
                ID: {user.id} | Email: {user.email}
                {user.role === "student" && ` | ${user.major} • ${user.level}`}
                {user.role !== "student" &&
                  ` | ${user.department || "General"}`}
              </div>
            </div>

            {/* Right Side: Actions */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn"
                onClick={() => handleEditClick(user)}
                style={{
                  backgroundColor: "#4361ee",
                  color: "white",
                  padding: "8px 15px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>

              <button
                className="btn"
                onClick={() => handleResetPassword(user.id)}
                style={{
                  backgroundColor: "#e9ecef",
                  color: "#212529",
                  padding: "8px 15px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Reset Password
              </button>

              {/* Hide delete button for self or specific system admin to prevent lockout if desired */}
              {user.id !== currentUser.id && (
                <button
                  className="btn"
                  onClick={() => handleDelete(user.id)}
                  style={{
                    backgroundColor: "#d90429",
                    color: "white",
                    padding: "8px 15px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <p className="placeholder-text">
            No users found matching your criteria.
          </p>
        )}
      </div>

      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit User</h3>
              <span className="close" onClick={() => setEditModalOpen(false)}>
                &times;
              </span>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>First Name</label>
                <input
                  className="form-control"
                  value={editFormData.firstName || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  className="form-control"
                  value={editFormData.lastName || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  className="form-control"
                  value={editFormData.email || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>
              {editFormData.role === "student" && (
                <>
                  <div className="form-group">
                    <label>Major</label>
                    <input
                      className="form-control"
                      value={editFormData.major || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          major: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <input
                      className="form-control"
                      value={editFormData.level || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          level: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleEditSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
