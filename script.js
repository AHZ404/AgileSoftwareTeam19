// DOM Elements
const authScreen = document.getElementById('auth-screen');
const studentAppScreen = document.getElementById('student-app-screen');
const advisorAppScreen = document.getElementById('advisor-app-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTabs = document.querySelectorAll('.auth-tab');
const logoutBtn = document.getElementById('logout-btn');
const advisorLogoutBtn = document.getElementById('advisor-logout-btn');
const currentSectionTitle = document.getElementById('current-section-title');
const advisorCurrentSectionTitle = document.getElementById('advisor-current-section-title');
const navItems = document.querySelectorAll('.nav-menu .nav-item');
const advisorNavItems = document.querySelectorAll('#advisor-app-screen .nav-menu .nav-item');
const contentSections = document.querySelectorAll('.content-section');
const advisorContentSections = document.querySelectorAll('#advisor-app-screen .content-section');
const courseSelectionModal = document.getElementById('course-selection-modal');
const modalCloseBtn = document.querySelector('#course-selection-modal .close');
const modalCancelBtn = document.getElementById('cancel-request');
const modalSubmitBtn = document.getElementById('submit-request');

// Course Modal elements
const modalCourseIdInput = document.getElementById('modal-course-id');
const modalCourseInfoP = document.getElementById('modal-course-info');
const requestReasonTextarea = document.getElementById('request-reason');

// NEW Materials Modal elements
const materialsModal = document.getElementById('course-materials-modal');
const materialsModalCloseBtns = document.querySelectorAll('.materials-close');
const materialsModalTitle = document.getElementById('materials-modal-title');
const materialsModalCourseInfo = document.getElementById('materials-modal-course-info');
const courseMaterialsList = document.getElementById('course-materials-list');

// Classroom elements
const classroomDateInput = document.getElementById('classroom-date');
const classroomStartInput = document.getElementById('classroom-start');
const classroomEndInput = document.getElementById('classroom-end');
const searchClassroomsBtn = document.getElementById('search-classrooms-btn');
const classroomsList = document.getElementById('classrooms-list');

// Advisor Classroom elements
const advisorClassroomDateInput = document.getElementById('advisor-classroom-date');
const advisorClassroomStartInput = document.getElementById('advisor-classroom-start');
const advisorClassroomEndInput = document.getElementById('advisor-classroom-end');
const advisorSearchClassroomsBtn = document.getElementById('advisor-search-classrooms-btn');
const advisorClassroomsList = document.getElementById('advisor-classrooms-list');
const advisorMyBookingsList = document.getElementById('advisor-my-bookings-list');

// Booking modal elements
const classroomBookingModal = document.getElementById('classroom-booking-modal');
const bookingModalTitle = document.getElementById('booking-modal-title');
const bookingClassroomIdInput = document.getElementById('booking-classroom-id');
const bookingClassroomInfo = document.getElementById('booking-classroom-info');
const bookingPurposeInput = document.getElementById('booking-purpose');
const bookingDateInput = document.getElementById('booking-date');
const bookingStartInput = document.getElementById('booking-start-time');
const bookingEndInput = document.getElementById('booking-end-time');
const confirmBookingBtn = document.getElementById('confirm-booking-btn');
const bookingCloseBtns = document.querySelectorAll('.booking-close');

// Advisor booking management elements
const advisorBookingsList = document.getElementById('advisor-bookings-list');
const advisorEditBookingModal = document.getElementById('advisor-edit-booking-modal');
const advisorEditBookingId = document.getElementById('advisor-edit-booking-id');
const advisorEditBookingRoom = document.getElementById('advisor-edit-booking-room');
const advisorEditPurpose = document.getElementById('advisor-edit-purpose');
const advisorEditDate = document.getElementById('advisor-edit-date');
const advisorEditStart = document.getElementById('advisor-edit-start');
const advisorEditEnd = document.getElementById('advisor-edit-end');
const advisorEditStatus = document.getElementById('advisor-edit-status');
const advisorSaveBookingBtn = document.getElementById('advisor-save-booking-btn');
const advisorDeleteBookingBtn = document.getElementById('advisor-delete-booking-btn');
const advisorBookingCloseBtns = document.querySelectorAll('.advisor-booking-close');

// Admin Elements
const adminAppScreen = document.getElementById('admin-app-screen');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminCurrentSectionTitle = document.getElementById('admin-current-section-title');
const adminNavItems = document.querySelectorAll('#admin-app-screen .nav-menu .nav-item');
const adminContentSections = document.querySelectorAll('#admin-app-screen .content-section');

// Admin Modal Elements
const adminEditUserModal = document.getElementById('admin-edit-user-modal');
const adminEditUserId = document.getElementById('admin-edit-user-id');
const adminEditFirstname = document.getElementById('admin-edit-firstname');
const adminEditLastname = document.getElementById('admin-edit-lastname');
const adminEditEmail = document.getElementById('admin-edit-email');
const adminEditRole = document.getElementById('admin-edit-role');
const adminEditMajor = document.getElementById('admin-edit-major');
const adminEditLevel = document.getElementById('admin-edit-level');
const adminEditMajorGroup = document.getElementById('admin-edit-major-group');
const adminEditLevelGroup = document.getElementById('admin-edit-level-group');
const adminResetPasswordBtn = document.getElementById('admin-reset-password-btn');
const adminSaveUserBtn = document.getElementById('admin-save-user-btn');
const adminUserCloseBtns = document.querySelectorAll('.admin-user-close');

// Admin Action Buttons
const resetAllPasswordsBtn = document.getElementById('reset-all-passwords-btn');
const clearAllRequestsBtn = document.getElementById('clear-all-requests-btn');
const resetDatabaseBtn = document.getElementById('reset-database-btn');

// Current user
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            // Validate parsed user has a known role before restoring
            if (parsed && (parsed.role === 'student' || parsed.role === 'advisor' || parsed.role === 'admin')) {
                currentUser = parsed;
                showAppScreen();
            } else {
                console.warn('Saved user does not have a valid role, clearing saved user.');
                localStorage.removeItem('currentUser');
            }
        } catch (e) {
            console.error('Error parsing saved user:', e);
            localStorage.removeItem('currentUser');
        }
    }
    
    initializeEventListeners();
    
    // Ensure auth screen is visible if no user is logged in
    if (!currentUser) {
        authScreen.style.display = 'flex';
        studentAppScreen.style.display = 'none';
        advisorAppScreen.style.display = 'none';
        if (adminAppScreen) adminAppScreen.style.display = 'none';
    }
});

function initializeEventListeners() {
    // Auth tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding form
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(`${tabName}-form`).classList.add('active');
        });
    });
    
    // Auth form submissions
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegistration);
    
    // Logout buttons
    logoutBtn.addEventListener('click', handleLogout);
    advisorLogoutBtn.addEventListener('click', handleLogout);

    // Student Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            showStudentSection(section);
        });
    });

    // Advisor Navigation
    advisorNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            showAdvisorSection(section);
        });
    });

    // Admin Navigation - with null checks
    if (adminNavItems && adminNavItems.length > 0) {
        adminNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                showAdminSection(section);
            });
        });
    }

    // Admin Logout - with null check
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', handleLogout);
    }

    // Admin Modal Handlers - with null checks
    if (adminUserCloseBtns && adminUserCloseBtns.length > 0) {
        adminUserCloseBtns.forEach(btn => btn.addEventListener('click', closeAdminEditUserModal));
    }
    
    if (adminSaveUserBtn) {
        adminSaveUserBtn.addEventListener('click', saveAdminUserChanges);
    }
    
    if (adminResetPasswordBtn) {
        adminResetPasswordBtn.addEventListener('click', resetUserPassword);
    }

    // Admin Action Handlers - with null checks
    if (resetAllPasswordsBtn) resetAllPasswordsBtn.addEventListener('click', resetAllPasswords);
    if (clearAllRequestsBtn) clearAllRequestsBtn.addEventListener('click', clearAllPendingRequests);
    if (resetDatabaseBtn) resetDatabaseBtn.addEventListener('click', resetSystemDatabase);
    
    // Course Request Modal Handlers
    modalCloseBtn.addEventListener('click', closeCourseSelectionModal);
    modalCancelBtn.addEventListener('click', closeCourseSelectionModal);
    modalSubmitBtn.addEventListener('click', submitCourseRequest);
    
    // Materials Modal Handlers
    materialsModalCloseBtns.forEach(btn => btn.addEventListener('click', closeMaterialsModal));

    // Student Classroom search and booking handlers
    if (searchClassroomsBtn) {
        searchClassroomsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentUser) {
                alert('Please login to search and book classrooms.');
                return;
            }
            displayClassrooms(currentUser.id);
        });
    }

    // Advisor Classroom search and booking handlers
    if (advisorSearchClassroomsBtn) {
        advisorSearchClassroomsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentUser) {
                alert('Please login to search and book classrooms.');
                return;
            }
            displayAdvisorClassrooms(currentUser.id);
        });
    }

    bookingCloseBtns.forEach(btn => btn.addEventListener('click', closeBookingModal));
    if (confirmBookingBtn) confirmBookingBtn.addEventListener('click', submitClassroomBooking);
    advisorBookingCloseBtns.forEach(btn => btn.addEventListener('click', closeAdvisorEditBookingModal));
    if (advisorSaveBookingBtn) advisorSaveBookingBtn.addEventListener('click', submitAdvisorBookingUpdate);
    if (advisorDeleteBookingBtn) advisorDeleteBookingBtn.addEventListener('click', handleAdvisorDeleteBooking);
}

