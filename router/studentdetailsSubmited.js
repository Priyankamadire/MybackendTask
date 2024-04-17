const express = require('express');
const router = express.Router();
const authenticateToken = require('../authenticateToken'); // Assuming you have authentication middleware
const client = require('../conn'); // Assuming you have a connection to your database

// Route to fetch submitted assignments and post marks
router.post('/post-marks/:assignmentId', authenticateToken, async (req, res) => {
    const { assign_marks } = req.body;
    const { assignmentId } = req.params; // Assignment ID

    try {
        // Fetch submitted assignment details from the submit_assg table
        const submissionQuery = 'SELECT clgname, name, classandsection, assignment_link, assignment_title, assignment_description FROM submit_assg WHERE assignment_id = $1';
        const submissionResult = await client.query(submissionQuery, [assignmentId]);

        if (submissionResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Submitted assignment not found' });
        }

        const { clgname, name,  classandsection, assignment_link, assignment_title, assignment_description } = submissionResult.rows[0];

        // Insert or update marks in the submitted_std table
        const marksQuery = `
            INSERT INTO submitted_std (clgname, name, classandsection, assignment_link, assignment_id, assignment_title, assignment_description, assign_marks)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (assignment_id) DO UPDATE SET assign_marks = EXCLUDED.assign_marks;
        `;
        const marksValues = [clgname, name,  classandsection, assignment_link, assignmentId, assignment_title, assignment_description, assign_marks];
        await client.query(marksQuery, marksValues);

        res.status(201).json({ success: true, message: 'Marks posted successfully' });
    } catch (error) {
        console.error('Error posting marks:', error.stack);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.post('/post-marksforstd/:clgname/:name/:assignmentId', authenticateToken, async (req, res) => {
    const { assign_marks } = req.body;
    const { clgname, name, assignmentId } = req.params; // Parameters from URL

    try {
        // Fetch submitted assignment details from the submit_assg table
        const submissionQuery = 'SELECT assignment_link, classandsection, assignment_title, assignment_description FROM submit_assg WHERE clgname = $1 AND name = $2 AND assignment_id = $3';
        const submissionResult = await client.query(submissionQuery, [clgname, name, assignmentId]);

        // Check if the assignment details are found
        if (submissionResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Submitted assignment not found' });
        }

        const { assignment_link, classandsection, assignment_title, assignment_description } = submissionResult.rows[0];

        // Insert or update marks in the submitted_std table
        const marksQuery = `
            INSERT INTO submitted_std (clgname, name, classandsection, assignment_link, assignment_id, assignment_title, assignment_description, assign_marks)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (assignment_id) DO UPDATE SET assign_marks = EXCLUDED.assign_marks;
        `;
        const marksValues = [clgname, name, classandsection, assignment_link, assignmentId, assignment_title, assignment_description, assign_marks];

        await client.query(marksQuery, marksValues);

        res.status(201).json({ success: true, message: 'Marks posted successfully' });
    } catch (error) {
        console.error('Error posting marks:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});





router.get('/submitted-std-details/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params; // Assignment ID

    try {
        // Fetch submitted student details for the specified assignment ID
        const query = 'SELECT * FROM submit_assg WHERE assignment_id = $1';
        const result = await client.query(query, [assignmentId]);

        // Check if any submissions were found
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'No submissions found for the specified assignment' });
        }

        // Return the submitted student details
        res.status(200).json({ success: true, submissions: result.rows });
    } catch (error) {
        console.error('Error fetching submitted student details:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
router.get('/submitted-std-details-user/:id/:assignmentId', async (req, res) => {
    const { id, assignmentId } = req.params; // Primary key and Assignment ID

    try {
        // Fetch submitted student details for the specified assignment ID and submission ID
        const query = 'SELECT * FROM submit_assg WHERE id = $1 AND assignment_id = $2';
        const result = await client.query(query, [id, assignmentId]);

        // Check if any submission was found
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'No submission found for the specified assignment and user' });
        }

        // Return the submitted student details
        res.status(200).json({ success: true, submission: result.rows[0] });
    } catch (error) {
        console.error('Error fetching submitted student details:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.post('/postingmarks/:id/:assignmentId', authenticateToken, async (req, res) => {
    const { assign_marks } = req.body;
    const { id, assignmentId } = req.params; // Parameters from URL

    try {
        // Fetch submitted assignment details from the submit_assg table using the id and assignmentId
        const submissionQuery = 'SELECT * FROM submit_assg WHERE id = $1 AND assignment_id = $2';
        const submissionResult = await client.query(submissionQuery, [id, assignmentId]);

        // Check if the assignment details are found
        if (submissionResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Submitted assignment not found' });
        }

        const { clgname, name, classandsection, assignment_link, assignment_title, assignment_description } = submissionResult.rows[0];

        // Insert or update marks in the postmarksfor_students table
        const marksQuery = `
            INSERT INTO postmarksfor_students 
                (clgname, name, classandsection, assignment_link, assignment_id, assignment_title, assignment_description, assign_marks)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (assignment_id) DO UPDATE 
                SET assign_marks = EXCLUDED.assign_marks;
        `;
        const marksValues = [
            clgname, 
            name, 
            classandsection, 
            assignment_link, 
            assignmentId, 
            assignment_title, 
            assignment_description, 
            assign_marks
        ];

        await client.query(marksQuery, marksValues);

        res.status(201).json({ success: true, message: 'Marks posted successfully' });
    } catch (error) {
        console.error('Error posting marks:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


module.exports = router;
