const express = require('express');
const router = express.Router();
const client = require('../conn');
const authenticateToken = require('../stdauthenticatetoken');

// Route to submit an assignment
router.post('/submit-assgnm/:id', authenticateToken, async (req, res) => {
    try {
        // Extract assignment ID from request parameters
        const assignmentId = req.params.id;

        // Check if the provided assignment ID exists in the postassg table
        const assignmentQuery = 'SELECT * FROM postassg WHERE id = $1';
        const assignmentResult = await client.query(assignmentQuery, [assignmentId]);

        // If assignment not found, return 404 error
        if (assignmentResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Assignment not found' });
        }

        // Extract assignment details
        const { subject, assignment_title, assignment_description } = assignmentResult.rows[0];

        // Extract student details from the token
        const userId = req.user.id;
        const studentQuery = 'SELECT clgname, name, classandsection FROM stdlog WHERE id = $1';
        const studentResult = await client.query(studentQuery, [userId]);

        // If student details not found, return 404 error
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Student details not found' });
        }

        // Extract student's details
        const { clgname, name, classandsection } = studentResult.rows[0];

        // Extract submission details from request body
        const { assignment_link } = req.body;

        // Insert assignment submission into the database
        const submissionQuery = `
            INSERT INTO submit_assg (clgname, name, subject, assignment_title, assignment_description, classandsection, assignment_link, assignment_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const submissionValues = [clgname, name, subject, assignment_title, assignment_description, classandsection, assignment_link, assignmentId];
        const submissionResult = await client.query(submissionQuery, submissionValues);

        // Return success response with the submitted assignment details
        res.status(201).json({ success: true, submission: submissionResult.rows[0] });
    } catch (error) {
        // Handle any errors
        console.error('Error submitting assignment:', error.stack);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
