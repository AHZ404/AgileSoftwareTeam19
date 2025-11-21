// University Database Simulation with localStorage persistence
class UniversityDB {
    constructor() {
        this.initDatabase();
    }
    
    initDatabase() {
        // Initialize or load from localStorage.
        // If any of the core keys are missing or initialization flag absent, re-create the demo data.
        const requiredKeys = ['students', 'advisors', 'courses', 'assignments', 'enrollments', 'grades', 'courseRequests', 'classrooms', 'bookings', 'admins'];
        let needInit = false;
        for (const key of requiredKeys) {
            if (!localStorage.getItem(key)) {
                needInit = true;
                break;
            }
        }

        if (!localStorage.getItem('universityDB_initialized') || needInit) {
            this.initializeData();
            localStorage.setItem('universityDB_initialized', 'true');
        }

        this.loadFromStorage();
    }
    
    initializeData() {
        const database = {
            students: this.generateStudents(),
            advisors: this.generateAdvisors(),
            admins: this.generateAdmins(),
            courses: this.generateCourses(),
            assignments: this.generateAssignments(),
            enrollments: [],
            grades: [],
            courseRequests: [],
            classrooms: this.generateClassrooms(),
            bookings: []
        };
        
        // Generate enrollments and grades
        database.enrollments = this.generateEnrollments(database.students, database.courses);
        database.grades = this.generateGrades(database.enrollments, database.assignments, database.students);
        
        // Save to localStorage
        this.saveToStorage(database);
    }
    
    saveToStorage(database = this) {
        localStorage.setItem('students', JSON.stringify(database.students));
        localStorage.setItem('advisors', JSON.stringify(database.advisors));
        localStorage.setItem('admins', JSON.stringify(database.admins));
        localStorage.setItem('courses', JSON.stringify(database.courses));
        localStorage.setItem('assignments', JSON.stringify(database.assignments));
        localStorage.setItem('enrollments', JSON.stringify(database.enrollments));
        localStorage.setItem('grades', JSON.stringify(database.grades));
        localStorage.setItem('courseRequests', JSON.stringify(database.courseRequests));
        localStorage.setItem('classrooms', JSON.stringify(database.classrooms || []));
        localStorage.setItem('bookings', JSON.stringify(database.bookings || []));
    }

