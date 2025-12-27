const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('./dbConfig');

const app = express();
app.use(cors());
// Increase limit to 50mb to allow file uploads (Assignments/Materials)
app.use(bodyParser.json({ limit: '50mb' }));

// ==========================================
// 1. HELPER FUNCTIONS
// ==========================================

// Finds the ID for 'FirstName' or 'CourseTitle' so we can save the value
async function getAttributeId(name) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('name', sql.VarChar, name)
        .query('SELECT Id FROM Attributes WHERE AttributeName = @name');
    return result.recordset.length > 0 ? result.recordset[0].Id : null;
}

// ==========================================
// 2. CORE: AUTHENTICATION & EAV SYSTEM
// ==========================================

// --- LOGIN (Handles hashing & camelCase conversion) ---
app.post('/api/login', async (req, res) => {
    const { loginId, password } = req.body; 
    try {
        const pool = await poolPromise;
        // 1. Find User (Check ID or Email)
        const userCheck = await pool.request()
            .input('loginId', sql.VarChar, loginId)
            .query(`
                SELECT TOP 1 E.Id, E.EntityType 
                FROM Entities E
                LEFT JOIN EntityValues V ON E.Id = V.EntityId
                LEFT JOIN Attributes A ON V.AttributeId = A.Id
                WHERE E.Id = @loginId OR (A.AttributeName = 'Email' AND V.ValueText = @loginId)
            `);

        if (userCheck.recordset.length === 0) return res.status(401).json({ success: false, message: 'User not found' });

        const userId = userCheck.recordset[0].Id;
        const userType = userCheck.recordset[0].EntityType;

        // 2. Verify Password
        const passwordCheck = await pool.request()
            .input('uid', sql.VarChar, userId)
            .query(`
                SELECT V.ValueText FROM EntityValues V
                JOIN Attributes A ON V.AttributeId = A.Id
                WHERE V.EntityId = @uid AND A.AttributeName = 'Password'
            `);

        const dbHash = passwordCheck.recordset.length > 0 ? passwordCheck.recordset[0].ValueText : null;
        if (!dbHash || !(await bcrypt.compare(password, dbHash))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 3. Fetch Details & Convert to camelCase (Fixes White Screen Issue)
        const userDetails = await pool.request().input('uid', sql.VarChar, userId)
            .query(`SELECT A.AttributeName, V.ValueText FROM EntityValues V JOIN Attributes A ON V.AttributeId = A.Id WHERE V.EntityId = @uid`);

        const userData = {
            id: userId,
            type: userType,
            ...userDetails.recordset.reduce((acc, row) => {
                const key = row.AttributeName.charAt(0).toLowerCase() + row.AttributeName.slice(1);
                acc[key] = row.ValueText;
                return acc;
            }, {})
        };
        res.json({ success: true, user: userData });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// --- CREATE ENTITY (Universal: Users, Courses, Assignments, Bookings) ---
app.post('/api/entity', async (req, res) => {
    const { id, type, attributes } = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        // Prevent Duplicate IDs
        const check = await request.query(`SELECT Id FROM Entities WHERE Id = '${id}'`);
        if (check.recordset.length > 0) throw new Error(`ID ${id} already exists.`);

        // 1. Create Core Entity
        await request.input('id', sql.VarChar, id).input('type', sql.VarChar, type)
                     .query(`INSERT INTO Entities (Id, EntityType) VALUES (@id, @type)`);

        // 2. Save Attributes
        for (const [key, value] of Object.entries(attributes)) {
            const attrId = await getAttributeId(key);
            if (attrId) {
                const valReq = new sql.Request(transaction);
                let finalValue = value;

                // Handle Password Hashing
                if (key === 'Password') {
                    const salt = await bcrypt.genSalt(10);
                    finalValue = await bcrypt.hash(value, salt);
                }

                // Handle File (Base64) vs Text
                if (key === 'File' || key === 'MaterialFile') {
                     const buffer = Buffer.from(value.split(',')[1], 'base64');
                     await valReq.input('entId', sql.VarChar, id).input('attrId', sql.Int, attrId).input('valBin', sql.VarBinary(sql.MAX), buffer)
                                 .query(`INSERT INTO EntityValues (EntityId, AttributeId, ValueBinary) VALUES (@entId, @attrId, @valBin)`);
                } else {
                     await valReq.input('entId', sql.VarChar, id).input('attrId', sql.Int, attrId).input('valText', sql.NVarChar, String(finalValue))
                                 .query(`INSERT INTO EntityValues (EntityId, AttributeId, ValueText) VALUES (@entId, @attrId, @valText)`);
                }
            }
        }
        await transaction.commit();
        res.status(201).json({ success: true, message: 'Saved successfully!' });
    } catch (err) {
        if (transaction._aborted === false) await transaction.rollback();
        res.status(500).json({ success: false, message: err.message });
    }
});
// GET /api/entities
// Returns simple ID/Name pairs for lookup maps (Optimized)
app.get('/api/entities', async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // We use a VIEW or a complex query to get flat data for the frontend map
        // This query pivots the EAV data to give you simple columns
        const query = `
            SELECT 
                E.ID as id,
                MAX(CASE WHEN A.AttributeName = 'FirstName' THEN V.ValueText END) as firstName,
                MAX(CASE WHEN A.AttributeName = 'LastName' THEN V.ValueText END) as lastName,
                MAX(CASE WHEN A.AttributeName = 'Role' THEN V.ValueText END) as role
            FROM Entities E
            JOIN EntityValues V ON E.ID = V.EntityId
            JOIN Attributes A ON V.AttributeId = A.Id
            GROUP BY E.ID
        `;
        
        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching entities map:', err);
        res.status(500).json({ error: err.message });
    }
});
// --- GET ENTITY (Reconstructs Object with Binary handling) ---
app.get('/api/entity/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const entityRes = await pool.request().input('id', sql.VarChar, req.params.id)
            .query('SELECT * FROM Entities WHERE Id = @id');
            
        if (entityRes.recordset.length === 0) return res.status(404).send('Not Found');

        const valuesRes = await pool.request().input('id', sql.VarChar, req.params.id)
            .query(`SELECT a.AttributeName, v.ValueText, v.ValueBinary FROM EntityValues v JOIN Attributes a ON v.AttributeId = a.Id WHERE v.EntityId = @id`);

        const result = {
            id: entityRes.recordset[0].Id,
            type: entityRes.recordset[0].EntityType,
            ...valuesRes.recordset.reduce((acc, row) => {
                acc[row.AttributeName] = row.ValueBinary ? "FILE_BINARY_DATA" : row.ValueText;
                return acc;
            }, {})
        };
        res.json(result);
    } catch (err) { res.status(500).send(err.message); }
});