// --- Authentication and Routing ---

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.toLowerCase();
    const password = document.getElementById('login-password').value;
    const loginMessage = document.getElementById('login-message');
    loginMessage.textContent = '';
    
    const user = universityDB.getUserByEmail(email);

    if (user && user.password === password) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showAppScreen();
        loginForm.reset();
    } else {
        loginMessage.textContent = 'Invalid email or password.';
    }
}

function handleRegistration(e) {
    e.preventDefault();
    const fullName = document.getElementById('register-fullname') ? document.getElementById('register-fullname').value.trim() : '';
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password') ? document.getElementById('register-confirm-password').value : '';
    const major = document.getElementById('register-major') ? document.getElementById('register-major').value : 'Undeclared';
    const role = document.getElementById('register-role').value;
    const registerMessage = document.getElementById('register-message');
    registerMessage.textContent = '';

    // Basic validation
    if (!fullName) {
        registerMessage.textContent = 'Please enter your full name.';
        return;
    }

    if (!email) {
        registerMessage.textContent = 'Please enter an email address.';
        return;
    }

    if (!password) {
        registerMessage.textContent = 'Please enter a password.';
        return;
    }

    if (password !== confirmPassword) {
        registerMessage.textContent = 'Passwords do not match.';
        return;
    }

    if (universityDB.getUserByEmail(email)) {
        registerMessage.textContent = 'This email is already registered.';
        return;
    }

    // Split full name into first/last name
    let firstName = fullName;
    let lastName = '';
    const parts = fullName.split(/\s+/);
    if (parts.length > 1) {
        firstName = parts[0];
        lastName = parts.slice(1).join(' ');
    }

    const newUser = {
        email,
        password,
        role,
        id: universityDB.getNextUserId(),
        firstName,
        lastName,
        major: role === 'student' ? (major || 'Undeclared') : null,
        level: role === 'student' ? 'Freshman' : null,
        gpa: role === 'student' ? 0.0 : null
    };

    if (role === 'student') {
        universityDB.students.push(newUser);
    } else {
        universityDB.advisors.push(newUser);
    }

    // Persist to storage and give feedback
    universityDB.saveToStorage();
    registerMessage.textContent = 'Registration successful! Please log in.';
    registerMessage.style.color = 'green';
    registerForm.reset();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    authScreen.style.display = 'flex';
    studentAppScreen.style.display = 'none';
    advisorAppScreen.style.display = 'none';
    if (adminAppScreen) adminAppScreen.style.display = 'none';
    document.getElementById('login-message').textContent = 'You have been logged out.';
    document.getElementById('login-message').style.color = 'inherit';
}

function showAppScreen() {
    if (!currentUser || !currentUser.role) {
        authScreen.style.display = 'flex';
        studentAppScreen.style.display = 'none';
        advisorAppScreen.style.display = 'none';
        if (adminAppScreen) adminAppScreen.style.display = 'none';
        return;
    }

    authScreen.style.display = 'none';

    if (currentUser.role === 'student') {
        studentAppScreen.style.display = 'flex';
        advisorAppScreen.style.display = 'none';
        if (adminAppScreen) adminAppScreen.style.display = 'none';
        
        document.getElementById('student-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('student-role').textContent = `${currentUser.major || ''} ${currentUser.level || ''}`;
        showStudentSection('dashboard');
    } else if (currentUser.role === 'advisor') {
        studentAppScreen.style.display = 'none';
        advisorAppScreen.style.display = 'flex';
        if (adminAppScreen) adminAppScreen.style.display = 'none';
        
        document.getElementById('advisor-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('advisor-role').textContent = 'Academic Advisor';
        showAdvisorSection('advisor-dashboard');
    } else if (currentUser.role === 'admin') {
        studentAppScreen.style.display = 'none';
        advisorAppScreen.style.display = 'none';
        if (adminAppScreen) adminAppScreen.style.display = 'flex';
        
        document.getElementById('admin-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('admin-role').textContent = 'System Administrator';
        showAdminSection('admin-dashboard');
    }
}

// --- Section Management ---

function showStudentSection(sectionName) {
    // Update active navigation item
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
            currentSectionTitle.textContent = item.textContent.trim();
        }
    });

    // Hide all content sections
    contentSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the requested section and load content
    const sectionElement = document.getElementById(`${sectionName}-section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }

    if (sectionName === 'dashboard') {
        updateStudentDashboard(currentUser.id);
    } else if (sectionName === 'courses') {
        // Show both available courses and the student's submitted requests on one page
        displayAvailableCourses(currentUser.id);
        displayStudentCourseRequests(currentUser.id);
    } else if (sectionName === 'course-requests') {
        displayStudentCourseRequests(currentUser.id);
    } else if (sectionName === 'classrooms') {
        // Initialize default date/time if empty
        const today = new Date().toISOString().split('T')[0];
        if (classroomDateInput && !classroomDateInput.value) classroomDateInput.value = today;
        if (classroomStartInput && !classroomStartInput.value) classroomStartInput.value = '09:00';
        if (classroomEndInput && !classroomEndInput.value) classroomEndInput.value = '10:00';
        displayClassrooms(currentUser.id);
    }
}

function showAdvisorSection(sectionName) {
    // Update active navigation item
    advisorNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
            advisorCurrentSectionTitle.textContent = item.textContent.trim();
        }
    });

    // Hide all content sections
    advisorContentSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the requested section and load content
    const sectionElement = document.getElementById(sectionName === 'advisor-dashboard' ? 'advisor-dashboard-section' : `${sectionName}-section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }

    if (sectionName === 'advisor-dashboard') {
        updateAdvisorDashboard();
    } else if (sectionName === 'pending-requests') {
        displayAdvisorPendingRequests();
    } else if (sectionName === 'advisor-classrooms') {
        // Initialize default date/time if empty
        const today = new Date().toISOString().split('T')[0];
        if (advisorClassroomDateInput && !advisorClassroomDateInput.value) advisorClassroomDateInput.value = today;
        if (advisorClassroomStartInput && !advisorClassroomStartInput.value) advisorClassroomStartInput.value = '09:00';
        if (advisorClassroomEndInput && !advisorClassroomEndInput.value) advisorClassroomEndInput.value = '10:00';
        displayAdvisorClassrooms(currentUser.id);
    } else if (sectionName === 'student-management') {
        displayAdvisorStudents('all');
    } else if (sectionName === 'manage-bookings') {
        displayAdvisorBookings();
    }
}

// --- Student Content Rendering ---