    loadFromStorage() {
        // Parse stored JSON with fallbacks to avoid breaking the app on corrupted data
        try {
            this.students = JSON.parse(localStorage.getItem('students')) || [];
        } catch (e) {
            console.error('Failed to parse students from localStorage, resetting to [].', e);
            this.students = [];
        }

        try {
            this.advisors = JSON.parse(localStorage.getItem('advisors')) || [];
        } catch (e) {
            console.error('Failed to parse advisors from localStorage, resetting to [].', e);
            this.advisors = [];
        }

        try {
            this.admins = JSON.parse(localStorage.getItem('admins')) || [];
        } catch (e) {
            console.error('Failed to parse admins from localStorage, resetting to [].', e);
            this.admins = [];
        }

        try {
            this.courses = JSON.parse(localStorage.getItem('courses')) || [];
        } catch (e) {
            console.error('Failed to parse courses from localStorage, resetting to [].', e);
            this.courses = [];
        }

        try {
            this.assignments = JSON.parse(localStorage.getItem('assignments')) || [];
        } catch (e) {
            console.error('Failed to parse assignments from localStorage, resetting to [].', e);
            this.assignments = [];
        }

        try {
            this.enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
        } catch (e) {
            console.error('Failed to parse enrollments from localStorage, resetting to [].', e);
            this.enrollments = [];
        }

        try {
            this.grades = JSON.parse(localStorage.getItem('grades')) || [];
        } catch (e) {
            console.error('Failed to parse grades from localStorage, resetting to [].', e);
            this.grades = [];
        }

        try {
            this.courseRequests = JSON.parse(localStorage.getItem('courseRequests')) || [];
        } catch (e) {
            console.error('Failed to parse courseRequests from localStorage, resetting to [].', e);
            this.courseRequests = [];
        }

        try {
            this.classrooms = JSON.parse(localStorage.getItem('classrooms')) || [];
        } catch (e) {
            console.error('Failed to parse classrooms from localStorage, resetting to [].', e);
            this.classrooms = [];
        }

        try {
            this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        } catch (e) {
            console.error('Failed to parse bookings from localStorage, resetting to [].', e);
            this.bookings = [];
        }

        // If core demo accounts are missing (e.g. previous localStorage had old demo data),
        // re-seed the database so expected demo users exist for testing/login.
        try {
            const demoEmails = ['ahmed.elsayed@university.edu', 'mona.ali@university.edu', 'dr.elgohary@university.edu', 'admin@university.edu'];
            const allUsers = [...(this.students || []), ...(this.advisors || []), ...(this.admins || [])];
            const foundDemo = demoEmails.some(email => 
                allUsers.some(u => u.email && u.email.toLowerCase() === email.toLowerCase())
            );

            if (!foundDemo) {
                console.warn('Demo accounts not found in localStorage — re-seeding demo data.');
                // Reinitialize demo data and overwrite storage
                this.initializeData();

                // Reload in-memory copies from the newly written storage
                try {
                    this.students = JSON.parse(localStorage.getItem('students')) || [];
                    this.advisors = JSON.parse(localStorage.getItem('advisors')) || [];
                    this.admins = JSON.parse(localStorage.getItem('admins')) || [];
                    this.courses = JSON.parse(localStorage.getItem('courses')) || [];
                    this.assignments = JSON.parse(localStorage.getItem('assignments')) || [];
                    this.enrollments = JSON.parse(localStorage.getItem('enrollments')) || [];
                    this.grades = JSON.parse(localStorage.getItem('grades')) || [];
                    this.courseRequests = JSON.parse(localStorage.getItem('courseRequests')) || [];
                    this.classrooms = JSON.parse(localStorage.getItem('classrooms')) || [];
                    this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
                } catch (e) {
                    console.error('Failed to reload storage after re-seed.', e);
                }
            }
        } catch (e) {
            console.error('Error checking demo accounts.', e);
        }
    }
    
    generateAdvisors() {
        return [
            {
                id: 1001, // Start advisor IDs from 1001 to avoid conflict with students
                firstName: 'Youssef',
                lastName: 'El-Gohary',
                email: 'dr.elgohary@university.edu',
                password: 'password123',
                role: 'advisor',
                department: 'Computer Science'
            }
        ];
    }

    generateAdmins() {
        return [
            {
                id: 9001,
                firstName: 'System',
                lastName: 'Admin',
                email: 'admin@university.edu',
                password: 'password123',
                role: 'admin',
                department: 'Administration'
            }
        ];
    }

    generateStudents() {
        return [
            {
                id: 101,
                firstName: 'Ahmed',
                lastName: 'El-Sayed',
                email: 'ahmed.elsayed@university.edu',
                password: 'password123',
                role: 'student',
                major: 'Computer Science',
                level: 'Senior',
                // Academic history: past courses with year, term, grade (0-100) and credits
                history: [
                    { courseId: 'CS101', year: 2022, term: 'Fall', grade: 88, credits: 3 },
                    { courseId: 'CS205', year: 2023, term: 'Spring', grade: 82, credits: 4 },
                    { courseId: 'MA101', year: 2021, term: 'Fall', grade: 75, credits: 4 },
                    { courseId: 'CS301', year: 2024, term: 'Fall', grade: 91, credits: 3 }
                ],
                gpa: null
            },
            {
                id: 102,
                firstName: 'Sara',
                lastName: 'Hassan',
                email: 'sara.hassan@university.edu',
                password: 'password123',
                role: 'student',
                major: 'Business',
                level: 'Freshman',
                history: [],
                gpa: 0.0
            },
            {
                id: 103,
                firstName: 'Omar',
                lastName: 'Mohamed',
                email: 'omar.mohamed@university.edu',
                password: 'password123',
                role: 'student',
                major: 'Physics',
                level: 'Junior',
                history: [
                    { courseId: 'PH201', year: 2022, term: 'Spring', grade: 78, credits: 3 },
                    { courseId: 'MA101', year: 2021, term: 'Fall', grade: 85, credits: 4 }
                ],
                gpa: null
            },
            {
                id: 104,
                firstName: 'Mona',
                lastName: 'Ali',
                email: 'mona.ali@university.edu',
                password: 'password123',
                role: 'student',
                major: 'Information Systems',
                level: 'Sophomore',
                // A small past history to influence GPA
                history: [
                    { courseId: 'HI101', year: 2022, term: 'Fall', grade: 88, credits: 3 },
                    { courseId: 'EN101', year: 2023, term: 'Spring', grade: 90, credits: 3 }
                ],
                gpa: null
            }
        ];
    }
    
