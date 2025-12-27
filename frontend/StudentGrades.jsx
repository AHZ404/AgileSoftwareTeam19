import React, { useState, useEffect } from "react";

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/student/grades", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load grades");

      setGrades(await res.json());
    } catch (err) {
      setError(err.message || "Error loading grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrades(); }, []);

  // ---- GPA (4-point scale) ----
  const calculateGPA = () => {
    if (!grades.length) return 0;
    const avg = grades.reduce((s, g) => s + Number(g.Grade || 0), 0) / grades.length;
    if (avg >= 90) return 4.0;
    if (avg >= 80) return 3.0;
    if (avg >= 70) return 2.0;
    return 1.0;
  };

  // ---- Sorting ----
  const sortBy = (field) =>
    setGrades([...grades].sort((a, b) => (a[field] || "").localeCompare(b[field] || "")));

  if (loading) return <p>Loading grades...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="content-section">
      <h2>Grades</h2>

      <p>
        GPA: <strong>{calculateGPA().toFixed(2)}</strong>
      </p>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => sortBy("Course")}>Sort by Course</button>
        <button onClick={() => sortBy("Grade")} style={{ marginLeft: 8 }}>
          Sort by Grade
        </button>
      </div>

      {!grades.length ? (
        <p>No grades found.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Course</th>
              <th>Grade</th>
              <th>Term</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g, i) => (
              <tr key={i}>
                <td>{g.Course}</td>
                <td>{g.Grade}</td>
                <td>{g.Term || "—"}</td>
                <td>{g.Year || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentGrades;
