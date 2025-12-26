# Frontend to Backend Integration Guide

## Overview
This document tracks the migration from localStorage-based `universityDB` to backend API calls using the EAV (Entity-Attribute-Value) model.

## Completed Integrations ✅

### Student Components
- ✅ StudentDashboard.jsx
- ✅ StudentAssignments.jsx
- ✅ StudentClassrooms.jsx
- ✅ StudentCourses.jsx

### Advisor Components  
- ✅ AdvisorDashboard.jsx
- ✅ AdvisorRequests.jsx
- ✅ AdvisorBookings.jsx

### Auth Components
- ✅ AuthScreen.jsx

### Admin Components
- ✅ AdminDashboard.jsx

### Instructor Components
- ✅ InstructorDashboard.jsx

---

## Remaining Work

### Instructor Components (5 files)

#### InstructorCourses.jsx
**Current universityDB calls:**
- `universityDB.loadFromStorage()`
- `universityDB.getAllCourses()`
- `universityDB.enrollments.filter()`
- `universityDB.getStudentById()`

**Required API calls:**
```javascript
// Get all courses
GET /api/entities/course

// Get enrollments for a course
GET /api/enrollments

// Get student details
GET /api/entity/:id
```

---

#### CourseManager.jsx
**Current universityDB calls:**
- `universityDB.loadFromStorage()`
- `universityDB.assignments`
- `universityDB.getCourseById()`
- `universityDB.submissions`
- `universityDB.createAssignment()`
- `universityDB.deleteAssignment()`
- `universityDB.addCourseMaterial()`
- `universityDB.removeCourseMaterial()`
- `universityDB.getStudentById()`

**Required API calls:**
```javascript
// Create assignment
POST /api/entity
body: { id: "ASG001", type: "assignment", attributes: {...} }

// Get assignments for course
GET /api/entities/assignment

// Delete assignment
DELETE /api/entity/:id

// Create course material
POST /api/entity
body: { id: "MAT001", type: "material", attributes: {...} }

// Delete course material
DELETE /api/entity/:id
```

---

#### InstructorCourseAssignment.jsx
**Current universityDB calls:**
- `universityDB.loadFromStorage()`
- `universityDB.getActiveCoursesWithEnrollments()`
- `universityDB.assignInstructorToCourse()`
- `universityDB.removeInstructorFromCourse()`
- `universityDB.getInstructorsForCourse()`

**Required API calls:**
```javascript
// Get courses with instructor attribute
GET /api/entities/course

// Update course instructor
PUT /api/entity/:courseId/instructor
body: { value: "instructorId" }

// Remove instructor
PUT /api/entity/:courseId/instructor  
body: { value: "" }
```

---

#### InstructorBookings.jsx
**Current universityDB calls:**
- `universityDB.loadFromStorage()`
- `universityDB.getBookingsByStudent()`
- `universityDB.getAvailableClassrooms()`
- `universityDB.createBooking()`
- `universityDB.deleteBooking()`
- `universityDB.getAllClassrooms()`

**Required API calls:**
```javascript
// Get classrooms
GET /api/entities/classroom

// Create booking (enrollment)
POST /api/entity
body: { id: "BK001", type: "booking", attributes: {...} }

// Delete booking
DELETE /api/entity/:id
```

---

### Admin Components (5 files)

#### AdminRequests.jsx
**Current universityDB calls:**
- `universityDB.loadFromStorage()`
- `universityDB.enrollments`
- `universityDB.approveCourseRequest()`
- `universityDB.rejectCourseRequest()`
- `universityDB.getStudentById()`

**Required API calls:**
```javascript
// Get enrollments
GET /api/enrollments

// Update enrollment status
PUT /api/enrollments/:id
body: { status: "approved|rejected" }

// Get student details
GET /api/entity/:id
```

---

#### AdminBookings.jsx
**Current universityDB calls:**
- `universityDB.loadFromStorage()`
- `universityDB.getAllBookings()`
- `universityDB.getAllClassrooms()`
- `universityDB.setBookingStatus()`
- `universityDB.deleteBooking()`

