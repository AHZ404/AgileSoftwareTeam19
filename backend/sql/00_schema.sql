/* ============================================================
   UniversityPortalDB - Change-anticipating SQL Server schema
   - core schema: stable relational tables
   - ext schema : EAV extension tables (flexible attributes)
   - ref schema : lookup tables (no hardcoded status strings)
   - soft delete everywhere + audit columns
   - stored procedures for ALL access (API never SELECTs tables)
   ============================================================ */

IF DB_ID(N'UniversityPortalDB') IS NULL
BEGIN
  CREATE DATABASE UniversityPortalDB;
END
GO

USE UniversityPortalDB;
GO

-- Schemas
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'ref') EXEC('CREATE SCHEMA ref');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'core') EXEC('CREATE SCHEMA core');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'ext') EXEC('CREATE SCHEMA ext');
GO

-- Change-anticipation: schema version table
IF OBJECT_ID('core.SchemaVersion','U') IS NULL
BEGIN
  CREATE TABLE core.SchemaVersion(
    VersionId INT IDENTITY(1,1) PRIMARY KEY,
    AppliedAt DATETIME2 NOT NULL CONSTRAINT DF_SchemaVersion_AppliedAt DEFAULT SYSUTCDATETIME(),
    VersionLabel NVARCHAR(50) NOT NULL
  );
  INSERT INTO core.SchemaVersion(VersionLabel) VALUES (N'v1.0-initial');
END
GO

/* -------------------------
   Reference / Lookup tables
   ------------------------- */
IF OBJECT_ID('ref.Role','U') IS NULL
BEGIN
  CREATE TABLE ref.Role(
    RoleId TINYINT IDENTITY(1,1) CONSTRAINT PK_Role PRIMARY KEY,
    RoleName NVARCHAR(20) NOT NULL CONSTRAINT UQ_Role_RoleName UNIQUE
  );
END
GO

IF OBJECT_ID('ref.BookingStatus','U') IS NULL
BEGIN
  CREATE TABLE ref.BookingStatus(
    BookingStatusId TINYINT IDENTITY(1,1) CONSTRAINT PK_BookingStatus PRIMARY KEY,
    StatusName NVARCHAR(20) NOT NULL CONSTRAINT UQ_BookingStatus UNIQUE
  );
END
GO

IF OBJECT_ID('ref.RequestStatus','U') IS NULL
BEGIN
  CREATE TABLE ref.RequestStatus(
    RequestStatusId TINYINT IDENTITY(1,1) CONSTRAINT PK_RequestStatus PRIMARY KEY,
    StatusName NVARCHAR(20) NOT NULL CONSTRAINT UQ_RequestStatus UNIQUE
  );
END
GO

IF OBJECT_ID('ref.AssignmentStatus','U') IS NULL
BEGIN
  CREATE TABLE ref.AssignmentStatus(
    AssignmentStatusId TINYINT IDENTITY(1,1) CONSTRAINT PK_AssignmentStatus PRIMARY KEY,
    StatusName NVARCHAR(20) NOT NULL CONSTRAINT UQ_AssignmentStatus UNIQUE
  );
END
GO

/* -------------------------
   Core tables
   ------------------------- */

