const dotenv = require('dotenv');
const client = require('../conn');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const cookieParser = require('cookie-parser');
const authenticateToken = require('../authenticateToken');
dotenv.config({ path: '../config.env' });

router.use(cookieParser());
router.use(bodyParser.json());

console.log(process.env.SECRET_KEY);

router.post('/post-assignment', authenticateToken, async (req, res) => {
    const { assignment_title, assignment_description, due_date, assigned_date, classandsection, attachments_link, marks, total_students } = req.body;
    const userId = req.user.id; // Get user ID from decoded token
  
    try {
      // Fetch user details from the database based on user ID
      const userQuery = 'SELECT clgname, name, subject FROM users WHERE id = $1';
      const userResult = await client.query(userQuery, [userId]);
      const { clgname, name, subject } = userResult.rows[0];
  
      // Insert assignment into the database
      const assignmentQuery = `
        INSERT INTO postassg (clgname, name, subject, assignment_title, assignment_description, due_date, assigned_date, classandsection, attachments_link, marks, total_students)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
      const assignmentValues = [clgname, name, subject, assignment_title, assignment_description, due_date, assigned_date, classandsection, attachments_link, marks, total_students];
      const assignmentResult = await client.query(assignmentQuery, assignmentValues);
      
      res.status(201).json({ success: true, assignment: assignmentResult.rows[0] });
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
router.get('/assignments', authenticateToken, async (req, res) => {
  const userId = req.user.id; // Get user ID from decoded token

  try {
      // Fetch user details from the database based on user ID
      const userQuery = 'SELECT * FROM users WHERE id = $1';
      const userResult = await client.query(userQuery, [userId]);
      const { clgname, name, subject } = userResult.rows[0];

      // Fetch all assignments from the database
      const assignmentQuery = `
          SELECT * 
          FROM postassg 
          WHERE clgname = $1 AND name = $2 AND subject = $3;
      `;
      const assignmentResult = await client.query(assignmentQuery, [clgname, name, subject]);
      const assignments = assignmentResult.rows;

      res.status(200).json({ success: true, assignments });
  } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});





router.patch('/update-due-date/:id', authenticateToken, async (req, res) => {
  const { due_date } = req.body;
  const { id } = req.params;

  try {
      // Update due date in the database
      const updateQuery = `
          UPDATE postassg
          SET due_date = $1
          WHERE id = $2
          RETURNING *;
      `;
      const updatedAssignment = await client.query(updateQuery, [due_date, id]);

      // Check if the assignment was updated successfully
      if (updatedAssignment.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Assignment not found' });
      }

      res.status(200).json({ success: true, message: 'Due date updated successfully', assignment: updatedAssignment.rows[0] });
  } catch (error) {
      console.error('Error updating due date:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.patch('/update-assignment-title/:id', authenticateToken, async (req, res) => {
  const { assignment_title } = req.body;
  const { id } = req.params;

  try {
      const updateQuery = `
          UPDATE postassg
          SET assignment_title = $1
          WHERE id = $2
          RETURNING *;
      `;
      const updatedAssignment = await client.query(updateQuery, [assignment_title, id]);

      if (updatedAssignment.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Assignment not found' });
      }

      res.status(200).json({ success: true, message: 'Assignment title updated successfully', assignment: updatedAssignment.rows[0] });
  } catch (error) {
      console.error('Error updating assignment title:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
router.patch('/update-assignment-description/:id', authenticateToken, async (req, res) => {
  const { assignment_description } = req.body;
  const { id } = req.params;

  try {
      const updateQuery = `
          UPDATE postassg
          SET assignment_description = $1
          WHERE id = $2
          RETURNING *;
      `;
      const updatedAssignment = await client.query(updateQuery, [assignment_description, id]);

      if (updatedAssignment.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Assignment not found' });
      }

      res.status(200).json({ success: true, message: 'Assignment description updated successfully', assignment: updatedAssignment.rows[0] });
  } catch (error) {
      console.error('Error updating assignment description:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
router.patch('/update-classandsection/:id', authenticateToken, async (req, res) => {
  const { classandsection } = req.body;
  const { id } = req.params;

  try {
      const updateQuery = `
          UPDATE postassg
          SET classandsection = $1
          WHERE id = $2
          RETURNING *;
      `;
      const updatedAssignment = await client.query(updateQuery, [classandsection, id]);

      if (updatedAssignment.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Assignment not found' });
      }

      res.status(200).json({ success: true, message: 'Class and section updated successfully', assignment: updatedAssignment.rows[0] });
  } catch (error) {
      console.error('Error updating class and section:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
router.patch('/update-attachments-link/:id', authenticateToken, async (req, res) => {
  const { attachments_link } = req.body;
  const { id } = req.params;

  try {
      const updateQuery = `
          UPDATE postassg
          SET attachments_link = $1
          WHERE id = $2
          RETURNING *;
      `;
      const updatedAssignment = await client.query(updateQuery, [attachments_link, id]);

      if (updatedAssignment.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Assignment not found' });
      }

      res.status(200).json({ success: true, message: 'Attachments link updated successfully', assignment: updatedAssignment.rows[0] });
  } catch (error) {
      console.error('Error updating attachments link:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
router.patch('/update-marks/:id', authenticateToken, async (req, res) => {
  const { marks } = req.body;
  const { id } = req.params;

  try {
      const updateQuery = `
          UPDATE postassg
          SET marks = $1
          WHERE id = $2
          RETURNING *;
      `;
      const updatedAssignment = await client.query(updateQuery, [marks, id]);

      if (updatedAssignment.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Assignment not found' });
      }

      res.status(200).json({ success: true, message: 'Marks updated successfully', assignment: updatedAssignment.rows[0] });
  } catch (error) {
      console.error('Error updating marks:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
router.patch('/update-total-students/:id', authenticateToken, async (req, res) => {
  const { total_students } = req.body;
  const { id } = req.params;

  try {
      const updateQuery = `
          UPDATE postassg
          SET total_students = $1
          WHERE id = $2
          RETURNING *;
      `;
      const updatedAssignment = await client.query(updateQuery, [total_students, id]);

      if (updatedAssignment.rows.length === 0) {
          return res.status(404).json({ success: false, error: 'Assignment not found' });
      }

      res.status(200).json({ success: true, message: 'Total students updated successfully', assignment: updatedAssignment.rows[0] });
  } catch (error) {
      console.error('Error updating total students:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

  
module.exports = router;