    generateCourses() {
        return [
            { id: 'CS101', title: 'Intro to Programming', credits: 3, instructorId: 1001, schedule: 'Mon/Wed 10:00-11:30', location: 'Room 301', description: 'Fundamental concepts of structured programming.', color: '#4361ee', 
              materials: [
                  { type: 'file', title: 'Syllabus', link: '#', icon: 'file-pdf' },
                  { type: 'link', title: 'Week 1 Slides: Basic Syntax', link: '#', icon: 'file-powerpoint' }
              ]
            },
            { id: 'CS205', title: 'Data Structures', credits: 4, instructorId: 1001, schedule: 'Tue/Thu 13:00-14:30', location: 'Room 205', description: 'Analysis and implementation of common data structures.', color: '#f72585',
              materials: [
                  { type: 'link', title: 'Lecture Notes: Linked Lists', link: '#', icon: 'sticky-note' },
                  { type: 'file', title: 'Code Template: Stacks & Queues', link: '#', icon: 'file-code' }
              ] 
            },
            { id: 'MA101', title: 'Calculus I', credits: 4, instructorId: 1001, schedule: 'Mon/Wed/Fri 09:00-10:00', location: 'Lecture Hall 1', description: 'Differential and integral calculus of a single variable.', color: '#4cc9f0',
              materials: [
                  { type: 'link', title: 'Video: The Limit Definition', link: '#', icon: 'video' }
              ]
            },
            { id: 'EN101', title: 'English Composition', credits: 3, instructorId: 1001, schedule: 'Tue/Thu 11:00-12:30', location: 'Room 102', description: 'Focuses on critical reading and academic writing.', color: '#3f37c9',
              materials: [
                  { type: 'file', title: 'Style Guide & Rubric', link: '#', icon: 'file-word' }
              ]
            },
            { id: 'PH201', title: 'Modern Physics', credits: 3, instructorId: 1001, schedule: 'Wed/Fri 14:00-15:30', location: 'Lab 4', description: 'Introduction to relativity and quantum mechanics.', color: '#90be6d',
              materials: [
                  { type: 'file', title: 'Experiment 1: Setup', link: '#', icon: 'flask' }
              ]
            },
            // --- New Courses to increase available selection ---
            { id: 'CS301', title: 'Database Systems', credits: 3, instructorId: 1001, schedule: 'Mon/Wed 15:00-16:30', location: 'Room 305', description: 'Relational database theory and SQL implementation.', color: '#9d4edd',
              materials: [
                  { type: 'link', title: 'Introduction to SQL', link: '#', icon: 'database' }
              ]
            },
            { id: 'HI101', title: 'World History Since 1500', credits: 3, instructorId: 1001, schedule: 'Tue/Thu 09:00-10:30', location: 'Auditorium B', description: 'A survey of global history from the early modern era to the present.', color: '#ffb703',
              materials: [
                  { type: 'file', title: 'Reading List', link: '#', icon: 'book-reader' }
              ]
            }
        ];
    }