function updateStudentDashboard(studentId) {
    const enrolledCourses = universityDB.getCoursesByStudent(studentId);
    const pendingAssignmentsCount = universityDB.getPendingAssignmentsCount(studentId);
    const completedAssignmentsCount = universityDB.getCompletedAssignmentsCount(studentId);
    const gpa = universityDB.getStudentGPA(studentId);

    document.getElementById('dashboard-enrolled-count').textContent = enrolledCourses.length;
    document.getElementById('dashboard-pending-assignments').textContent = pendingAssignmentsCount;
    document.getElementById('dashboard-gpa').textContent = gpa.toFixed(2);
    document.getElementById('dashboard-completed-assignments').textContent = completedAssignmentsCount;

    // Display Current Courses widget (currently enrolled courses)
    const currentCoursesList = document.getElementById('current-courses-list');
    currentCoursesList.innerHTML = '';
    if (enrolledCourses.length === 0) {
        currentCoursesList.innerHTML = '<p class="placeholder-text">Not enrolled in any courses yet.</p>';
    } else {
        enrolledCourses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.style.borderTopColor = course.color || '#4361ee';
            courseCard.innerHTML = `
                <h4>${course.id}: ${course.title}</h4>
                <p>Credits: ${course.credits}</p>
                <div class="course-footer">
                    <button class="btn btn-primary view-materials-btn" data-course-id="${course.id}">
                        <i class="fas fa-file-alt"></i> View Materials
                    </button>
                </div>
            `;
            currentCoursesList.appendChild(courseCard);
        });
        
        // Attach event listeners for the "View Materials" buttons
        document.querySelectorAll('.view-materials-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const courseId = e.currentTarget.getAttribute('data-course-id');
                openMaterialsModal(courseId);
            });
        });
    }

    // Display Upcoming Assignments widget
    displayUpcomingAssignments(studentId);

    // Populate quick course-browse and request lists inside the dashboard
    try {
        const dashboardCoursesContainer = document.getElementById('dashboard-all-courses-list');
        const dashboardRequestsContainer = document.getElementById('dashboard-student-requests-list');

        if (dashboardCoursesContainer) {
            // Render available courses for student into dashboard container
            const availableCourses = universityDB.getAvailableCoursesForStudent(studentId);
            dashboardCoursesContainer.innerHTML = '';
            if (availableCourses.length === 0) {
                dashboardCoursesContainer.innerHTML = '<p class="placeholder-text">No available courses at the moment.</p>';
            } else {
                availableCourses.forEach(course => {
                    const instructor = universityDB.getAdvisorById(course.instructorId) || {firstName: 'Staff', lastName: ''};
                    const card = document.createElement('div');
                    card.className = 'course-card';
                    card.style.borderTopColor = course.color || '#4361ee';
                    card.innerHTML = `
                        <div class="course-header">
                            <h4>${course.id}: ${course.title}</h4>
                            <span class="course-credits">${course.credits} Credits</span>
                        </div>
                        <p><strong>Instructor:</strong> ${instructor.firstName} ${instructor.lastName}</p>
                        <p><strong>Schedule:</strong> ${course.schedule} | ${course.location}</p>
                        <div class="course-footer">
                            <button class="btn btn-register" data-course-id="${course.id}"><i class="fas fa-plus"></i> Request</button>
                        </div>
                    `;
                    dashboardCoursesContainer.appendChild(card);
                });

                // Attach handlers for register buttons in dashboard
                dashboardCoursesContainer.querySelectorAll('.btn-register').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const courseId = event.currentTarget.getAttribute('data-course-id');
                        openCourseSelectionModal(courseId);
                    });
                });
            }
        }

        if (dashboardRequestsContainer) {
            const requests = universityDB.getCourseRequestsByStudent(studentId) || [];
            dashboardRequestsContainer.innerHTML = '';
            if (requests.length === 0) {
                dashboardRequestsContainer.innerHTML = '<p class="placeholder-text">You have no submitted course registration requests.</p>';
            } else {
                requests.forEach(request => {
                    const course = universityDB.getAllCourses().find(c => c.id === request.courseId);
                    const item = document.createElement('div');
                    item.className = 'request-item';
                    let borderColor = 'var(--primary)';
                    if (request.status === 'pending') borderColor = 'var(--warning)';
                    if (request.status === 'rejected') borderColor = 'var(--danger)';
                    if (request.status === 'approved') borderColor = 'var(--success)';
                    item.style.borderLeftColor = borderColor;
                    item.innerHTML = `
                        <div class="request-header">
                            <div class="request-info">
                                <h4>${course ? course.id + ': ' + course.title : 'Course Not Found'}</h4>
                                <div class="request-meta">Submitted: ${request.dateSubmitted}</div>
                            </div>
                            <span class="request-status status-${request.status}">${request.status.toUpperCase()}</span>
                        </div>
                        <p class="request-reason"><strong>Reason:</strong> ${request.reason || 'N/A'}</p>
                    `;
                    dashboardRequestsContainer.appendChild(item);
                });
            }
        }
    } catch (e) {
        console.error('Failed to populate dashboard course/request widgets', e);
    }
}

function displayUpcomingAssignments(studentId, limit = 5) {
    const upcoming = universityDB.getUpcomingAssignments(studentId, limit);
    const container = document.getElementById('upcoming-assignments-list');
    container.innerHTML = '';

    if (upcoming.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No upcoming assignments.</p>';
        return;
    }
    
    upcoming.forEach(assignment => {
        const course = universityDB.courses.find(c => c.id === assignment.courseId);
        const dueDate = new Date(assignment.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        let priorityClass = 'medium';
        let priorityText = 'Pending';
        
        if (assignment.status === 'submitted' || assignment.status === 'graded') {
            priorityClass = 'low';
            priorityText = assignment.status === 'submitted' ? 'Submitted' : 'Graded';
        }
        
        const assignmentElement = document.createElement('div');
        assignmentElement.className = 'assignment-item';
        assignmentElement.innerHTML = `
            <div class="assignment-info">
                <div class="assignment-name">${assignment.title}</div>
                <div class="assignment-details">${course.id} • Due ${formattedDate}</div>
            </div>
            <div class="priority ${priorityClass}">${priorityText}</div>
        `;
        
        container.appendChild(assignmentElement);
    });
}

// Display Available Courses for Registration
function displayAvailableCourses(studentId) {
    const container = document.getElementById('all-courses-list');
    container.innerHTML = '';

    const availableCourses = universityDB.getAvailableCoursesForStudent(studentId);

    if (availableCourses.length === 0) {
        container.innerHTML = '<p class="placeholder-text">You are currently enrolled in all available courses or have a pending request for the remaining ones.</p>';
        return;
    }

    availableCourses.forEach(course => {
        const instructor = universityDB.getAdvisorById(course.instructorId) || {firstName: 'Staff', lastName: ''};
        
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.style.borderTopColor = course.color || '#4361ee';
        courseCard.innerHTML = `
            <div class="course-header">
                <h4>${course.id}: ${course.title}</h4>
                <span class="course-credits">${course.credits} Credits</span>
            </div>
            <p><strong>Instructor:</strong> ${instructor.firstName} ${instructor.lastName}</p>
            <p><strong>Schedule:</strong> ${course.schedule} | ${course.location}</p>
            <p class="course-description">${course.description}</p>
            <div class="course-footer">
                <button class="btn btn-register" data-course-id="${course.id}">
                    <i class="fas fa-plus"></i> Register Course
                </button>
            </div>
        `;
        container.appendChild(courseCard);
    });

    // Attach event listeners to all new "Register Course" buttons
    document.querySelectorAll('.btn-register').forEach(button => {
        button.addEventListener('click', (event) => {
            const courseId = event.currentTarget.getAttribute('data-course-id');
            openCourseSelectionModal(courseId);
        });
    });
}

function displayStudentCourseRequests(studentId) {
    try { universityDB.loadFromStorage(); } catch (e) { /* ignore */ }
    const requests = universityDB.getCourseRequestsByStudent(studentId);
    const container = document.getElementById('student-requests-list');
    container.innerHTML = '';

    if (requests.length === 0) {
        container.innerHTML = '<p class="placeholder-text">You have no submitted course registration requests.</p>';
        return;
    }

    requests.forEach(request => {
        const course = universityDB.getAllCourses().find(c => c.id === request.courseId);
        
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item';
        let borderColor = 'var(--primary)';
        if (request.status === 'pending') borderColor = 'var(--warning)';
        if (request.status === 'rejected') borderColor = 'var(--danger)';
        if (request.status === 'approved') borderColor = 'var(--success)';
        requestItem.style.borderLeftColor = borderColor;
        
        requestItem.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${course ? course.id + ': ' + course.title : 'Course Not Found'}</h4>
                    <div class="request-meta">Submitted: ${request.dateSubmitted}</div>
                </div>
                <span class="request-status status-${request.status}">${request.status.toUpperCase()}</span>
            </div>
            <p class="request-reason"><strong>Reason:</strong> ${request.reason || 'N/A'}</p>
        `;
        container.appendChild(requestItem);
    });
}

// --- Course Request Modal Functions ---

function openCourseSelectionModal(courseId) {
    const course = universityDB.getCourseById(courseId);
    
    modalCourseIdInput.value = courseId;
    modalCourseInfoP.innerHTML = `You are requesting to register for: <strong>${course.title} (${course.id})</strong>`;
    requestReasonTextarea.value = '';

    courseSelectionModal.style.display = 'flex';
}

function closeCourseSelectionModal() {
    courseSelectionModal.style.display = 'none';
}

function submitCourseRequest() {
    const courseId = modalCourseIdInput.value;
    const reason = requestReasonTextarea.value.trim();

    if (!courseId) {
        alert('Error: No course selected.');
        return;
    }

    const request = {
        studentId: currentUser.id,
        courseId: courseId,
        reason: reason || 'No reason provided.',
        dateSubmitted: new Date().toISOString().split('T')[0],
        status: 'pending' 
    };

    try {
        universityDB.createCourseRequest(request);
        closeCourseSelectionModal();
        alert('Course registration request submitted successfully! Please check the Course Requests tab for status updates.');
        
        displayAvailableCourses(currentUser.id);
        displayStudentCourseRequests(currentUser.id);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// --- Materials Modal Functions ---

function openMaterialsModal(courseId) {
    const course = universityDB.getCourseById(courseId);
    
    if (!course || !course.materials) return;

    materialsModalTitle.textContent = `${course.id}: ${course.title} Materials`;
    
    const instructor = universityDB.getAdvisorById(course.instructorId);
    materialsModalCourseInfo.textContent = `Instructor: ${instructor ? instructor.firstName + ' ' + instructor.lastName : 'Staff'}`;
    
    courseMaterialsList.innerHTML = '';
    
    course.materials.forEach(material => {
        const item = document.createElement('a');
        item.className = 'material-item';
        item.href = material.link;
        item.target = '_blank';
        item.innerHTML = `
            <i class="fas fa-${material.icon || 'link'}"></i> 
            <span>${material.title} (${material.type.toUpperCase()})</span>
        `;
        courseMaterialsList.appendChild(item);
    });
    
    materialsModal.style.display = 'flex';
}

function closeMaterialsModal() {
    materialsModal.style.display = 'none';
}

// --- Classroom Booking UI ---

function displayClassrooms(studentId) {
    if (!classroomsList) return;

    const date = classroomDateInput && classroomDateInput.value ? classroomDateInput.value : new Date().toISOString().split('T')[0];
    const startTime = classroomStartInput && classroomStartInput.value ? classroomStartInput.value : '09:00';
    const endTime = classroomEndInput && classroomEndInput.value ? classroomEndInput.value : '10:00';

    classroomsList.innerHTML = '';

    const available = universityDB.getAvailableClassrooms(date, startTime, endTime);

    if (!available || available.length === 0) {
        classroomsList.innerHTML = '<p class="placeholder-text">No classrooms available for the selected time.</p>';
        return;
    }

    available.forEach(room => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
            <h4>${room.id}: ${room.name}</h4>
            <p><strong>Capacity:</strong> ${room.capacity}</p>
            <p><strong>Location:</strong> ${room.location}</p>
            <p><strong>Features:</strong> ${room.features ? room.features.join(', ') : 'N/A'}</p>
            <div class="course-footer">
                <button class="btn btn-primary book-classroom-btn" data-room-id="${room.id}">Book</button>
            </div>
        `;

        classroomsList.appendChild(card);
    });

    document.querySelectorAll('.book-classroom-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const roomId = e.currentTarget.getAttribute('data-room-id');
            openBookingModal(roomId);
        });
    });

    if (currentUser && currentUser.role === 'student') {
        displayStudentBookings(currentUser.id);
    }
}