**Required API calls:**
```javascript
// Same as AdvisorBookings - use enrollments API
GET /api/enrollments
PUT /api/enrollments/:id
DELETE /api/enrollments/:id
```

---

#### UserManagement.jsx
**Current universityDB calls:**
- `universityDB.loadFromStorage()`
- `universityDB.students` / `universityDB.advisors`
- Filtering and searching users
- `universityDB.deleteStudent()`

**Required API calls:**
```javascript
// Get all users by type
GET /api/entities/student
GET /api/entities/advisor
GET /api/entities/instructor

// Get specific user
GET /api/entity/:id

// Delete user
DELETE /api/entity/:id
```

---

#### SystemManagement.jsx
**Current universityDB calls:**
- System initialization
- Demo data reset
- Database management

**Required API calls:**
```javascript
// These are admin-only operations
// Implement on backend as:
POST /api/admin/reset-system
POST /api/admin/reset-passwords
```

---

#### AdminApp.jsx
**Minor update needed:**
- Remove `universityDB` import

---

## New Backend Endpoints Added

### ✅ Already Implemented
- `GET /api/entities` - Get all entities
- `GET /api/entities/:type` - Get entities by type
- `GET /api/enrollments` - Get all enrollments
- `GET /api/enrollments/student/:studentId` - Get student enrollments
- `PUT /api/entity/:entityId/:attribute` - Update entity attribute
- `DELETE /api/entity/:entityId` - Delete entity
- `PUT /api/enrollments/:enrollmentId` - Update enrollment status
- `DELETE /api/enrollments/:enrollmentId` - Delete enrollment

### 📝 Still Needed

```javascript
// Course Management
GET /api/courses - Get all courses (or use /api/entities/course)
POST /api/courses - Create course
PUT /api/courses/:id - Update course
DELETE /api/courses/:id - Delete course

// Assignment Management
GET /api/assignments - Get all assignments
GET /api/assignments/:courseId - Get course assignments
POST /api/assignments - Create assignment
DELETE /api/assignments/:id - Delete assignment

// Classroom Management
GET /api/classrooms - Get all classrooms
GET /api/classrooms/available - Search available classrooms
POST /api/classrooms - Create classroom
PUT /api/classrooms/:id - Update classroom
DELETE /api/classrooms/:id - Delete classroom

// Admin Operations
POST /api/admin/reset-system - Reset to default state
POST /api/admin/reset-passwords - Reset all passwords
```

---

## API Call Pattern

### Creating an Entity (EAV Model)
```javascript
await fetch('http://localhost:5000/api/entity', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'CRS001',           // Unique ID
    type: 'course',         // Entity type
    attributes: {
      Title: 'Math 101',
      Description: 'Calculus I',
      Credits: '3',
      Instructor: 'INST001',
      Schedule: 'MWF 10:00',
      Location: 'Room 101'
    }
  })
});
```

### Updating an Entity Attribute
```javascript
await fetch('http://localhost:5000/api/entity/:entityId/Title', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: 'Math 102' })
});
```

### Fetching Entity with Attributes
```javascript
const res = await fetch('http://localhost:5000/api/entity/:id');
const entity = await res.json();
// Returns: { id: '...', type: '...', Title: '...', Description: '...' }
```

---

## Testing Checklist

- [ ] All student components work without universityDB
- [ ] All advisor components work without universityDB
- [ ] All instructor components work without universityDB
- [ ] All admin components work without universityDB
- [ ] No localStorage access except for currentUser in App.jsx
- [ ] All CRUD operations (Create, Read, Update, Delete) work
- [ ] Enrollment/request workflow works end-to-end
- [ ] Classroom booking workflow works end-to-end

---

## Migration Status

```
Total Components: 14
Completed: 6 (43%)
In Progress: 1
Remaining: 7 (50%)
```

Priority order for completion:
1. Instructor components (5 files) - Core functionality
2. Admin components (4 files) - System management
3. Testing & verification

---

## Notes

- All API URLs currently point to `http://localhost:5000`
- Database uses EAV model: Entities → EntityValues ← Attributes
- No localStorage except for authentication (`currentUser`)
- All data flows through backend SQL Server database
- Password hashing is handled by backend (bcrypt)

