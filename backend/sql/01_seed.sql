USE UniversityPortalDB;
GO

/* -------------------------
   Seed lookup tables
   ------------------------- */
IF NOT EXISTS (SELECT 1 FROM ref.Role)
BEGIN
  INSERT INTO ref.Role(RoleName) VALUES ('student'), ('advisor'), ('admin');
END

IF NOT EXISTS (SELECT 1 FROM ref.BookingStatus)
BEGIN
  INSERT INTO ref.BookingStatus(StatusName) VALUES ('pending'), ('approved'), ('rejected'), ('cancelled');
END

IF NOT EXISTS (SELECT 1 FROM ref.RequestStatus)
BEGIN
  INSERT INTO ref.RequestStatus(StatusName) VALUES ('pending'), ('approved'), ('rejected');
END

IF NOT EXISTS (SELECT 1 FROM ref.AssignmentStatus)
BEGIN
  INSERT INTO ref.AssignmentStatus(StatusName) VALUES ('pending'), ('submitted'), ('graded');
END
GO

DECLARE @StudentRoleId TINYINT = (SELECT RoleId FROM ref.Role WHERE RoleName='student');
DECLARE @AdvisorRoleId TINYINT = (SELECT RoleId FROM ref.Role WHERE RoleName='advisor');
DECLARE @AdminRoleId   TINYINT = (SELECT RoleId FROM ref.Role WHERE RoleName='admin');

DECLARE @PendingBookingId TINYINT = (SELECT BookingStatusId FROM ref.BookingStatus WHERE StatusName='pending');
DECLARE @PendingRequestId TINYINT = (SELECT RequestStatusId FROM ref.RequestStatus WHERE StatusName='pending');

DECLARE @PendingAssignId TINYINT = (SELECT AssignmentStatusId FROM ref.AssignmentStatus WHERE StatusName='pending');
DECLARE @SubmittedAssignId TINYINT = (SELECT AssignmentStatusId FROM ref.AssignmentStatus WHERE StatusName='submitted');
DECLARE @GradedAssignId TINYINT = (SELECT AssignmentStatusId FROM ref.AssignmentStatus WHERE StatusName='graded');

-- PasswordHash is bcrypt for "password123"
DECLARE @PwHash NVARCHAR(200) = N'$2b$10$6Tr6wb0SQzxBPXpaY02p5e73a0fhsnu62h3q08TbA5z/7jDJ6asze';

/* -------------------------
   Seed users (matching your mock IDs)
   ------------------------- */
IF NOT EXISTS (SELECT 1 FROM core.Users WHERE UserId=1001)
BEGIN
  INSERT INTO core.Users(UserId, RoleId, Email, PasswordHash, FirstName, LastName)
  VALUES (1001, @AdvisorRoleId, 'dr.elgohary@university.edu', @PwHash, 'Youssef', 'El-Gohary');

  INSERT INTO core.Advisors(AdvisorId, Department)
  VALUES (1001, 'Computer Science');
END

IF NOT EXISTS (SELECT 1 FROM core.Users WHERE UserId=9001)
BEGIN
  INSERT INTO core.Users(UserId, RoleId, Email, PasswordHash, FirstName, LastName)
  VALUES (9001, @AdminRoleId, 'admin@university.edu', @PwHash, 'System', 'Admin');

  INSERT INTO core.Admins(AdminId, Department)
  VALUES (9001, 'Administration');
END

-- Students
IF NOT EXISTS (SELECT 1 FROM core.Users WHERE UserId=101)
BEGIN
  INSERT INTO core.Users(UserId, RoleId, Email, PasswordHash, FirstName, LastName)
  VALUES (101, @StudentRoleId, 'ahmed.elsayed@university.edu', @PwHash, 'Ahmed', 'El-Sayed');
  INSERT INTO core.Students(StudentId, Major, Level) VALUES (101, 'Computer Science', 'Senior');
END

IF NOT EXISTS (SELECT 1 FROM core.Users WHERE UserId=102)
BEGIN
  INSERT INTO core.Users(UserId, RoleId, Email, PasswordHash, FirstName, LastName)
  VALUES (102, @StudentRoleId, 'sara.hassan@university.edu', @PwHash, 'Sara', 'Hassan');
  INSERT INTO core.Students(StudentId, Major, Level) VALUES (102, 'Business', 'Freshman');
END

IF NOT EXISTS (SELECT 1 FROM core.Users WHERE UserId=103)
BEGIN
  INSERT INTO core.Users(UserId, RoleId, Email, PasswordHash, FirstName, LastName)
  VALUES (103, @StudentRoleId, 'omar.mohamed@university.edu', @PwHash, 'Omar', 'Mohamed');
  INSERT INTO core.Students(StudentId, Major, Level) VALUES (103, 'Physics', 'Junior');
END

IF NOT EXISTS (SELECT 1 FROM core.Users WHERE UserId=104)
BEGIN
  INSERT INTO core.Users(UserId, RoleId, Email, PasswordHash, FirstName, LastName)
  VALUES (104, @StudentRoleId, 'mona.ali@university.edu', @PwHash, 'Mona', 'Ali');
  INSERT INTO core.Students(StudentId, Major, Level) VALUES (104, 'Information Systems', 'Sophomore');
END
GO

/* -------------------------
   Seed courses + materials
   ------------------------- */
