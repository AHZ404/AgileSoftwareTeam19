const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // --- NEW: Import bcrypt for security ---
const { poolPromise, sql } = require('./dbConfig');

const app = express();
app.use(cors());

// Increase limit to 50mb to allow file uploads (Assignments/Materials)
app.use(bodyParser.json({ limit: '50mb' }));

// --- HELPER: Get Attribute ID ---
// Finds the ID for 'FirstName' or 'CourseTitle' so we can save the value
async function getAttributeId(name) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('name', sql.VarChar, name)
        .query('SELECT Id FROM Attributes WHERE AttributeName = @name');
    return result.recordset.length > 0 ? result.recordset[0].Id : null;
}

// --- API 1: CREATE ENTITY (Handles Registration for Users, Courses, Assignments) ---
app.post('/api/entity', async (req, res) => {
    // Expected JSON: { "id": "STU001", "type": "student", "attributes": { "FirstName": "John", "Password": "123" } }
    const { id, type, attributes } = req.body;
    
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Create the Entity Core (The "Thing" itself)
        const request = new sql.Request(transaction);
        await request.input('id', sql.VarChar, id)
                     .input('type', sql.VarChar, type)
                     .query(`INSERT INTO Entities (Id, EntityType) VALUES (@id, @type)`);

        // 2. Loop through attributes and save them
        for (const [key, value] of Object.entries(attributes)) {
            const attrId = await getAttributeId(key);
            
            if (attrId) {
                const valRequest = new sql.Request(transaction);

                // --- NEW: PASSWORD HASHING LOGIC STARTS HERE ---
                // If the attribute is 'Password', we scramble it before saving.
                let finalValue = value;
                
                if (key === 'Password') {
                    // Generate a salt and hash the password
                    const salt = await bcrypt.genSalt(10);
                    finalValue = await bcrypt.hash(value, salt);
                    // Now 'finalValue' is the secure hash (e.g., $2b$10$EixZa...), not "12345"
                }
                // --- PASSWORD HASHING LOGIC ENDS HERE ---

                // Check if it's a file (Base64) or text
                if (key === 'File' || key === 'MaterialData') {
                     // Assume value is base64 string
                     const buffer = Buffer.from(value.split(',')[1], 'base64');
                     await valRequest.input('entId', sql.VarChar, id)
                                     .input('attrId', sql.Int, attrId)
                                     .input('valBin', sql.VarBinary(sql.MAX), buffer)
                                     .query(`INSERT INTO EntityValues (EntityId, AttributeId, ValueBinary) VALUES (@entId, @attrId, @valBin)`);
                } else {
                     // Standard Text (Includes Hashed Passwords, Names, Emails, etc.)
                     await valRequest.input('entId', sql.VarChar, id)
                                     .input('attrId', sql.Int, attrId)
                                     .input('valText', sql.NVarChar, String(finalValue)) // We save finalValue here
                                     .query(`INSERT INTO EntityValues (EntityId, AttributeId, ValueText) VALUES (@entId, @attrId, @valText)`);
                }
            }
        }

        await transaction.commit();
        res.status(201).json({ message: 'Saved successfully!' });

    } catch (err) {
        if (transaction._aborted === false) await transaction.rollback();
        console.error(err);
        res.status(500).send(err.message);
    }
});

// --- API 2: GET ENTITY (Reconstructs the Object) ---
app.get('/api/entity/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        
        // Get the Entity Type
        const entityRes = await pool.request()
            .input('id', sql.VarChar, req.params.id)
            .query('SELECT * FROM Entities WHERE Id = @id');
            
        if (entityRes.recordset.length === 0) return res.status(404).send('Not Found');

        // Get all Values for this Entity
        const valuesRes = await pool.request()
            .input('id', sql.VarChar, req.params.id)
            .query(`
                SELECT a.AttributeName, v.ValueText, v.ValueBinary 
                FROM EntityValues v
                JOIN Attributes a ON v.AttributeId = a.Id
                WHERE v.EntityId = @id
            `);

        // Reconstruct the object
        const result = {
            id: entityRes.recordset[0].Id,
            type: entityRes.recordset[0].EntityType,
            ...valuesRes.recordset.reduce((acc, row) => {
                acc[row.AttributeName] = row.ValueBinary ? "FILE_BINARY_DATA" : row.ValueText;
                return acc;
            }, {})
        };

        res.json(result);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- API 3: LOGIN (Updated with Bcrypt Verification) ---
// --- API 3: LOGIN (Updated to fix White Screen Crash) ---
app.post('/api/login', async (req, res) => {
    const { loginId, password } = req.body; 
    
    try {
        const pool = await poolPromise;
        
        // 1. Find User
        const userCheck = await pool.request()
            .input('loginId', sql.VarChar, loginId)
            .query(`
                SELECT TOP 1 E.Id, E.EntityType 
                FROM Entities E
                LEFT JOIN EntityValues V ON E.Id = V.EntityId
                LEFT JOIN Attributes A ON V.AttributeId = A.Id
                WHERE E.Id = @loginId 
                   OR (A.AttributeName = 'Email' AND V.ValueText = @loginId)
            `);

        if (userCheck.recordset.length === 0) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

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

        // 3. Login Success! Fetch details & CONVERT TO LOWERCASE KEYS
        const userDetails = await pool.request()
            .input('uid', sql.VarChar, userId)
            .query(`
                SELECT A.AttributeName, V.ValueText 
                FROM EntityValues V
                JOIN Attributes A ON V.AttributeId = A.Id
                WHERE V.EntityId = @uid
            `);

        // --- THE CRITICAL FIX IS HERE ---
        const userData = {
            id: userId,
            type: userType,
            ...userDetails.recordset.reduce((acc, row) => {
                // Force the first letter to be lowercase
                // "FirstName" -> "firstName", "Email" -> "email"
                const key = row.AttributeName.charAt(0).toLowerCase() + row.AttributeName.slice(1);
                acc[key] = row.ValueText;
                return acc;
            }, {})
        };

        res.json({ success: true, user: userData });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// --- API: Get Student Requests ---
app.get('/api/requests/:studentId', async (req, res) => {
    try {
        const pool = await poolPromise;
        // Join with View_Courses to get the course title for the request list
        const result = await pool.request()
            .input('sid', sql.VarChar, req.params.studentId)
            .query(`
                SELECT E.Id, E.CourseId, E.Status, E.Reason, C.Title, E.EnrolledAt
                FROM Enrollments E
                JOIN View_Courses C ON E.CourseId = C.CourseID
                WHERE E.StudentId = @sid
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- API: Submit Course Request ---
app.post('/api/course-request', async (req, res) => {
    const { studentId, courseId, reason } = req.body;
    try {
        const pool = await poolPromise;
        
        // 1. Check if already requested or enrolled
        const check = await pool.request()
            .input('sid', sql.VarChar, studentId)
            .input('cid', sql.VarChar, courseId)
            .query('SELECT * FROM Enrollments WHERE StudentId = @sid AND CourseId = @cid');

        if (check.recordset.length > 0) {
            return res.status(400).json({ message: 'Request already exists for this course' });
        }

        // 2. Insert new request
        await pool.request()
            .input('sid', sql.VarChar, studentId)
            .input('cid', sql.VarChar, courseId)
            .input('reason', sql.VarChar, reason)
            .query(`
                INSERT INTO Enrollments (StudentId, CourseId, Status, Reason, EnrolledAt) 
                VALUES (@sid, @cid, 'pending', @reason, GETDATE())
            `);

        res.json({ success: true, message: 'Request submitted successfully' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));