// --- Advisor Classroom Booking ---

function displayAdvisorClassrooms(advisorId) {
    if (!advisorClassroomsList) return;

    const date = advisorClassroomDateInput && advisorClassroomDateInput.value ? advisorClassroomDateInput.value : new Date().toISOString().split('T')[0];
    const startTime = advisorClassroomStartInput && advisorClassroomStartInput.value ? advisorClassroomStartInput.value : '09:00';
    const endTime = advisorClassroomEndInput && advisorClassroomEndInput.value ? advisorClassroomEndInput.value : '10:00';

    advisorClassroomsList.innerHTML = '';

    const available = universityDB.getAvailableClassrooms(date, startTime, endTime);

    if (!available || available.length === 0) {
        advisorClassroomsList.innerHTML = '<p class="placeholder-text">No classrooms available for the selected time.</p>';
        return;
    }

    available.forEach(room => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.innerHTML = `
            <h4>${room.id}: ${room.name}</h4>
            <p><strong>Capacity:</strong> ${room.capacity}</p>
            <p><strong>Location:</strong> ${room.location}</p>
            <p><strong>Features:</strong> ${room.features ? room.features.join(', ') : 'N/A'}</p>
            <div class="course-footer">
                <button class="btn btn-primary advisor-book-classroom-btn" data-room-id="${room.id}">Book</button>
            </div>
        `;

        advisorClassroomsList.appendChild(card);
    });

    document.querySelectorAll('.advisor-book-classroom-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const roomId = e.currentTarget.getAttribute('data-room-id');
            openAdvisorBookingModal(roomId);
        });
    });

    displayAdvisorMyBookings(advisorId);
}

function openAdvisorBookingModal(classroomId) {
    const room = universityDB.getAllClassrooms().find(r => r.id === classroomId);
    if (!room) return;

    bookingClassroomIdInput.value = classroomId;
    bookingClassroomInfo.textContent = `${room.id}: ${room.name} — ${room.location}`;
    bookingPurposeInput.value = '';
    bookingDateInput.value = advisorClassroomDateInput && advisorClassroomDateInput.value ? advisorClassroomDateInput.value : new Date().toISOString().split('T')[0];
    bookingStartInput.value = advisorClassroomStartInput && advisorClassroomStartInput.value ? advisorClassroomStartInput.value : '09:00';
    bookingEndInput.value = advisorClassroomEndInput && advisorClassroomEndInput.value ? advisorClassroomEndInput.value : '10:00';

    classroomBookingModal.style.display = 'flex';
}

function displayAdvisorMyBookings(advisorId) {
    const container = document.getElementById('advisor-my-bookings-list');
    if (!container) return;
    container.innerHTML = '';

    const bookings = universityDB.getBookingsByStudent(advisorId) || [];
    if (bookings.length === 0) {
        container.innerHTML = '<p class="placeholder-text">You have no bookings yet.</p>';
        return;
    }

    bookings.sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

    bookings.forEach(b => {
        const room = universityDB.getAllClassrooms().find(r => r.id === b.classroomId) || { id: b.classroomId, name: '' };
        const item = document.createElement('div');
        item.className = 'request-item';
        item.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${room.id}: ${room.name}</h4>
                    <div class="request-meta">Date: ${b.date} | ${b.startTime} - ${b.endTime}</div>
                </div>
                <span class="request-status status-${b.status || 'pending'}">${(b.status || 'pending').toUpperCase()}</span>
            </div>
            <p class="request-reason"><strong>Purpose:</strong> ${b.purpose || 'N/A'}</p>
            <div class="request-actions">
                ${b.status === 'pending' ? `<button class="btn btn-danger advisor-cancel-booking-btn" data-booking-id="${b.id}">Cancel</button>` : ''}
            </div>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.advisor-cancel-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        if (!confirm('Cancel this booking?')) return;
        try {
            const booking = universityDB.getAllBookings().find(x => x.id === id);
            if (!booking) { alert('Booking not found'); return; }
            if (booking.bookedBy !== currentUser.id) { alert('You may only cancel your own bookings.'); return; }
            universityDB.deleteBooking(id);
            alert('Booking cancelled.');
            displayAdvisorMyBookings(currentUser.id);
            displayAdvisorClassrooms(currentUser.id);
            updateAdvisorDashboard();
        } catch (err) { alert('Cancel failed: ' + err.message); }
    }));
}

function openBookingModal(classroomId) {
    const room = universityDB.getAllClassrooms().find(r => r.id === classroomId);
    if (!room) return;

    bookingClassroomIdInput.value = classroomId;
    bookingClassroomInfo.textContent = `${room.id}: ${room.name} — ${room.location}`;
    bookingPurposeInput.value = '';
    bookingDateInput.value = classroomDateInput && classroomDateInput.value ? classroomDateInput.value : new Date().toISOString().split('T')[0];
    bookingStartInput.value = classroomStartInput && classroomStartInput.value ? classroomStartInput.value : '09:00';
    bookingEndInput.value = classroomEndInput && classroomEndInput.value ? classroomEndInput.value : '10:00';

    classroomBookingModal.style.display = 'flex';
}

function closeBookingModal() {
    if (classroomBookingModal) classroomBookingModal.style.display = 'none';
}