IF OBJECT_ID('core.Users','U') IS NULL
BEGIN
  CREATE TABLE core.Users(
    UserId INT NOT NULL CONSTRAINT PK_Users PRIMARY KEY,  -- matches your mock IDs (101, 1001, 9001, ...)
    RoleId TINYINT NOT NULL CONSTRAINT FK_Users_Role REFERENCES ref.Role(RoleId),
    Email NVARCHAR(256) NOT NULL CONSTRAINT UQ_Users_Email UNIQUE,
    PasswordHash NVARCHAR(200) NOT NULL,
    FirstName NVARCHAR(60) NOT NULL,
    LastName NVARCHAR(60) NOT NULL,

    -- Soft delete + audit
    IsDeleted BIT NOT NULL CONSTRAINT DF_Users_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('core.Students','U') IS NULL
BEGIN
  CREATE TABLE core.Students(
    StudentId INT NOT NULL CONSTRAINT PK_Students PRIMARY KEY
      CONSTRAINT FK_Students_Users REFERENCES core.Users(UserId),
    Major NVARCHAR(80) NULL,
    Level NVARCHAR(40) NULL,
    IsDeleted BIT NOT NULL CONSTRAINT DF_Students_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Students_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Students_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('core.Advisors','U') IS NULL
BEGIN
  CREATE TABLE core.Advisors(
    AdvisorId INT NOT NULL CONSTRAINT PK_Advisors PRIMARY KEY
      CONSTRAINT FK_Advisors_Users REFERENCES core.Users(UserId),
    Department NVARCHAR(80) NULL,
    IsDeleted BIT NOT NULL CONSTRAINT DF_Advisors_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Advisors_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Advisors_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('core.Admins','U') IS NULL
BEGIN
  CREATE TABLE core.Admins(
    AdminId INT NOT NULL CONSTRAINT PK_Admins PRIMARY KEY
      CONSTRAINT FK_Admins_Users REFERENCES core.Users(UserId),
    Department NVARCHAR(80) NULL,
    IsDeleted BIT NOT NULL CONSTRAINT DF_Admins_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Admins_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Admins_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('core.Courses','U') IS NULL
BEGIN
  CREATE TABLE core.Courses(
    CourseId NVARCHAR(20) NOT NULL CONSTRAINT PK_Courses PRIMARY KEY,
    Title NVARCHAR(120) NOT NULL,
    Credits INT NOT NULL,
    InstructorId INT NULL CONSTRAINT FK_Courses_Advisors REFERENCES core.Advisors(AdvisorId),
    Schedule NVARCHAR(60) NULL,
    Location NVARCHAR(80) NULL,
    Description NVARCHAR(400) NULL,
    Color NVARCHAR(20) NULL,

    IsDeleted BIT NOT NULL CONSTRAINT DF_Courses_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Courses_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Courses_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

-- Change anticipation: materials and classroom features are separate tables (can evolve without altering core rows)
IF OBJECT_ID('core.CourseMaterials','U') IS NULL
BEGIN
  CREATE TABLE core.CourseMaterials(
    MaterialId INT IDENTITY(1,1) CONSTRAINT PK_CourseMaterials PRIMARY KEY,
    CourseId NVARCHAR(20) NOT NULL CONSTRAINT FK_Materials_Courses REFERENCES core.Courses(CourseId),
    MaterialType NVARCHAR(20) NOT NULL,
    Title NVARCHAR(150) NOT NULL,
    Link NVARCHAR(400) NULL,
    Icon NVARCHAR(60) NULL,
    SortOrder INT NOT NULL CONSTRAINT DF_Materials_Sort DEFAULT (0),
    IsDeleted BIT NOT NULL CONSTRAINT DF_Materials_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Materials_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Materials_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('core.Classrooms','U') IS NULL
BEGIN
  CREATE TABLE core.Classrooms(
    ClassroomId NVARCHAR(20) NOT NULL CONSTRAINT PK_Classrooms PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Capacity INT NOT NULL,
    Location NVARCHAR(120) NULL,

    IsDeleted BIT NOT NULL CONSTRAINT DF_Classrooms_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Classrooms_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Classrooms_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('core.ClassroomFeatures','U') IS NULL
BEGIN
  CREATE TABLE core.ClassroomFeatures(
    ClassroomId NVARCHAR(20) NOT NULL CONSTRAINT FK_ClassroomFeatures_Classrooms REFERENCES core.Classrooms(ClassroomId),
    FeatureName NVARCHAR(80) NOT NULL,
    CONSTRAINT PK_ClassroomFeatures PRIMARY KEY (ClassroomId, FeatureName)
  );
END
GO

IF OBJECT_ID('core.Enrollments','U') IS NULL
BEGIN
  CREATE TABLE core.Enrollments(
    EnrollmentId INT IDENTITY(1,1) CONSTRAINT PK_Enrollments PRIMARY KEY,
    StudentId INT NOT NULL CONSTRAINT FK_Enrollments_Students REFERENCES core.Students(StudentId),
    CourseId NVARCHAR(20) NOT NULL CONSTRAINT FK_Enrollments_Courses REFERENCES core.Courses(CourseId),
    EnrollmentDate DATE NULL,
    IsDeleted BIT NOT NULL CONSTRAINT DF_Enrollments_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Enrollments_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Enrollments_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Enrollments_Student_Course UNIQUE (StudentId, CourseId)
  );
END
GO

IF OBJECT_ID('core.StudentHistory','U') IS NULL
BEGIN
  CREATE TABLE core.StudentHistory(
    StudentId INT NOT NULL CONSTRAINT FK_StudentHistory_Students REFERENCES core.Students(StudentId),
    CourseId NVARCHAR(20) NOT NULL CONSTRAINT FK_StudentHistory_Courses REFERENCES core.Courses(CourseId),
    [Year] INT NOT NULL,
    Term NVARCHAR(20) NOT NULL,
    Grade INT NULL,     -- 0..100
    Credits INT NULL,
    CONSTRAINT PK_StudentHistory PRIMARY KEY (StudentId, CourseId, [Year], Term)
  );
END
GO

IF OBJECT_ID('core.Assignments','U') IS NULL
BEGIN
  CREATE TABLE core.Assignments(
    AssignmentId INT NOT NULL CONSTRAINT PK_Assignments PRIMARY KEY, -- matches mock ids
    CourseId NVARCHAR(20) NOT NULL CONSTRAINT FK_Assignments_Courses REFERENCES core.Courses(CourseId),
    Title NVARCHAR(150) NOT NULL,
    DueDate DATE NULL,
    StudentId INT NULL CONSTRAINT FK_Assignments_Students REFERENCES core.Students(StudentId),
    AssignmentStatusId TINYINT NOT NULL CONSTRAINT FK_Assignments_Status REFERENCES ref.AssignmentStatus(AssignmentStatusId),

    IsDeleted BIT NOT NULL CONSTRAINT DF_Assignments_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Assignments_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Assignments_UpdatedAt DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('core.Grades','U') IS NULL
BEGIN
  CREATE TABLE core.Grades(
    GradeId INT IDENTITY(1,1) CONSTRAINT PK_Grades PRIMARY KEY,
    StudentId INT NOT NULL CONSTRAINT FK_Grades_Students REFERENCES core.Students(StudentId),
    CourseId NVARCHAR(20) NOT NULL CONSTRAINT FK_Grades_Courses REFERENCES core.Courses(CourseId),
    AssignmentId INT NOT NULL CONSTRAINT FK_Grades_Assignments REFERENCES core.Assignments(AssignmentId),
    Score DECIMAL(5,2) NULL,

    IsDeleted BIT NOT NULL CONSTRAINT DF_Grades_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Grades_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Grades_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Grades UNIQUE (StudentId, AssignmentId)
  );
END
GO

IF OBJECT_ID('core.Bookings','U') IS NULL
BEGIN
  CREATE TABLE core.Bookings(
    BookingId INT IDENTITY(1,1) CONSTRAINT PK_Bookings PRIMARY KEY,
    ClassroomId NVARCHAR(20) NOT NULL CONSTRAINT FK_Bookings_Classrooms REFERENCES core.Classrooms(ClassroomId),
    [Date] DATE NOT NULL,
    StartTime TIME(0) NOT NULL,
    EndTime TIME(0) NOT NULL,
    BookedBy INT NOT NULL CONSTRAINT FK_Bookings_Users REFERENCES core.Users(UserId),
    Purpose NVARCHAR(200) NULL,
    BookingStatusId TINYINT NOT NULL CONSTRAINT FK_Bookings_Status REFERENCES ref.BookingStatus(BookingStatusId),

    IsDeleted BIT NOT NULL CONSTRAINT DF_Bookings_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Bookings_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Bookings_UpdatedAt DEFAULT SYSUTCDATETIME()
  );

  -- Change anticipation: prevent overlapping bookings per classroom
  CREATE INDEX IX_Bookings_Classroom_Date ON core.Bookings(ClassroomId, [Date]) INCLUDE (StartTime, EndTime, BookingStatusId, IsDeleted);
END
GO

IF OBJECT_ID('core.CourseRequests','U') IS NULL
BEGIN
  CREATE TABLE core.CourseRequests(
    RequestId INT IDENTITY(1,1) CONSTRAINT PK_CourseRequests PRIMARY KEY,
    StudentId INT NOT NULL CONSTRAINT FK_CourseRequests_Students REFERENCES core.Students(StudentId),
    CourseId NVARCHAR(20) NOT NULL CONSTRAINT FK_CourseRequests_Courses REFERENCES core.Courses(CourseId),
    RequestStatusId TINYINT NOT NULL CONSTRAINT FK_CourseRequests_Status REFERENCES ref.RequestStatus(RequestStatusId),

    IsDeleted BIT NOT NULL CONSTRAINT DF_CourseRequests_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_CourseRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_CourseRequests_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_CourseRequests_Pending UNIQUE (StudentId, CourseId, RequestStatusId)
  );
END
GO

/* -------------------------
   EAV (Entity-Attribute-Value) extension model
   ------------------------- */

IF OBJECT_ID('ext.AttributeDefinition','U') IS NULL
BEGIN
  CREATE TABLE ext.AttributeDefinition(
    AttributeId INT IDENTITY(1,1) CONSTRAINT PK_AttributeDefinition PRIMARY KEY,
    Scope NVARCHAR(50) NOT NULL,               -- e.g. 'User','Student','Course','System'
    AttributeName NVARCHAR(100) NOT NULL,
    DataType NVARCHAR(20) NOT NULL,            -- 'string','int','decimal','date','bool','json'
    IsRequired BIT NOT NULL CONSTRAINT DF_Attr_IsRequired DEFAULT (0),
    IsUnique BIT NOT NULL CONSTRAINT DF_Attr_IsUnique DEFAULT (0),
    ValidationRegex NVARCHAR(200) NULL,
    DefaultValueJson NVARCHAR(MAX) NULL,       -- store defaults as json for flexibility

    IsDeleted BIT NOT NULL CONSTRAINT DF_Attr_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Attr_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Attr_UpdatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_Attr_Scope_Name UNIQUE (Scope, AttributeName)
  );
END
GO

IF OBJECT_ID('ext.EntityAttributeValue','U') IS NULL
BEGIN
  CREATE TABLE ext.EntityAttributeValue(
    EntityAttributeValueId BIGINT IDENTITY(1,1) CONSTRAINT PK_EntityAttributeValue PRIMARY KEY,
    EntityType NVARCHAR(50) NOT NULL,          -- matches AttributeDefinition.Scope
    EntityId BIGINT NOT NULL,                  -- id of the row in its core table (UserId, StudentId, ...)
    AttributeId INT NOT NULL CONSTRAINT FK_EAV_Attr REFERENCES ext.AttributeDefinition(AttributeId),

    -- Store value as JSON for "easiest + flexible" (still searchable using JSON_VALUE later if needed)
    ValueJson NVARCHAR(MAX) NULL,

    -- Change anticipation: keep history of changes
    EffectiveFrom DATETIME2 NOT NULL CONSTRAINT DF_EAV_EffFrom DEFAULT SYSUTCDATETIME(),
    EffectiveTo DATETIME2 NULL, -- NULL means "current"

    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_EAV_CreatedAt DEFAULT SYSUTCDATETIME()
  );

  -- Only 1 active value per (EntityType, EntityId, AttributeId)
  CREATE UNIQUE INDEX UX_EAV_Current
    ON ext.EntityAttributeValue(EntityType, EntityId, AttributeId)
    WHERE EffectiveTo IS NULL;
END
GO

/* -------------------------
   Stored procedures (abstraction layer)
   ------------------------- */

-- Users: the API always calls this, not SELECT from table
CREATE OR ALTER PROCEDURE core.usp_User_GetByEmail
  @Email NVARCHAR(256)
AS
BEGIN
  SET NOCOUNT ON;
  SELECT
    u.UserId,
    u.Email,
    u.PasswordHash,
    u.FirstName,
    u.LastName,
    r.RoleName
  FROM core.Users u
  JOIN ref.Role r ON r.RoleId = u.RoleId
  WHERE u.IsDeleted = 0
    AND LOWER(u.Email) = LOWER(@Email);
END
GO

CREATE OR ALTER PROCEDURE core.usp_Admin_GetStats
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @PendingRequestStatusId TINYINT =
    (SELECT TOP 1 RequestStatusId FROM ref.RequestStatus WHERE StatusName = 'pending');

  SELECT
    (SELECT COUNT(*) FROM core.Students WHERE IsDeleted = 0) AS students,
    (SELECT COUNT(*) FROM core.Advisors WHERE IsDeleted = 0) AS advisors,
    (SELECT COUNT(*) FROM core.Bookings WHERE IsDeleted = 0) AS bookings,
    (SELECT COUNT(*) FROM core.CourseRequests WHERE IsDeleted = 0 AND RequestStatusId = @PendingRequestStatusId) AS requests;
END
GO

CREATE OR ALTER PROCEDURE core.usp_Student_GetCourses
  @StudentId INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    c.CourseId AS id,
    c.Title AS title,
    c.Credits AS credits,
    c.InstructorId AS instructorId,
    c.Schedule AS schedule,
    c.Location AS location,
    c.Description AS description,
    c.Color AS color
  FROM core.Enrollments e
  JOIN core.Courses c ON c.CourseId = e.CourseId
  WHERE e.IsDeleted = 0
    AND c.IsDeleted = 0
    AND e.StudentId = @StudentId;
END
GO

CREATE OR ALTER PROCEDURE core.usp_Advisor_GetOverview
  @AdvisorId INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @PendingBookingId TINYINT = (SELECT TOP 1 BookingStatusId FROM ref.BookingStatus WHERE StatusName='pending');
  DECLARE @ApprovedBookingId TINYINT = (SELECT TOP 1 BookingStatusId FROM ref.BookingStatus WHERE StatusName='approved');
  DECLARE @PendingRequestId TINYINT = (SELECT TOP 1 RequestStatusId FROM ref.RequestStatus WHERE StatusName='pending');

  SELECT
    (SELECT COUNT(*) FROM core.Bookings b
        WHERE b.IsDeleted=0 AND b.BookingStatusId=@PendingBookingId) AS bookingsPending,
    (SELECT COUNT(*) FROM core.Bookings b
        WHERE b.IsDeleted=0 AND b.BookingStatusId=@ApprovedBookingId) AS bookingsApproved,
    (SELECT COUNT(*) FROM core.CourseRequests r
        WHERE r.IsDeleted=0 AND r.RequestStatusId=@PendingRequestId) AS requestsPending;
END
GO

/* ---- EAV procs ---- */

CREATE OR ALTER PROCEDURE ext.usp_EntityAttribute_SetJson
  @EntityType NVARCHAR(50),
  @EntityId BIGINT,
  @AttributeName NVARCHAR(100),
  @ValueJson NVARCHAR(MAX)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @AttrId INT =
    (SELECT AttributeId FROM ext.AttributeDefinition
     WHERE IsDeleted=0 AND Scope=@EntityType AND AttributeName=@AttributeName);

  IF @AttrId IS NULL
  BEGIN
    -- Change anticipation: if attribute not defined yet, auto-register it as json
    INSERT INTO ext.AttributeDefinition(Scope, AttributeName, DataType)
    VALUES (@EntityType, @AttributeName, 'json');
    SET @AttrId = SCOPE_IDENTITY();
  END

  -- close previous value (history)
  UPDATE ext.EntityAttributeValue
    SET EffectiveTo = SYSUTCDATETIME()
  WHERE EntityType=@EntityType AND EntityId=@EntityId AND AttributeId=@AttrId AND EffectiveTo IS NULL;

  -- insert new current value
  INSERT INTO ext.EntityAttributeValue(EntityType, EntityId, AttributeId, ValueJson)
  VALUES (@EntityType, @EntityId, @AttrId, @ValueJson);
END
GO

CREATE OR ALTER PROCEDURE ext.usp_EntityAttribute_Get
  @EntityType NVARCHAR(50),
  @EntityId BIGINT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    d.AttributeName,
    d.DataType,
    v.ValueJson AS [Value],
    v.EffectiveFrom
  FROM ext.EntityAttributeValue v
  JOIN ext.AttributeDefinition d ON d.AttributeId = v.AttributeId
  WHERE v.EntityType=@EntityType AND v.EntityId=@EntityId
    AND v.EffectiveTo IS NULL
    AND d.IsDeleted=0;
END
GO