IF NOT EXISTS (SELECT 1 FROM core.Courses WHERE CourseId='CS101')
BEGIN
  INSERT INTO core.Courses(CourseId, Title, Credits, InstructorId, Schedule, Location, Description, Color)
  VALUES
   ('CS101','Intro to Programming',3,1001,'Mon/Wed 10:00-11:30','Room 301','Fundamental concepts of structured programming.','#4361ee'),
   ('CS205','Data Structures',4,1001,'Tue/Thu 13:00-14:30','Room 205','Analysis and implementation of common data structures.','#4895ef'),
   ('MA101','Calculus I',4,1001,'Sun/Tue 09:00-10:30','Lecture Hall 1','Differential and integral calculus of a single variable.','#4cc9f0'),
   ('EN101','English Composition',3,1001,'Tue/Thu 11:00-12:30','Room 102','Focuses on critical reading and academic writing.','#f72585'),
   ('PH201','Modern Physics',3,1001,'Wed/Fri 14:00-15:30','Lab 4','Introduction to relativity and quantum mechanics.','#7209b7'),
   ('CS301','Operating Systems',3,1001,'Mon/Wed 12:00-13:30','Room 402','Process management, memory, and file systems.','#3a0ca3'),
   ('HI101','World History',3,1001,'Sun/Thu 12:00-13:30','Room 105','Survey of major world civilizations and events.','#b5179e');

  -- A couple of materials for CS101 (enough to prove the pattern)
  INSERT INTO core.CourseMaterials(CourseId, MaterialType, Title, Link, Icon, SortOrder)
  VALUES
    ('CS101','file','Syllabus','#','file-pdf',0),
    ('CS101','link','Week 1 Slides: Basic Syntax','#','file-powerpoint',1);
END
GO

/* -------------------------
   Seed classrooms + features
   ------------------------- */
IF NOT EXISTS (SELECT 1 FROM core.Classrooms WHERE ClassroomId='CL101')
BEGIN
  INSERT INTO core.Classrooms(ClassroomId, Name, Capacity, Location)
  VALUES
    ('CL101','Classroom 101',40,'Main Building - Floor 1'),
    ('CL205','Classroom 205',30,'Science Block - Floor 2'),
    ('AUD1','Auditorium 1',200,'Auditorium Wing');

  INSERT INTO core.ClassroomFeatures(ClassroomId, FeatureName)
  VALUES
    ('CL101','Projector'), ('CL101','Whiteboard'),
    ('CL205','Computers'), ('CL205','Projector'),
    ('AUD1','Stage'), ('AUD1','PA System');
END
GO

/* -------------------------
   Seed enrollments
   ------------------------- */
IF NOT EXISTS (SELECT 1 FROM core.Enrollments WHERE StudentId=101 AND CourseId='CS101')
BEGIN
  INSERT INTO core.Enrollments(StudentId, CourseId) VALUES
    (101,'CS101'),(101,'CS205'),(101,'MA101'),
    (102,'EN101'),
    (103,'PH201');
END
GO

/* -------------------------
   Seed academic history (used for GPA calc if you implement it later)
   ------------------------- */
IF NOT EXISTS (SELECT 1 FROM core.StudentHistory WHERE StudentId=101 AND CourseId='CS101' AND [Year]=2022 AND Term='Fall')
BEGIN
  INSERT INTO core.StudentHistory(StudentId, CourseId, [Year], Term, Grade, Credits) VALUES
    (101,'CS101',2022,'Fall',88,3),
    (101,'CS205',2023,'Spring',82,4),
    (101,'MA101',2021,'Fall',75,4),
    (101,'CS301',2024,'Fall',91,3),
    (102,'EN101',2024,'Fall',78,3),
    (103,'PH201',2023,'Spring',85,3),
    (104,'HI101',2022,'Fall',88,3),
    (104,'EN101',2023,'Spring',90,3);
END
GO

/* -------------------------
   Seed assignments + a grade
   ------------------------- */
IF NOT EXISTS (SELECT 1 FROM core.Assignments WHERE AssignmentId=1)
BEGIN
  INSERT INTO core.Assignments(AssignmentId, CourseId, Title, DueDate, StudentId, AssignmentStatusId)
  VALUES
    (1,'CS101','Assignment 1: Hello World','2025-11-25',101,@PendingAssignId),
    (2,'CS205','Midterm Project','2025-12-10',101,@PendingAssignId),
    (3,'MA101','Homework Set 5','2025-11-20',101,@PendingAssignId),
    (4,'EN101','Essay Draft 1','2025-12-01',102,@PendingAssignId),
    (5,'CS101','Final Exam','2025-12-15',101,@PendingAssignId),
    (6,'PH201','Lab Report 1','2025-11-18',103,@SubmittedAssignId),
    (7,'CS101','Graded Assignment','2025-10-01',101,@GradedAssignId);

  INSERT INTO core.Grades(StudentId, CourseId, AssignmentId, Score)
  VALUES (101,'CS101',7,92);
END
GO

/* -------------------------
   Seed a couple of EAV attributes to prove EAV works
   ------------------------- */
EXEC ext.usp_EntityAttribute_SetJson @EntityType='Student', @EntityId=101, @AttributeName='Phone', @ValueJson=N'"01000000000"';
EXEC ext.usp_EntityAttribute_SetJson @EntityType='Student', @EntityId=101, @AttributeName='EmergencyContact', @ValueJson=N'{"name":"Dad","phone":"01011111111"}';
EXEC ext.usp_EntityAttribute_SetJson @EntityType='System', @EntityId=1,   @AttributeName='MaxBookingHoursPerDay', @ValueJson=N'3';
GO
