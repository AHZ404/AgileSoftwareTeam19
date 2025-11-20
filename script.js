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
            if (parsed && (parsed.role === 'student' || parsed.role === 'advisor')) {
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
    
    // Course Request Modal Handlers
    modalCloseBtn.addEventListener('click', closeCourseSelectionModal);
    modalCancelBtn.addEventListener('click', closeCourseSelectionModal);
    modalSubmitBtn.addEventListener('click', submitCourseRequest);
    
    // NEW: Materials Modal Handlers
    materialsModalCloseBtns.forEach(btn => btn.addEventListener('click', closeMaterialsModal));

    // Classroom search and booking handlers
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
    document.getElementById('login-message').textContent = 'You have been logged out.';
    document.getElementById('login-message').style.color = 'inherit';
}

function showAppScreen() {
    // If currentUser is missing or malformed, show auth screen instead of hiding UI
    if (!currentUser || !currentUser.role) {
        authScreen.style.display = 'flex';
        studentAppScreen.style.display = 'none';
        advisorAppScreen.style.display = 'none';
        return;
    }

    authScreen.style.display = 'none';

    if (currentUser.role === 'student') {
        studentAppScreen.style.display = 'flex';
        advisorAppScreen.style.display = 'none';
        
        // Update user info in sidebar
        document.getElementById('student-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('student-role').textContent = `${currentUser.major || ''} ${currentUser.level || ''}`;

        // Load default section
        showStudentSection('dashboard');
    } else if (currentUser.role === 'advisor') {
        studentAppScreen.style.display = 'none';
        advisorAppScreen.style.display = 'flex';
        
        // Update user info in sidebar
        document.getElementById('advisor-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('advisor-role').textContent = 'Academic Advisor';

        // Load default section
        showAdvisorSection('advisor-dashboard');
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
    } else if (sectionName === 'student-management') {
        displayAdvisorStudents('all');
    } else if (sectionName === 'manage-bookings') {
        displayAdvisorBookings();
    }
}

// --- Student Content Rendering (Updated for "View Materials" link) ---

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
        
        // Attach event listeners for the new "View Materials" buttons
        document.querySelectorAll('.view-materials-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const courseId = e.currentTarget.getAttribute('data-course-id');
                openMaterialsModal(courseId);
            });
        });
    }

    // Display Upcoming Assignments widget
    displayUpcomingAssignments(studentId);
}

    // Also populate quick course-browse and request lists inside the dashboard
    try {
        // Use separate containers so we don't disturb the full Courses page
        const savedAllCoursesContainer = document.getElementById('all-courses-list');
        const savedStudentRequestsContainer = document.getElementById('student-requests-list');

        // Temporarily reuse the existing rendering functions but target dashboard containers
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

function displayUpcomingAssignments(studentId, limit = 5) {
    const upcoming = universityDB.getUpcomingAssignments(studentId, limit);
    const container = document.getElementById('upcoming-assignments-list');
    container.innerHTML = ''; // Clear previous content

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
    container.innerHTML = ''; // Clear previous content

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
    // Ensure we have the freshest data from storage (handles type/visibility issues)
    try { universityDB.loadFromStorage(); } catch (e) { /* ignore */ }
    const requests = universityDB.getCourseRequestsByStudent(studentId);
    const container = document.getElementById('student-requests-list');
    container.innerHTML = ''; // Clear previous content

    if (requests.length === 0) {
        container.innerHTML = '<p class="placeholder-text">You have no submitted course registration requests.</p>';
        return;
    }

    requests.forEach(request => {
        const course = universityDB.getAllCourses().find(c => c.id === request.courseId);
        
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item';
        // Adjust border color based on status for better visual feedback
        let borderColor = 'var(--primary)'; // Default
        if (request.status === 'pending') borderColor = 'var(--warning)';
        if (request.status === 'rejected') borderColor = 'var(--danger)';
        if (request.status === 'approved') borderColor = 'var(--success)'; // Green for approved
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
    
    // Set the course ID in the hidden input
    modalCourseIdInput.value = courseId;
    
    // Display the course info
    modalCourseInfoP.innerHTML = `You are requesting to register for: <strong>${course.title} (${course.id})</strong>`;
    
    // Clear previous reason
    requestReasonTextarea.value = '';

    courseSelectionModal.style.display = 'flex';
}

// --- Classroom Booking UI ---

function displayClassrooms(studentId) {
    if (!classroomsList) return;

    const date = classroomDateInput && classroomDateInput.value ? classroomDateInput.value : new Date().toISOString().split('T')[0];
    const startTime = classroomStartInput && classroomStartInput.value ? classroomStartInput.value : '09:00';
    const endTime = classroomEndInput && classroomEndInput.value ? classroomEndInput.value : '10:00';

    classroomsList.innerHTML = '';

    // Get available classrooms using the new DB API
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

    // Attach listeners to book buttons
    document.querySelectorAll('.book-classroom-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const roomId = e.currentTarget.getAttribute('data-room-id');
            openBookingModal(roomId);
        });
    });

    // Also render the student's existing bookings on the same page
    if (currentUser && currentUser.role === 'student') {
        displayStudentBookings(currentUser.id);
    }
}