// In the submitClassroomBooking function, modify the booking creation for advisors
function submitClassroomBooking() {
    if (!currentUser) {
        alert('You must be logged in to book a classroom.');
        return;
    }

    const classroomId = bookingClassroomIdInput.value;
    const date = bookingDateInput.value;
    const startTime = bookingStartInput.value;
    const endTime = bookingEndInput.value;
    const purpose = bookingPurposeInput.value.trim() || 'General Booking';

    try {
        // Auto-approve bookings made by advisors
        const status = currentUser.role === 'advisor' ? 'approved' : 'pending';

        const booking = {
            classroomId,
            date,
            startTime,
            endTime,
            bookedBy: currentUser.id,
            purpose,
            status: status  // Set status based on user role
        };

        universityDB.createBooking(booking);
        
        if (currentUser.role === 'advisor') {
            alert('Booking confirmed and automatically approved!');
        } else {
            alert('Booking request submitted! Waiting for approval.');
        }
        
        closeBookingModal();
        
        // Refresh the appropriate classroom view based on user role
        if (currentUser.role === 'student') {
            displayClassrooms(currentUser.id);
        } else if (currentUser.role === 'advisor') {
            displayAdvisorClassrooms(currentUser.id);
        }
    } catch (err) {
        alert('Booking failed: ' + err.message);
    }
}

// In the displayAdvisorBookings function, remove the approve/reject buttons for advisor's own bookings
function displayAdvisorBookings() {
    if (!advisorBookingsList) return;
    advisorBookingsList.innerHTML = '';

    const bookings = universityDB.getAllBookings();
    if (!bookings || bookings.length === 0) {
        advisorBookingsList.innerHTML = '<p class="placeholder-text">No bookings found.</p>';
        return;
    }

    bookings.forEach(b => {
        const student = universityDB.getStudentById(b.bookedBy) || { firstName: 'Unknown', lastName: '', id: b.bookedBy };
        const room = universityDB.getAllClassrooms().find(r => r.id === b.classroomId) || { id: b.classroomId, name: '' };

        const item = document.createElement('div');
        item.className = 'request-item';
        
        // Check if this is the current advisor's own booking
        const isOwnBooking = b.bookedBy === currentUser.id;
        
        item.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${room.id}: ${room.name}</h4>
                    <div class="request-meta">Booked by: ${student.firstName} ${student.lastName} (${student.id}) | Date: ${b.date} ${b.startTime}-${b.endTime}</div>
                </div>
                <span class="request-status status-${b.status || 'pending'}">${(b.status || 'pending').toUpperCase()}</span>
            </div>
            <p class="request-reason"><strong>Purpose:</strong> ${b.purpose || 'N/A'}</p>
            <div class="request-actions">
                ${isOwnBooking ? `
                    <button class="btn btn-primary advisor-edit-booking-btn" data-booking-id="${b.id}">Edit</button>
                    <button class="btn btn-danger advisor-cancel-booking-btn" data-booking-id="${b.id}">Cancel</button>
                ` : `
                    <button class="btn btn-primary advisor-edit-booking-btn" data-booking-id="${b.id}">Edit</button>
                    <button class="btn btn-success advisor-approve-booking-btn" data-booking-id="${b.id}">Approve</button>
                    <button class="btn btn-danger advisor-reject-booking-btn" data-booking-id="${b.id}">Reject</button>
                `}
            </div>
        `;

        advisorBookingsList.appendChild(item);
    });

    document.querySelectorAll('.advisor-edit-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        openAdvisorEditBookingModal(id);
    }));

    document.querySelectorAll('.advisor-approve-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        if (confirm('Approve this booking?')) {
            try {
                universityDB.setBookingStatus(id, 'approved');
                alert('Booking approved.');
                displayAdvisorBookings();
                updateAdvisorDashboard();
            } catch (err) { alert('Action failed: ' + err.message); }
        }
    }));

    document.querySelectorAll('.advisor-reject-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        if (confirm('Reject this booking?')) {
            try {
                universityDB.setBookingStatus(id, 'rejected');
                alert('Booking rejected.');
                displayAdvisorBookings();
                updateAdvisorDashboard();
            } catch (err) { alert('Action failed: ' + err.message); }
        }
    }));

    // Add event listener for cancel buttons
    document.querySelectorAll('.advisor-cancel-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        if (confirm('Cancel this booking?')) {
            try {
                universityDB.deleteBooking(id);
                alert('Booking cancelled.');
                displayAdvisorBookings();
                updateAdvisorDashboard();
            } catch (err) { alert('Cancel failed: ' + err.message); }
        }
    }));
}

// Also update the displayAdvisorMyBookings function to show approved status for advisor bookings
function displayAdvisorMyBookings(advisorId) {
    const container = document.getElementById('advisor-my-bookings-list');
    if (!container) return;
    container.innerHTML = '';

    const bookings = universityDB.getBookingsByStudent(advisorId) || [];
    if (bookings.length === 0) {
        container.innerHTML = '<p class="placeholder-text">You have no bookings yet.</p>';
        return;
    }

    bookings.sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

    bookings.forEach(b => {
        const room = universityDB.getAllClassrooms().find(r => r.id === b.classroomId) || { id: b.classroomId, name: '' };
        const item = document.createElement('div');
        item.className = 'request-item';
        item.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${room.id}: ${room.name}</h4>
                    <div class="request-meta">Date: ${b.date} | ${b.startTime} - ${b.endTime}</div>
                </div>
                <span class="request-status status-${b.status || 'pending'}">${(b.status || 'pending').toUpperCase()}</span>
            </div>
            <p class="request-reason"><strong>Purpose:</strong> ${b.purpose || 'N/A'}</p>
            <div class="request-actions">
                <button class="btn btn-danger advisor-cancel-booking-btn" data-booking-id="${b.id}">Cancel</button>
            </div>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.advisor-cancel-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        if (!confirm('Cancel this booking?')) return;
        try {
            const booking = universityDB.getAllBookings().find(x => x.id === id);
            if (!booking) { alert('Booking not found'); return; }
            if (booking.bookedBy !== currentUser.id) { alert('You may only cancel your own bookings.'); return; }
            universityDB.deleteBooking(id);
            alert('Booking cancelled.');
            displayAdvisorMyBookings(currentUser.id);
            displayAdvisorClassrooms(currentUser.id);
            updateAdvisorDashboard();
        } catch (err) { alert('Cancel failed: ' + err.message); }
    }));
}

// Update the displayAllBookings function to ensure admin can delete any booking
function displayAllBookings() {
    const container = document.getElementById('admin-bookings-list');
    if (!container) return;
    
    container.innerHTML = '';

    const bookings = universityDB.getAllBookings();
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No bookings found.</p>';
        return;
    }

    bookings.forEach(booking => {
        const student = universityDB.getStudentById(booking.bookedBy) || universityDB.getAdvisorById(booking.bookedBy) || { firstName: 'Unknown', lastName: '', id: booking.bookedBy };
        const room = universityDB.getAllClassrooms().find(r => r.id === booking.classroomId);
        
        if (!student || !room) return;

        const item = document.createElement('div');
        item.className = 'request-item';
        item.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${room.name} (${room.id})</h4>
                    <div class="request-meta">
                        Booked by: ${student.firstName} ${student.lastName} (${student.id}) | 
                        Date: ${booking.date} | Time: ${booking.startTime}-${booking.endTime}
                    </div>
                </div>
                <span class="request-status status-${booking.status || 'pending'}">${(booking.status || 'pending').toUpperCase()}</span>
            </div>
            <p class="request-reason"><strong>Purpose:</strong> ${booking.purpose || 'N/A'}</p>
            <div class="request-actions">
                <button class="btn btn-danger delete-booking-btn" data-booking-id="${booking.id}">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.delete-booking-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = parseInt(e.target.getAttribute('data-booking-id'));
            if (confirm('Delete this booking?')) {
                try {
                    universityDB.deleteBooking(bookingId);
                    displayAllBookings();
                    updateAdminDashboard();
                    alert('Booking deleted successfully.');
                } catch (err) {
                    alert('Error deleting booking: ' + err.message);
                }
            }
        });
    });
}

function displayStudentBookings(studentId) {
    const container = document.getElementById('student-bookings-list');
    if (!container) return;
    container.innerHTML = '';

    const bookings = universityDB.getBookingsByStudent(studentId) || [];
    if (bookings.length === 0) {
        container.innerHTML = '<p class="placeholder-text">You have no bookings yet.</p>';
        return;
    }

    bookings.sort((a,b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

    bookings.forEach(b => {
        const room = universityDB.getAllClassrooms().find(r => r.id === b.classroomId) || { id: b.classroomId, name: '' };
        const item = document.createElement('div');
        item.className = 'request-item';
        item.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${room.id}: ${room.name}</h4>
                    <div class="request-meta">Date: ${b.date} | ${b.startTime} - ${b.endTime}</div>
                </div>
                <span class="request-status status-${b.status || 'pending'}">${(b.status || 'pending').toUpperCase()}</span>
            </div>
            <p class="request-reason"><strong>Purpose:</strong> ${b.purpose || 'N/A'}</p>
            <div class="request-actions">
                ${b.status === 'pending' ? `<button class="btn btn-danger cancel-booking-btn" data-booking-id="${b.id}">Cancel</button>` : ''}
            </div>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.cancel-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        if (!confirm('Cancel this booking?')) return;
        try {
            const booking = universityDB.getAllBookings().find(x => x.id === id);
            if (!booking) { alert('Booking not found'); return; }
            if (booking.bookedBy !== currentUser.id) { alert('You may only cancel your own bookings.'); return; }
            universityDB.deleteBooking(id);
            alert('Booking cancelled.');
            displayStudentBookings(currentUser.id);
            displayClassrooms(currentUser.id);
            updateStudentDashboard(currentUser.id);
        } catch (err) { alert('Cancel failed: ' + err.message); }
    }));
}

// --- Advisor Content Rendering ---

function updateAdvisorDashboard() {
    try { universityDB.loadFromStorage(); } catch (e) { /* ignore */ }
    const pendingCount = universityDB.getAllPendingCourseRequests().length;
    const totalStudents = universityDB.getAllStudents().length;
    const bookingsCount = (universityDB.getAllBookings() || []).length;

    if (document.getElementById('advisor-pending-requests-count'))
        document.getElementById('advisor-pending-requests-count').textContent = pendingCount;
    const bookingsCountEl = document.getElementById('advisor-bookings-count');
    if (bookingsCountEl) bookingsCountEl.textContent = bookingsCount;
    if (document.getElementById('advisor-total-students-count'))
        document.getElementById('advisor-total-students-count').textContent = totalStudents;
}

function displayAdvisorPendingRequests() {
    try { universityDB.loadFromStorage(); } catch (e) { /* ignore */ }
    const requests = universityDB.getAllPendingCourseRequests();
    const container = document.getElementById('advisor-requests-list');
    container.innerHTML = '';

    if (requests.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No pending course requests at this time.</p>';
        return;
    }

    requests.forEach(request => {
        const student = universityDB.getStudentById(request.studentId) || { firstName: 'Unknown', lastName: '', id: request.studentId, level: 'N/A', gpa: 0 };
        const course = universityDB.getCourseById(request.courseId) || { id: request.courseId, title: 'Course Not Found' };
        
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item advisor-request-item';
        requestItem.style.borderLeftColor = 'var(--warning)';
        const computedGpa = universityDB.getStudentGPA(student.id) || 0;
        
        requestItem.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${course ? course.id + ': ' + course.title : 'Course Not Found'}</h4>
                    <div class="request-meta">Student: ${student.firstName} ${student.lastName} (${student.id}) | Level: ${student.level} | GPA: ${computedGpa.toFixed(2)}</div>
                </div>
                <span class="request-status status-pending">PENDING</span>
            </div>
            <p class="request-reason"><strong>Reason:</strong> ${request.reason || 'N/A'}</p>
            <div class="request-actions">
                <button class="btn btn-success approve-btn" data-request-id="${request.id}"><i class="fas fa-check"></i> Approve</button>
                <button class="btn btn-danger reject-btn" data-request-id="${request.id}"><i class="fas fa-times"></i> Reject</button>
            </div>
        `;
        container.appendChild(requestItem);
    });
    
    document.querySelectorAll('.approve-btn').forEach(btn => btn.addEventListener('click', handleAdvisorAction));
    document.querySelectorAll('.reject-btn').forEach(btn => btn.addEventListener('click', handleAdvisorAction));
}