    generateAssignments() {
        return [
            { id: 1, courseId: 'CS101', title: 'Assignment 1: Hello World', dueDate: '2025-11-25', studentId: 101, status: 'pending' },
            { id: 2, courseId: 'CS205', title: 'Midterm Project', dueDate: '2025-12-10', studentId: 101, status: 'pending' },
            { id: 3, courseId: 'MA101', title: 'Homework Set 5', dueDate: '2025-11-20', studentId: 101, status: 'pending' },
            { id: 4, courseId: 'EN101', title: 'Essay Draft 1', dueDate: '2025-12-01', studentId: 102, status: 'pending' },
            { id: 5, courseId: 'CS101', title: 'Final Exam', dueDate: '2025-12-15', studentId: 101, status: 'pending' },
            { id: 6, courseId: 'PH201', title: 'Lab Report 1', dueDate: '2025-11-18', studentId: 103, status: 'submitted' },
            { id: 7, courseId: 'CS101', title: 'Graded Assignment', dueDate: '2025-10-01', studentId: 101, status: 'graded', grade: 92 }
        ];
    }

    generateClassrooms() {
        return [
            { id: 'CL101', name: 'Classroom 101', capacity: 40, location: 'Main Building - Floor 1', features: ['Projector', 'Whiteboard'] },
            { id: 'CL205', name: 'Classroom 205', capacity: 30, location: 'Science Block - Floor 2', features: ['Computers', 'Projector'] },
            { id: 'AUD1', name: 'Auditorium 1', capacity: 200, location: 'Auditorium Wing', features: ['Stage', 'PA System'] }
        ];
    }

    generateEnrollments(students, courses) {
        // Ahmed El-Sayed (101) is enrolled in CS101, CS205, MA101
        // Sara Hassan (102) is enrolled in EN101
        // Omar Mohamed (103) is enrolled in PH201
        return [
            { studentId: 101, courseId: 'CS101' },
            { studentId: 101, courseId: 'CS205' },
            { studentId: 101, courseId: 'MA101' },
            { studentId: 102, courseId: 'EN101' },
            { studentId: 103, courseId: 'PH201' }
        ];
    }
    
    generateGrades(enrollments, assignments) {
        return [
            // Dummy grade for the graded assignment
            { studentId: 101, courseId: 'CS101', assignmentId: 7, grade: 92 }
        ];
    }

    // --- Core Data Access Methods ---
    getUserByEmail(email) {
        if (!email) return null;
        // Ensure in-memory data matches localStorage before searching (avoids stale state)
        try { this.loadFromStorage(); } catch (e) { /* ignore */ }
        const needle = String(email).trim().toLowerCase();
        
        // Search in all user arrays
        const allUsers = [
            ...(this.students || []),
            ...(this.advisors || []),
            ...(this.admins || [])
        ];
        
        return allUsers.find(u => u.email && u.email.toLowerCase() === needle);
    }

    // Return next available numeric user id (avoid collisions with existing ids)
    getNextUserId() {
        const studentMax = (this.students || []).reduce((m, s) => Math.max(m, Number(s.id) || 0), 0);
        const advisorMax = (this.advisors || []).reduce((m, a) => Math.max(m, Number(a.id) || 0), 0);
        const adminMax = (this.admins || []).reduce((m, a) => Math.max(m, Number(a.id) || 0), 0);
        return Math.max(studentMax, advisorMax, adminMax) + 1;
    }

    getStudentById(id) {
        return this.students.find(s => s.id === id);
    }
    
    getAdvisorById(id) {
        return this.advisors.find(a => a.id === id);
    }

    getAdminById(id) {
        return this.admins.find(a => a.id === id);
    }

    // Return all users combined (students, advisors, admins)
    getAllUsers() {
        return [ ...(this.students || []), ...(this.advisors || []), ...(this.admins || []) ];
    }

