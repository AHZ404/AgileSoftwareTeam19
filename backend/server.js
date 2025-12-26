const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
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

// --- API 1: CREATE ENTITY (User, Course, Assignment) ---
app.post('/api/entity', async (req, res) => {
    // Expected JSON: { "id": "STU001", "type": "student", "attributes": { "FirstName": "John", "Role": "student" } }
    const { id, type, attributes } = req.body;
    
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Create the Entity Core
        const request = new sql.Request(transaction);
        await request.input('id', sql.VarChar, id)
                     .input('type', sql.VarChar, type)
                     .query(`INSERT INTO Entities (Id, EntityType) VALUES (@id, @type)`);

        // 2. Loop through attributes and save them
        for (const [key, value] of Object.entries(attributes)) {
            const attrId = await getAttributeId(key);
            
            if (attrId) {
                const valRequest = new sql.Request(transaction);
                // Check if it's a file (Base64) or text
                if (key === 'File' || key === 'MaterialData') {
                     // Assume value is base64 string
                     const buffer = Buffer.from(value.split(',')[1], 'base64');
                     await valRequest.input('entId', sql.VarChar, id)
                                     .input('attrId', sql.Int, attrId)
                                     .input('valBin', sql.VarBinary(sql.MAX), buffer)
                                     .query(`INSERT INTO EntityValues (EntityId, AttributeId, ValueBinary) VALUES (@entId, @attrId, @valBin)`);
                } else {
                     // Standard Text
                     await valRequest.input('entId', sql.VarChar, id)
                                     .input('attrId', sql.Int, attrId)
                                     .input('valText', sql.NVarChar, String(value))
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
// --- API 3: LOGIN (EAV Style) ---
app.post('/api/login', async (req, res) => {
    const { loginId, password } = req.body; // loginId can be Email or UserID
    
    try {
        const pool = await poolPromise;
        
        // 1. Find the User's EntityID based on the Login ID provided
        // We check if the ID matches the Entity ID OR if it matches an 'Email' attribute
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
        // We look for the 'Password' attribute for this specific userId
        const passwordCheck = await pool.request()
            .input('uid', sql.VarChar, userId)
            .query(`
                SELECT V.ValueText FROM EntityValues V
                JOIN Attributes A ON V.AttributeId = A.Id
                WHERE V.EntityId = @uid AND A.AttributeName = 'Password'
            `);

        const dbPassword = passwordCheck.recordset.length > 0 ? passwordCheck.recordset[0].ValueText : null;

        if (dbPassword !== password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 3. Login Success! Fetch user details (Role, Name) to send back
        // Reuse the logic from our GET /api/entity/:id endpoint logic or simplified here:
        const userDetails = await pool.request()
            .input('uid', sql.VarChar, userId)
            .query(`
                SELECT A.AttributeName, V.ValueText 
                FROM EntityValues V
                JOIN Attributes A ON V.AttributeId = A.Id
                WHERE V.EntityId = @uid
            `);

        // Convert list of rows into a nice object: { FirstName: 'John', Role: 'student' ... }
        const userData = {
            id: userId,
            type: userType,
            ...userDetails.recordset.reduce((acc, row) => {
                acc[row.AttributeName] = row.ValueText;
                return acc;
            }, {})
        };

        res.json({ success: true, user: userData });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));