function handleAdvisorAction(e) {
    const requestId = parseInt(e.currentTarget.getAttribute('data-request-id'));
    const action = e.currentTarget.classList.contains('approve-btn') ? 'approve' : 'reject';

    try { universityDB.loadFromStorage(); } catch (err) { /* ignore */ }

    const request = (universityDB.courseRequests || []).find(r => r.id === requestId);
    if (!request) return alert('Request not found. It may have been processed already.');
    const student = universityDB.getStudentById(request.studentId) || { firstName: 'Student', lastName: '' };

    if (!confirm(`Are you sure you want to ${action} this course request for ${student.firstName} ${student.lastName}?`)) return;

    try {
        if (action === 'approve') {
            universityDB.approveCourseRequest(requestId);
            alert(`Request ${requestId} approved! ${student.firstName} ${student.lastName} has been enrolled.`);
        } else {
            universityDB.rejectCourseRequest(requestId);
            alert(`Request ${requestId} rejected.`);
        }

        try { universityDB.loadFromStorage(); } catch (err) { /* ignore */ }
        displayAdvisorPendingRequests();
        updateAdvisorDashboard();
    } catch (error) {
        alert(`Action failed: ${error.message}`);
    }
}

// --- Advisor Booking Management ---

function displayAdvisorBookings() {
    if (!advisorBookingsList) return;
    advisorBookingsList.innerHTML = '';

    const bookings = universityDB.getAllBookings();
    if (!bookings || bookings.length === 0) {
        advisorBookingsList.innerHTML = '<p class="placeholder-text">No bookings found.</p>';
        return;
    }

    bookings.forEach(b => {
        const student = universityDB.getStudentById(b.bookedBy) || { firstName: 'Unknown', lastName: '', id: b.bookedBy };
        const room = universityDB.getAllClassrooms().find(r => r.id === b.classroomId) || { id: b.classroomId, name: '' };

        const item = document.createElement('div');
        item.className = 'request-item';
        item.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${room.id}: ${room.name}</h4>
                    <div class="request-meta">Booked by: ${student.firstName} ${student.lastName} (${student.id}) | Date: ${b.date} ${b.startTime}-${b.endTime}</div>
                </div>
                <span class="request-status status-${b.status || 'pending'}">${(b.status || 'pending').toUpperCase()}</span>
            </div>
            <p class="request-reason"><strong>Purpose:</strong> ${b.purpose || 'N/A'}</p>
            <div class="request-actions">
                <button class="btn btn-primary advisor-edit-booking-btn" data-booking-id="${b.id}">Edit</button>
                <button class="btn btn-success advisor-approve-booking-btn" data-booking-id="${b.id}">Approve</button>
                <button class="btn btn-danger advisor-reject-booking-btn" data-booking-id="${b.id}">Reject</button>
            </div>
        `;

        advisorBookingsList.appendChild(item);
    });

    document.querySelectorAll('.advisor-edit-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        openAdvisorEditBookingModal(id);
    }));

    document.querySelectorAll('.advisor-approve-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        if (confirm('Approve this booking?')) {
            try {
                universityDB.setBookingStatus(id, 'approved');
                alert('Booking approved.');
                displayAdvisorBookings();
                updateAdvisorDashboard();
            } catch (err) { alert('Action failed: ' + err.message); }
        }
    }));

    document.querySelectorAll('.advisor-reject-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        if (confirm('Reject this booking?')) {
            try {
                universityDB.setBookingStatus(id, 'rejected');
                alert('Booking rejected.');
                displayAdvisorBookings();
                updateAdvisorDashboard();
            } catch (err) { alert('Action failed: ' + err.message); }
        }
    }));
}

function openAdvisorEditBookingModal(bookingId) {
    const booking = universityDB.getAllBookings().find(b => b.id === bookingId);
    if (!booking) return alert('Booking not found');

    advisorEditBookingId.value = booking.id;
    const room = universityDB.getAllClassrooms().find(r => r.id === booking.classroomId) || { id: booking.classroomId, name: '' };
    advisorEditBookingRoom.textContent = `${room.id}: ${room.name} — ${room.location || ''}`;
    advisorEditPurpose.value = booking.purpose || '';
    advisorEditDate.value = booking.date;
    advisorEditStart.value = booking.startTime;
    advisorEditEnd.value = booking.endTime;
    advisorEditStatus.value = booking.status || 'pending';

    advisorEditBookingModal.style.display = 'flex';
}

function closeAdvisorEditBookingModal() {
    if (advisorEditBookingModal) advisorEditBookingModal.style.display = 'none';
}

function submitAdvisorBookingUpdate() {
    const id = parseInt(advisorEditBookingId.value);
    const newData = {
        purpose: advisorEditPurpose.value.trim(),
        date: advisorEditDate.value,
        startTime: advisorEditStart.value,
        endTime: advisorEditEnd.value,
        status: advisorEditStatus.value
    };

    try {
        universityDB.updateBooking(id, newData);
        alert('Booking updated.');
        closeAdvisorEditBookingModal();
        displayAdvisorBookings();
        updateAdvisorDashboard();
    } catch (err) {
        alert('Update failed: ' + err.message);
    }
}

function handleAdvisorDeleteBooking() {
    const id = parseInt(advisorEditBookingId.value);
    if (!confirm('Delete this booking? This action cannot be undone.')) return;
    try {
        universityDB.deleteBooking(id);
        alert('Booking deleted.');
        closeAdvisorEditBookingModal();
        displayAdvisorBookings();
        updateAdvisorDashboard();
    } catch (err) { alert('Delete failed: ' + err.message); }
}

function displayAdvisorStudents(levelFilter) {
    const container = document.getElementById('advisor-students-list');
    container.innerHTML = '';

    try { universityDB.loadFromStorage(); } catch (e) { /* ignore */ }

    const students = universityDB.getAllStudents() || [];
    if (students.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No students found.</p>';
    } else {
        students.forEach(student => {
            const studentItem = document.createElement('div');
            studentItem.className = 'student-item';
            const computedGpa = universityDB.getStudentGPA(student.id) || 0;
            studentItem.innerHTML = `
                <div class="student-info">
                    <h4>${student.firstName} ${student.lastName} (${student.id})</h4>
                    <div class="student-meta">Major: ${student.major} | Level: ${student.level} | GPA: ${computedGpa.toFixed(2)}</div>
                </div>
                <div class="student-actions">
                    <button class="btn btn-primary student-details-btn" data-student-id="${student.id}">View Details</button>
                    ${currentUser && currentUser.role === 'admin' ? `<button class="btn btn-danger delete-user-btn" data-user-id="${student.id}">Delete User</button>` : ''}
                </div>
            `;
            container.appendChild(studentItem);
        });
    }

    if (currentUser && currentUser.role === 'admin') {
        const header = document.createElement('h3');
        header.textContent = 'Advisors & Admins';
        header.style.marginTop = '16px';
        container.appendChild(header);

        const advisory = [ ...(universityDB.advisors || []), ...(universityDB.getAllAdmins ? universityDB.getAllAdmins() : (universityDB.admins || [])) ];
        if (advisory.length === 0) {
            const p = document.createElement('p');
            p.className = 'placeholder-text';
            p.textContent = 'No advisors or admins found.';
            container.appendChild(p);
        } else {
            advisory.forEach(a => {
                const item = document.createElement('div');
                item.className = 'student-item';
                const displayRole = a.role === 'admin' ? 'Admin' : 'Advisor';
                item.innerHTML = `
                    <div class="student-info">
                        <h4>${a.firstName} ${a.lastName} (${a.id})</h4>
                        <div class="student-meta">${displayRole} | ${a.department || ''}</div>
                    </div>
                    <div class="student-actions">
                        <button class="btn btn-primary student-details-btn" data-student-id="${a.id}">View Details</button>
                        <button class="btn btn-danger delete-user-btn" data-user-id="${a.id}">Delete User</button>
                    </div>
                `;
                container.appendChild(item);
            });
        }
    }

    document.querySelectorAll('.delete-user-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-user-id');
        if (!confirm('Delete this user and their related data? This action cannot be undone.')) return;
        try {
            universityDB.deleteUser(id);
            alert('User deleted.');
            displayAdvisorStudents(levelFilter);
            updateAdvisorDashboard();
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    }));
}

// --- Admin Section Management ---
function showAdminSection(sectionName) {
    if (!adminNavItems || adminNavItems.length === 0) return;
    
    adminNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
            adminCurrentSectionTitle.textContent = item.textContent.trim();
        }
    });

    if (!adminContentSections || adminContentSections.length === 0) return;
    
    adminContentSections.forEach(section => {
        section.style.display = 'none';
    });
    
    const sectionElement = document.getElementById(`${sectionName}-section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }

    if (sectionName === 'admin-dashboard') {
        updateAdminDashboard();
    } else if (sectionName === 'user-management') {
        displayAllUsers();
    } else if (sectionName === 'system-management') {
        // System management UI is static
    } else if (sectionName === 'all-bookings') {
        displayAllBookings();
    } else if (sectionName === 'all-requests') {
        displayAllRequests();
    }
}

// --- Admin Dashboard ---
function updateAdminDashboard() {
    const students = universityDB.getAllStudents();
    const advisors = universityDB.advisors || [];
    const admins = universityDB.admins || [];
    const bookings = universityDB.getAllBookings();
    const pendingRequests = universityDB.getAllPendingCourseRequests();

    if (document.getElementById('admin-total-students'))
        document.getElementById('admin-total-students').textContent = students.length;
    if (document.getElementById('admin-total-advisors'))
        document.getElementById('admin-total-advisors').textContent = advisors.length;
    if (document.getElementById('admin-active-bookings'))
        document.getElementById('admin-active-bookings').textContent = bookings.length;
    if (document.getElementById('admin-pending-requests'))
        document.getElementById('admin-pending-requests').textContent = pendingRequests.length;

    displayRecentActivity();
}

function displayRecentActivity() {
    const container = document.getElementById('admin-recent-activity');
    if (!container) return;
    
    container.innerHTML = '';

    const recentRequests = universityDB.courseRequests
        .sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted))
        .slice(0, 5);

    if (recentRequests.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No recent activity to display.</p>';
        return;
    }

    recentRequests.forEach(request => {
        const student = universityDB.getStudentById(request.studentId);
        const course = universityDB.getCourseById(request.courseId);
        
        if (!student || !course) return;

        const item = document.createElement('div');
        item.className = 'request-item';
        item.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${student.firstName} ${student.lastName}</h4>
                    <div class="request-meta">Requested: ${course.id} - ${course.title}</div>
                </div>
                <span class="request-status status-${request.status}">${request.status.toUpperCase()}</span>
            </div>
            <p class="request-reason"><strong>Date:</strong> ${request.dateSubmitted}</p>
        `;
        container.appendChild(item);
    });
}

// --- User Management ---
function displayAllUsers() {
    const container = document.getElementById('admin-users-list');
    if (!container) return;
    
    const roleFilter = document.getElementById('user-role-filter') ? document.getElementById('user-role-filter').value : 'all';
    const searchTerm = document.getElementById('user-search') ? document.getElementById('user-search').value.toLowerCase() : '';
    
    container.innerHTML = '';

    const allUsers = [
        ...(universityDB.getAllStudents() || []).map(u => ({ ...u, type: 'student' })),
        ...(universityDB.advisors || []).map(u => ({ ...u, type: 'advisor' })),
        ...(universityDB.admins || []).map(u => ({ ...u, type: 'admin' }))
    ];

    let filteredUsers = allUsers;

    if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.type === roleFilter);
    }

    if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }

    if (filteredUsers.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No users found.</p>';
        return;
    }

    filteredUsers.forEach(user => {
        const item = document.createElement('div');
        item.className = `user-item ${user.type}`;
        
        let roleDisplay = user.type.charAt(0).toUpperCase() + user.type.slice(1);
        if (user.type === 'student') {
            roleDisplay += ` • ${user.major || 'Undeclared'} • ${user.level || 'N/A'}`;
        }

        item.innerHTML = `
            <div class="user-info">
                <h4>${user.firstName} ${user.lastName} 
                    <span class="role-badge role-${user.type}">${user.type.toUpperCase()}</span>
                </h4>
                <div class="user-meta">
                    ID: ${user.id} | Email: ${user.email} | ${roleDisplay}
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-primary edit-user-btn" data-user-id="${user.id}">Edit</button>
                <button class="btn btn-warning reset-password-btn" data-user-id="${user.id}">Reset Password</button>
                ${user.id !== currentUser.id ? `<button class="btn btn-danger delete-user-btn" data-user-id="${user.id}">Delete</button>` : ''}
            </div>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = parseInt(e.target.getAttribute('data-user-id'));
            openAdminEditUserModal(userId);
        });
    });

    document.querySelectorAll('.reset-password-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = parseInt(e.target.getAttribute('data-user-id'));
            if (confirm('Reset this user\'s password to "0000"?')) {
                resetSingleUserPassword(userId);
            }
        });
    });

    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = parseInt(e.target.getAttribute('data-user-id'));
            if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                try {
                    universityDB.deleteUser(userId);
                    displayAllUsers();
                    updateAdminDashboard();
                    alert('User deleted successfully.');
                } catch (err) {
                    alert('Error deleting user: ' + err.message);
                }
            }
        });
    });
}