    getAllAdmins() {
        return this.admins || [];
    }

    getCourseById(id) {
        return this.courses.find(c => c.id === id);
    }
    
    getCoursesByStudent(studentId) {
        const studentEnrollments = this.enrollments.filter(e => e.studentId === studentId);
        return studentEnrollments.map(e => this.courses.find(c => c.id === e.courseId));
    }

    getAssignmentsByStudent(studentId) {
        return this.assignments.filter(a => a.studentId === studentId);
    }

    getUpcomingAssignments(studentId, limit = 5) {
        const allAssignments = this.getAssignmentsByStudent(studentId);
        const today = new Date().toISOString().split('T')[0];
        
        return allAssignments
            .filter(a => a.dueDate >= today && a.status === 'pending')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, limit);
    }

    // Return academic history entries for a student
    getStudentAcademicHistory(studentId) {
        const s = this.getStudentById(studentId);
        return s ? (s.history || []) : [];
    }
    
    getStudentGPA(studentId) {
        const student = this.getStudentById(studentId);
        if (!student) return 0;

        // Prefer dynamic calculation from academic history if available
        const history = student.history || [];
        if (history.length === 0) {
            // Fallback to stored gpa (for backward compatibility) or 0
            return typeof student.gpa === 'number' && !isNaN(student.gpa) ? student.gpa : 0;
        }

        // Weighted GPA calculation: map numeric grade (0-100) to 4.0 scale linearly, then weight by credits
        let totalPoints = 0;
        let totalCredits = 0;
        for (const entry of history) {
            const grade = Number(entry.grade);
            const credits = Number(entry.credits) || 0;
            if (isNaN(grade) || credits <= 0) continue;

            const points = (grade / 100) * 4.0; // linear mapping 0->0.0, 100->4.0
            totalPoints += points * credits;
            totalCredits += credits;
        }

        if (totalCredits === 0) return 0;
        const gpa = totalPoints / totalCredits;
        // Round to two decimals
        return Math.round(gpa * 100) / 100;
    }
    
    getPendingAssignmentsCount(studentId) {
        const allAssignments = this.getAssignmentsByStudent(studentId);
        const today = new Date().toISOString().split('T')[0];
        
        return allAssignments.filter(a => 
            a.status === 'pending' && a.dueDate >= today
        ).length;
    }
    
    getCompletedAssignmentsCount(studentId) {
        const allAssignments = this.getAssignmentsByStudent(studentId);
        return allAssignments.filter(a => 
            a.status === 'submitted' || a.status === 'graded'
        ).length;
    }
    
    getAllStudents() {
        return this.students;
    }

    getAllCourses() {
        return this.courses;
    }

    // --- Classroom Booking Methods ---
    getAllClassrooms() {
        return this.classrooms || [];
    }

    getBookingsForClassroom(classroomId, date) {
        if (!this.bookings) return [];
        return this.bookings.filter(b => b.classroomId === classroomId && (!date || b.date === date));
    }

    // Utility: convert HH:MM -> minutes
    _timeToMinutes(timeStr) {
        const [hh, mm] = String(timeStr).split(':').map(s => parseInt(s, 10));
        return hh * 60 + (mm || 0);
    }

    // Check overlap between time ranges on the same date
    _timesOverlap(startA, endA, startB, endB) {
        const a0 = this._timeToMinutes(startA);
        const a1 = this._timeToMinutes(endA);
        const b0 = this._timeToMinutes(startB);
        const b1 = this._timeToMinutes(endB);
        return a0 < b1 && b0 < a1; // overlap if intervals intersect
    }

    isClassroomAvailable(classroomId, date, startTime, endTime) {
        const bookings = this.getBookingsForClassroom(classroomId, date);
        for (const b of bookings) {
            if (this._timesOverlap(startTime, endTime, b.startTime, b.endTime)) {
                return false;
            }
        }
        return true;
    }

    getAvailableClassrooms(date, startTime, endTime) {
        // Return classrooms that have no overlapping booking in the requested range
        const rooms = this.getAllClassrooms();
        return rooms.filter(r => this.isClassroomAvailable(r.id, date, startTime, endTime));
    }

    createBooking(booking) {
        // booking: { classroomId, date, startTime, endTime, bookedBy, purpose }
        if (!booking || !booking.classroomId || !booking.date || !booking.startTime || !booking.endTime || !booking.bookedBy) {
            throw new Error('Invalid booking object. Missing required fields.');
        }

        // Check that classroom exists
        const classroom = this.getAllClassrooms().find(c => c.id === booking.classroomId);
        if (!classroom) throw new Error('Classroom not found.');

        // Ensure times make sense
        if (this._timeToMinutes(booking.startTime) >= this._timeToMinutes(booking.endTime)) {
            throw new Error('Start time must be earlier than end time.');
        }

        if (!this.isClassroomAvailable(booking.classroomId, booking.date, booking.startTime, booking.endTime)) {
            throw new Error('The classroom is not available in the requested time slot.');
        }

        // Auto-approve bookings made by advisors
        if (!booking.status) {
            const user = this.getAllUsers().find(u => u.id === booking.bookedBy);
            if (user && user.role === 'advisor') {
                booking.status = 'approved';
            } else {
                booking.status = 'pending';
            }
        }

        // Assign id
        const maxId = this.bookings.reduce((m, b) => Math.max(m, b.id || 0), 0);
        booking.id = maxId + 1;
        booking.createdAt = new Date().toISOString();

        this.bookings.push(booking);
        this.saveToStorage();
        return booking;
    }

    // Return all bookings (optionally filtered)
    getAllBookings(filter = {}) {
        let results = this.bookings || [];
        if (filter.classroomId) results = results.filter(b => b.classroomId === filter.classroomId);
        if (filter.date) results = results.filter(b => b.date === filter.date);
        if (filter.bookedBy) results = results.filter(b => b.bookedBy === filter.bookedBy);
        if (filter.status) results = results.filter(b => b.status === filter.status);
        return results;
    }

    getBookingsByStudent(studentId) {
        return (this.bookings || []).filter(b => b.bookedBy === studentId);
    }

    // Update a booking by id. newData may include: classroomId, date, startTime, endTime, purpose, status
    updateBooking(bookingId, newData) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) throw new Error('Booking not found');

        // If changing classroom/date/time, ensure availability
        const newClassroomId = newData.classroomId || booking.classroomId;
        const newDate = newData.date || booking.date;
        const newStart = newData.startTime || booking.startTime;
        const newEnd = newData.endTime || booking.endTime;

        // Temporarily remove current booking from list to check conflicts
        const originalBookings = this.bookings;
        const filtered = originalBookings.filter(b => b.id !== bookingId);

        // Check for overlap with other bookings
        for (const b of filtered) {
            if (b.classroomId === newClassroomId && b.date === newDate) {
                if (this._timesOverlap(newStart, newEnd, b.startTime, b.endTime)) {
                    throw new Error('Requested new time conflicts with existing booking.');
                }
            }
        }

        // Apply changes
        Object.assign(booking, newData);
        this.saveToStorage();
        return booking;
    }

    // Set booking status (e.g., pending, approved, rejected, cancelled)
    setBookingStatus(bookingId, status) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) throw new Error('Booking not found');
    
        // Prevent changing advisor's own approved bookings back to pending
        const user = this.getAllUsers().find(u => u.id === booking.bookedBy);
        if (user && user.role === 'advisor' && status === 'pending' && booking.status === 'approved') {
            throw new Error('Advisor bookings cannot be set to pending status');
        }
    
        booking.status = status;
        this.saveToStorage();
        return booking;
    }

    // Delete a booking
    deleteBooking(bookingId) {
        const idx = this.bookings.findIndex(b => b.id === bookingId);
        if (idx === -1) throw new Error('Booking not found');
        const removed = this.bookings.splice(idx, 1)[0];
        this.saveToStorage();
        return removed;
    }

    // Delete a user (student/advisor/admin) and related simple records
    deleteUser(userId) {
        // Try students
        const sIdx = (this.students || []).findIndex(s => String(s.id) === String(userId));
        if (sIdx !== -1) {
            const removed = this.students.splice(sIdx, 1)[0];
            // Remove enrollments, courseRequests, bookings, grades associated with this student
            this.enrollments = (this.enrollments || []).filter(e => String(e.studentId) !== String(userId));
            this.courseRequests = (this.courseRequests || []).filter(r => String(r.studentId) !== String(userId));
            this.bookings = (this.bookings || []).filter(b => String(b.bookedBy) !== String(userId));
            this.grades = (this.grades || []).filter(g => String(g.studentId) !== String(userId));
            this.saveToStorage();
            return removed;
        }

        // Try advisors
        const aIdx = (this.advisors || []).findIndex(a => String(a.id) === String(userId));
        if (aIdx !== -1) {
            const removed = this.advisors.splice(aIdx, 1)[0];
            // Optionally reassign or remove courses taught by this advisor. For now, just remove advisor.
            this.saveToStorage();
            return removed;
        }

        // Try admins
        const adIdx = (this.admins || []).findIndex(a => String(a.id) === String(userId));
        if (adIdx !== -1) {
            const removed = this.admins.splice(adIdx, 1)[0];
            this.saveToStorage();
            return removed;
        }

        throw new Error('User not found');
    }

    // --- Course Registration Access Methods ---
    getAvailableCoursesForStudent(studentId) {
        const enrolledCourseIds = this.enrollments
            .filter(e => e.studentId === studentId)
            .map(e => e.courseId);

        // Also exclude courses that have a pending request
        const pendingRequestCourseIds = this.courseRequests
            .filter(r => r.studentId === studentId && r.status === 'pending')
            .map(r => r.courseId);

        const excludedIds = [...enrolledCourseIds, ...pendingRequestCourseIds];

        return this.courses.filter(course => 
            !excludedIds.includes(course.id)
        );
    }

    // --- Course Request Methods ---
    getCourseRequestsByStudent(studentId) {
        // Compare as strings to avoid missing matches due to type differences (string vs number)
        return this.courseRequests.filter(r => String(r.studentId) === String(studentId));
    }

    getAllPendingCourseRequests() {
        return this.courseRequests.filter(r => r.status === 'pending');
    }

    createCourseRequest(request) {
        // Assign a simple ID (in a real app, the server would do this)
        // Ensure request ID is unique across all courseRequests
        const maxId = this.courseRequests.reduce((max, r) => Math.max(max, r.id || 0), 0);
        request.id = maxId + 1; 

        // Check for duplicates
        const existingRequest = this.courseRequests.find(r => 
            r.studentId === request.studentId && 
            r.courseId === request.courseId && 
            r.status === 'pending'
        );

        if (existingRequest) {
            throw new Error('A pending request for this course already exists.');
        }

        this.courseRequests.push(request);
        this.saveToStorage();
    }

    // The key method for enrollment logic
    updateCourseRequest(requestId, newStatus) {
        const request = this.courseRequests.find(r => r.id === requestId);
        if (request) {
            request.status = newStatus;
            
            // If approved, add an enrollment record
            if (newStatus === 'approved') {
                const enrollment = { 
                    studentId: request.studentId, 
                    courseId: request.courseId,
                    enrollmentDate: new Date().toISOString().split('T')[0] // Track date
                };
                this.enrollments.push(enrollment);
            }

            this.saveToStorage();
        }
    }
    
    // Advisor actions
    approveCourseRequest(requestId) {
        this.updateCourseRequest(requestId, 'approved');
    }
    
    rejectCourseRequest(requestId) {
        this.updateCourseRequest(requestId, 'rejected');
    }
}

// Instantiate the database
const universityDB = new UniversityDB();