// ==========================================
// 3. FEATURE APIs (Using SQL Views)
// ==========================================

// --- COURSES ---
app.get('/api/courses', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM View_Courses');
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

// --- CLASSROOMS (For Booking Dropdowns) ---
app.get('/api/classrooms', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM View_Classrooms');
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

// --- BOOKINGS (For Advisors to Approve) ---
app.get('/api/bookings', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM View_Bookings');
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});
// PUT: Update Booking Status (Approve/Reject)
// PUT: Update Booking Status (Approve/Reject)
// PUT: Update Booking Status (Approve/Reject)
app.put('/api/bookings/:id', async (req, res) => {
    const { id } = req.params; 
    const { status } = req.body; 

    if (!status) return res.status(400).json({ error: 'Status is required' });

    try {
        const pool = await poolPromise; 

        // 🛑 THIS IS THE CRITICAL PART 🛑
        // You MUST have this subquery to find the correct AttributeID.
        // CHECK YOUR DATABASE: Is the column named 'AttributeName' or 'Name'?
       const query = `
            UPDATE EntityValues
            SET ValueText = @Status
            WHERE EntityID = @EntityID
            AND AttributeID = (
                SELECT Id 
                FROM Attributes 
                WHERE AttributeName = 'BookingStatus' 
            )
        `;

        const result = await pool.request()
            .input('Status', sql.NVarChar, status)
            .input('EntityID', sql.NVarChar, id)
            .query(query);

        if (result.rowsAffected[0] > 0) {
            res.json({ success: true, message: `Booking status updated to ${status}` });
        } else {
            // If you see this error, it means the code IS safe, but it couldn't find the row.
            // This is better than overwriting data!
            res.status(404).json({ error: 'BookingStatus attribute not found. No updates made.' });
        }

    } catch (err) {
        console.error('Error updating booking:', err);
        res.status(500).json({ error: err.message });
    }
});
app.post('/api/courses/assign', async (req, res) => {
    const { courseId, instructorId } = req.body;

    if (!courseId || !instructorId) {
        return res.status(400).json({ error: 'CourseID and InstructorID are required' });
    }

    try {
        const pool = await poolPromise;

        // 1. Check if this Course already has an 'InstructorId' row in EntityValues
        // We look for Attribute ID 27 (InstructorId)
        const checkQuery = `
            SELECT 1 FROM EntityValues 
            WHERE EntityID = @CourseID 
            AND AttributeID = (SELECT Id FROM Attributes WHERE AttributeName = 'InstructorId')
        `;

        const checkRes = await pool.request()
             .input('CourseID', sql.NVarChar, courseId)
             .query(checkQuery);

        if (checkRes.recordset.length > 0) {
            // A. UPDATE existing assignment
            const updateQuery = `
                UPDATE EntityValues
                SET ValueText = @InstructorID
                WHERE EntityID = @CourseID
                AND AttributeID = (SELECT Id FROM Attributes WHERE AttributeName = 'InstructorId')
            `;
            await pool.request()
                .input('InstructorID', sql.NVarChar, instructorId)
                .input('CourseID', sql.NVarChar, courseId)
                .query(updateQuery);
        } else {
            // B. INSERT new assignment (if it was NULL before)
            const insertQuery = `
                INSERT INTO EntityValues (EntityId, AttributeId, ValueText)
                SELECT @CourseID, Id, @InstructorID
                FROM Attributes 
                WHERE AttributeName = 'InstructorId'
            `;
            await pool.request()
                .input('InstructorID', sql.NVarChar, instructorId)
                .input('CourseID', sql.NVarChar, courseId)
                .query(insertQuery);
        }

        res.json({ success: true, message: 'Instructor assigned successfully' });

    } catch (err) {
        console.error('Error assigning instructor:', err);
        res.status(500).json({ error: err.message });
    }
});
app.delete('/api/courses/unassign/:courseId', async (req, res) => {
    const { courseId } = req.params;

    try {
        const pool = await poolPromise;

        // We delete the specific value for Attribute 27 (InstructorId) 
        // linked to this course
        const query = `
            DELETE FROM EntityValues
            WHERE EntityID = @CourseID
            AND AttributeID = (SELECT Id FROM Attributes WHERE AttributeName = 'InstructorId')
        `;

        const result = await pool.request()
            .input('CourseID', sql.NVarChar, courseId)
            .query(query);

        if (result.rowsAffected[0] > 0) {
            res.json({ success: true, message: 'Successfully left the course' });
        } else {
            res.status(404).json({ error: 'Assignment not found' });
        }

    } catch (err) {
        console.error('Error unassigning instructor:', err);
        res.status(500).json({ error: err.message });
    }
});
// --- ASSIGNMENTS (Filtered by Course) ---
// GET: Fetch all assignments for a specific course
app.get('/api/assignments/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CourseID', sql.NVarChar, courseId)
            .query(`SELECT * FROM View_Assignments WHERE CourseID = @CourseID`);
        
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MATERIALS (Lecture Slides/PDFs) ---
// GET: Fetch all materials for a specific course
app.get('/api/materials/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CourseID', sql.NVarChar, courseId)
            .query(`SELECT * FROM View_Materials WHERE CourseID = @CourseID`);
        
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- STUDENT REQUESTS (Enrollment History) ---
app.get('/api/requests/:studentId', async (req, res) => {
    try {
        const pool = await poolPromise;
        // FIX: Removed 'E.EnrolledAt' because that column doesn't exist
        const result = await pool.request().input('sid', sql.VarChar, req.params.studentId)
            .query(`
                SELECT E.Id, E.CourseId, E.Status, E.Reason, C.Title 
                FROM Enrollments E 
                JOIN View_Courses C ON E.CourseId = C.CourseID 
                WHERE E.StudentId = @sid
            `);
        res.json(result.recordset);
    } catch (err) { 
        console.error("SQL Error in /api/requests:", err); // Log the actual error
        res.status(500).send(err.message); 
    }
});
// GET /api/my-courses/:id
// Fetches ONLY 'approved' courses for the Student Dashboard
// GET /api/my-courses/:id
app.get('/api/my-courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        
        // FIX: Removed 'C.Location' and 'C.Color' to prevent SQL Crash
        // We only select columns we KNOW exist in your View_Courses
        const query = `
            SELECT 
                C.CourseID, 
                C.Title, 
                C.Credits, 
                C.ScheduleDay, 
                C.ScheduleTime, 
                C.InstructorID
            FROM Enrollments E
            JOIN View_Courses C ON E.CourseId = C.CourseID
            WHERE E.StudentId = @id AND LOWER(E.Status) = 'approved'
        `;
        
        const result = await pool.request()
            .input('id', sql.NVarChar, id)
            .query(query);

        res.json(result.recordset);
    } catch (err) {
        console.error('SQL Error in /api/my-courses:', err);
        res.status(500).json({ error: err.message });
    }
});
// --- SUBMIT COURSE REQUEST ---
// POST /api/course-request
// POST /api/course-request
// POST /api/course-request
app.post('/api/course-request', async (req, res) => {
    const { studentId, courseId, reason } = req.body;
    
    // We don't need a random ID if your Enrollments table has an auto-incrementing ID.
    // If it doesn't, we can generate one. Assuming standard structure:
    const enrollmentDate = new Date().toISOString();

    try {
        const pool = await poolPromise;
        
        // DIRECT INSERT INTO ENROLLMENTS TABLE
        // NOTE: Please ensure these column names match your dbo.Enrollments table columns!
        const query = `
            INSERT INTO Enrollments (StudentId, CourseId, Status, Reason)
            VALUES (@studentId, @courseId, 'pending', @reason)
        `;
        
        await pool.request()
            .input('studentId', sql.NVarChar, studentId) // or sql.Int if your IDs are numbers
            .input('courseId', sql.NVarChar, courseId)
            .input('reason', sql.NVarChar, reason || '')
            .query(query);

        res.json({ success: true, message: 'Request submitted successfully' });

    } catch (err) {
        console.error('SQL Error:', err);
        res.status(500).json({ message: 'Database error: ' + err.message });
    }
});