// --- Admin User Modal Functions ---
function openAdminEditUserModal(userId) {
    const user = universityDB.getAllUsers().find(u => u.id === userId);
    if (!user) return;

    adminEditUserId.value = user.id;
    adminEditFirstname.value = user.firstName || '';
    adminEditLastname.value = user.lastName || '';
    adminEditEmail.value = user.email || '';
    adminEditRole.value = user.type || user.role;

    if (user.type === 'student' || user.role === 'student') {
        adminEditMajorGroup.style.display = 'block';
        adminEditLevelGroup.style.display = 'block';
        adminEditMajor.value = user.major || '';
        adminEditLevel.value = user.level || '';
    } else {
        adminEditMajorGroup.style.display = 'none';
        adminEditLevelGroup.style.display = 'none';
    }

    adminEditUserModal.style.display = 'flex';
}

function closeAdminEditUserModal() {
    adminEditUserModal.style.display = 'none';
}

function saveAdminUserChanges() {
    const userId = parseInt(adminEditUserId.value);
    const user = universityDB.getAllUsers().find(u => u.id === userId);
    
    if (!user) {
        alert('User not found.');
        return;
    }

    const newData = {
        firstName: adminEditFirstname.value.trim(),
        lastName: adminEditLastname.value.trim(),
        email: adminEditEmail.value.trim(),
        role: adminEditRole.value
    };

    if (adminEditRole.value === 'student') {
        newData.major = adminEditMajor.value.trim();
        newData.level = adminEditLevel.value.trim();
    }

    try {
        let userArray;
        if (user.type === 'student' || user.role === 'student') {
            userArray = universityDB.students;
        } else if (user.type === 'advisor' || user.role === 'advisor') {
            userArray = universityDB.advisors;
        } else if (user.type === 'admin' || user.role === 'admin') {
            userArray = universityDB.admins;
        }

        if (userArray) {
            const userIndex = userArray.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                Object.assign(userArray[userIndex], newData);
                universityDB.saveToStorage();
                alert('User updated successfully.');
                closeAdminEditUserModal();
                displayAllUsers();
            }
        }
    } catch (err) {
        alert('Error updating user: ' + err.message);
    }
}