function openBookingModal(classroomId) {
    const room = universityDB.getAllClassrooms().find(r => r.id === classroomId);
    if (!room) return;

    // Prefill modal with selected date/time if available
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
        const booking = {
            classroomId,
            date,
            startTime,
            endTime,
            bookedBy: currentUser.id,
            purpose,
            status: 'pending'
        };

        universityDB.createBooking(booking);
        alert('Booking confirmed!');
        closeBookingModal();

        // Refresh list to reflect that room is no longer available
        displayClassrooms(currentUser.id);
    } catch (err) {
        alert('Booking failed: ' + err.message);
    }
}

// Display bookings for the logged-in student and allow cancelling
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

    // Attach cancel handlers
    document.querySelectorAll('.cancel-booking-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-booking-id'));
        if (!confirm('Cancel this booking?')) return;
        try {
            // Only allow delete if booking belongs to current user
            const booking = universityDB.getAllBookings().find(x => x.id === id);
            if (!booking) { alert('Booking not found'); return; }
            if (booking.bookedBy !== currentUser.id) { alert('You may only cancel your own bookings.'); return; }
            universityDB.deleteBooking(id);
            alert('Booking cancelled.');
            // Refresh both bookings list and available rooms
            displayStudentBookings(currentUser.id);
            displayClassrooms(currentUser.id);
            updateStudentDashboard(currentUser.id);
        } catch (err) { alert('Cancel failed: ' + err.message); }
    }));
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
        
        // Refresh the course browsing list to remove the newly requested course
        displayAvailableCourses(currentUser.id);
        // Refresh the student's request list immediately (requests are now shown on the Courses page)
        displayStudentCourseRequests(currentUser.id);

    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// --- NEW Materials Modal Functions ---

function openMaterialsModal(courseId) {
    const course = universityDB.getCourseById(courseId);
    
    if (!course || !course.materials) return;

    materialsModalTitle.textContent = `${course.id}: ${course.title} Materials`;
    
    // Get instructor info
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

// --- Advisor Content Rendering (Updated with Approval Logic) ---

function updateAdvisorDashboard() {
    // Reload latest data from storage in case another user modified it
    try { universityDB.loadFromStorage(); } catch (e) { /* ignore */ }
    // Recalculate pending requests count from the updated database
    const pendingCount = universityDB.getAllPendingCourseRequests().length;
    const totalStudents = universityDB.getAllStudents().length;
    const bookingsCount = (universityDB.getAllBookings() || []).length;

    if (document.getElementById('advisor-pending-requests-count'))
        document.getElementById('advisor-pending-requests-count').textContent = pendingCount;
    // update bookings stat if present
    const bookingsCountEl = document.getElementById('advisor-bookings-count');
    if (bookingsCountEl) bookingsCountEl.textContent = bookingsCount;
    if (document.getElementById('advisor-total-students-count'))
        document.getElementById('advisor-total-students-count').textContent = totalStudents;
}

function displayAdvisorPendingRequests() {
    // Load latest storage before showing requests (in case other users added requests)
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
        requestItem.style.borderLeftColor = 'var(--warning)'; // Pending color
        // Compute GPA dynamically from history so advisors see accurate value
        const computedGpa = universityDB.getStudentGPA(student.id || studentId) || 0;
        
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
    
    // Attach event listeners for advisor actions
    document.querySelectorAll('.approve-btn').forEach(btn => btn.addEventListener('click', handleAdvisorAction));
    document.querySelectorAll('.reject-btn').forEach(btn => btn.addEventListener('click', handleAdvisorAction));
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

    // Attach handlers
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

function handleAdvisorAction(e) {
    const requestId = parseInt(e.currentTarget.getAttribute('data-request-id'));
    const action = e.currentTarget.classList.contains('approve-btn') ? 'approve' : 'reject';

    // Ensure we are working with the freshest data
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

        // Reload storage and refresh the advisor sections
        try { universityDB.loadFromStorage(); } catch (err) { /* ignore */ }
        displayAdvisorPendingRequests();
        updateAdvisorDashboard();
    } catch (error) {
        alert(`Action failed: ${error.message}`);
    }
}


function displayAdvisorStudents(levelFilter) {
    const students = universityDB.getAllStudents(); 
    const container = document.getElementById('advisor-students-list');
    container.innerHTML = ''; 

    if (students.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No students found.</p>';
        return;
    }

    students.forEach(student => {
        const studentItem = document.createElement('div');
        studentItem.className = 'student-item';
        // Compute GPA dynamically in case stored `gpa` is null or outdated
        const computedGpa = universityDB.getStudentGPA(student.id) || 0;
        studentItem.innerHTML = `
            <div class="student-info">
                <h4>${student.firstName} ${student.lastName} (${student.id})</h4>
                <div class="student-meta">Major: ${student.major} | Level: ${student.level} | GPA: ${computedGpa.toFixed(2)}</div>
            </div>
            <button class="btn btn-primary student-details-btn" data-student-id="${student.id}">View Details</button>
        `;
        container.appendChild(studentItem);
    });
}