// ==========================================
// 4. MANAGEMENT & ADMIN APIs
// ==========================================

// --- GET ALL ENROLLMENTS (For Advisors) ---
app.get('/api/enrollments', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Enrollments");
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching enrollments:', err);
        res.status(500).json({ error: err.message });
    }
});
// --- UPDATE ENROLLMENT STATUS (Approve/Reject) ---
app.put('/api/enrollments/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Expects "approved" or "rejected"

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.NVarChar, status)
            .query("UPDATE Enrollments SET Status = @status WHERE Id = @id");
            
        res.json({ success: true, message: `Request ${status}` });
    } catch (err) {
        console.error('Error updating enrollment:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- DELETE ENROLLMENT ---
app.delete('/api/enrollments/:enrollmentId', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().input('id', sql.Int, req.params.enrollmentId)
            .query('DELETE FROM Enrollments WHERE Id = @id');
        res.json({ success: true, message: 'Enrollment deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- ADMIN: Reset All Passwords to '0000' ---
app.post('/api/admin/reset-passwords', async (req, res) => {
    try {
        const pool = await poolPromise;
        const hashedPassword = await bcrypt.hash('0000', 10);
        
        const attrRes = await pool.request().input('attrName', sql.VarChar, 'Password').query('SELECT Id FROM Attributes WHERE AttributeName = @attrName');
        if (attrRes.recordset.length === 0) return res.status(400).json({ message: 'Password attribute not found' });
        
        const attrId = attrRes.recordset[0].Id;
        const entitiesRes = await pool.request().query('SELECT Id FROM Entities');
        
        for (const entity of entitiesRes.recordset) {
            await pool.request().input('entityId', sql.VarChar, entity.Id).input('attrId', sql.Int, attrId).input('pwd', sql.VarChar, hashedPassword)
                .query(`MERGE INTO EntityValues AS target USING (SELECT @entityId as EntityId, @attrId as AttributeId, @pwd as ValueText) as source ON target.EntityId = source.EntityId AND target.AttributeId = source.AttributeId WHEN MATCHED THEN UPDATE SET ValueText = source.ValueText WHEN NOT MATCHED THEN INSERT (EntityId, AttributeId, ValueText) VALUES (source.EntityId, source.AttributeId, source.ValueText);`);
        }
        res.json({ success: true, message: 'All passwords reset to 0000' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- ADMIN: Clear Pending Requests ---
app.post('/api/admin/clear-pending-requests', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().query("DELETE FROM Enrollments WHERE Status = 'pending'");
        res.json({ success: true, message: 'All pending requests cleared' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
// ==========================================
// 5. GENERIC ADMIN TOOLS (Optional)
// ==========================================

// Update ANY single attribute (Admin Tool)
app.put('/api/entity/:entityId/:attribute', async (req, res) => {
    const { value } = req.body;
    const { entityId, attribute } = req.params;
    try {
        const pool = await poolPromise;
        const attrRes = await pool.request().input('name', sql.VarChar, attribute).query('SELECT Id FROM Attributes WHERE AttributeName = @name');
        if (attrRes.recordset.length === 0) return res.status(404).json({ message: 'Attribute not found' });
        
        const attrId = attrRes.recordset[0].Id;
        await pool.request().input('entityId', sql.VarChar, entityId).input('attrId', sql.Int, attrId).input('value', sql.NVarChar, String(value))
            .query(`MERGE INTO EntityValues AS t USING (SELECT @entityId e, @attrId a, @value v) s ON t.EntityId=s.e AND t.AttributeId=s.a WHEN MATCHED THEN UPDATE SET ValueText=s.v WHEN NOT MATCHED THEN INSERT (EntityId, AttributeId, ValueText) VALUES (s.e, s.a, s.v);`);
        res.json({ success: true, message: 'Updated' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete ANY entity (Admin Tool)
app.delete('/api/entity/:entityId', async (req, res) => {
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = new sql.Request(transaction);
        await request.input('id', sql.VarChar, req.params.entityId).query('DELETE FROM EntityValues WHERE EntityId = @id');
        await request.input('id', sql.VarChar, req.params.entityId).query('DELETE FROM Entities WHERE Id = @id');
        await transaction.commit();
        res.json({ success: true, message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));