function resetUserPassword() {
    const userId = parseInt(adminEditUserId.value);
    resetSingleUserPassword(userId);
    closeAdminEditUserModal();
}

function resetSingleUserPassword(userId) {
    try {
        const user = universityDB.getAllUsers().find(u => u.id === userId);
        if (!user) {
            alert('User not found.');
            return;
        }

        let userArray;
        if (user.type === 'student' || user.role === 'student') {
            userArray = universityDB.students;
        } else if (user.type === 'advisor' || user.role === 'advisor') {
            userArray = universityDB.advisors;
        } else if (user.type === 'admin' || user.role === 'admin') {
            userArray = universityDB.admins;
        }

        if (userArray) {
            const userIndex = userArray.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                userArray[userIndex].password = '0000';
                universityDB.saveToStorage();
                alert('Password reset to "0000" for user: ' + user.firstName + ' ' + user.lastName);
                displayAllUsers();
            }
        }
    } catch (err) {
        alert('Error resetting password: ' + err.message);
    }
}

// --- Admin System Management Functions ---
function resetAllPasswords() {
    if (!confirm('This will reset ALL user passwords to "0000". Are you sure?')) return;
    
    try {
        universityDB.students.forEach(student => {
            student.password = '0000';
        });

        universityDB.advisors.forEach(advisor => {
            advisor.password = '0000';
        });

        universityDB.admins.forEach(admin => {
            if (admin.id !== currentUser.id) {
                admin.password = '0000';
            }
        });

        universityDB.saveToStorage();
        alert('All user passwords have been reset to "0000".');
    } catch (err) {
        alert('Error resetting passwords: ' + err.message);
    }
}

function clearAllPendingRequests() {
    if (!confirm('This will remove ALL pending course requests. Are you sure?')) return;
    
    try {
        universityDB.courseRequests = universityDB.courseRequests.filter(req => req.status !== 'pending');
        universityDB.saveToStorage();
        alert('All pending course requests have been cleared.');
        updateAdminDashboard();
        displayAllRequests();
    } catch (err) {
        alert('Error clearing requests: ' + err.message);
    }
}

function resetSystemDatabase() {
    if (!confirm('This will reset ALL system data to default demo state. This action cannot be undone. Are you sure?')) return;
    
    try {
        localStorage.removeItem('universityDB_initialized');
        universityDB.initializeData();
        universityDB.loadFromStorage();
        alert('System data has been reset to default demo state.');
        updateAdminDashboard();
        displayAllUsers();
    } catch (err) {
        alert('Error resetting system: ' + err.message);
    }
}

// --- Display All Bookings ---
function displayAllBookings() {
    const container = document.getElementById('admin-bookings-list');
    if (!container) return;
    
    container.innerHTML = '';

    const bookings = universityDB.getAllBookings();
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No bookings found.</p>';
        return;
    }

    bookings.forEach(booking => {
        const student = universityDB.getStudentById(booking.bookedBy);
        const room = universityDB.getAllClassrooms().find(r => r.id === booking.classroomId);
        
        if (!student || !room) return;

        const item = document.createElement('div');
        item.className = 'request-item';
        item.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${room.name} (${room.id})</h4>
                    <div class="request-meta">
                        Booked by: ${student.firstName} ${student.lastName} (${student.id}) | 
                        Date: ${booking.date} | Time: ${booking.startTime}-${booking.endTime}
                    </div>
                </div>
                <span class="request-status status-${booking.status || 'pending'}">${(booking.status || 'pending').toUpperCase()}</span>
            </div>
            <p class="request-reason"><strong>Purpose:</strong> ${booking.purpose || 'N/A'}</p>
            <div class="request-actions">
                <button class="btn btn-danger delete-booking-btn" data-booking-id="${booking.id}">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.delete-booking-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = parseInt(e.target.getAttribute('data-booking-id'));
            if (confirm('Delete this booking?')) {
                try {
                    universityDB.deleteBooking(bookingId);
                    displayAllBookings();
                    updateAdminDashboard();
                    alert('Booking deleted successfully.');
                } catch (err) {
                    alert('Error deleting booking: ' + err.message);
                }
            }
        });
    });
}

// --- Display All Requests ---
function displayAllRequests() {
    const container = document.getElementById('admin-requests-list');
    if (!container) return;
    
    container.innerHTML = '';

    const requests = universityDB.courseRequests;
    
    if (requests.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No course requests found.</p>';
        return;
    }

    requests.forEach(request => {
        const student = universityDB.getStudentById(request.studentId);
        const course = universityDB.getCourseById(request.courseId);
        
        if (!student || !course) return;

        const item = document.createElement('div');
        item.className = 'request-item';
        item.innerHTML = `
            <div class="request-header">
                <div class="request-info">
                    <h4>${course.id}: ${course.title}</h4>
                    <div class="request-meta">
                        Student: ${student.firstName} ${student.lastName} (${student.id}) | 
                        Submitted: ${request.dateSubmitted}
                    </div>
                </div>
                <span class="request-status status-${request.status}">${request.status.toUpperCase()}</span>
            </div>
            <p class="request-reason"><strong>Reason:</strong> ${request.reason || 'N/A'}</p>
            <div class="request-actions">
                <button class="btn btn-danger delete-request-btn" data-request-id="${request.id}">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });

    document.querySelectorAll('.delete-request-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const requestId = parseInt(e.target.getAttribute('data-request-id'));
            if (confirm('Delete this course request?')) {
                try {
                    const index = universityDB.courseRequests.findIndex(r => r.id === requestId);
                    if (index !== -1) {
                        universityDB.courseRequests.splice(index, 1);
                        universityDB.saveToStorage();
                        displayAllRequests();
                        updateAdminDashboard();
                        alert('Request deleted successfully.');
                    }
                } catch (err) {
                    alert('Error deleting request: ' + err.message);
                }
            }
        });
    });
}

// Add event listeners for user filter and search
document.addEventListener('DOMContentLoaded', () => {
    const userRoleFilter = document.getElementById('user-role-filter');
    const userSearch = document.getElementById('user-search');
    
    if (userRoleFilter) {
        userRoleFilter.addEventListener('change', displayAllUsers);
    }
    
    if (userSearch) {
        userSearch.addEventListener('input', displayAllUsers);
    }
});