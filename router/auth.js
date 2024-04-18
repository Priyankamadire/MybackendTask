const dotenv = require('dotenv');

const client = require('../conn');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
dotenv.config({ path: '../config.env' });
const router = express.Router();
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const authenticateToken = require('../authenticateToken');

router.use(bodyParser.json());
client.connect();
console.log(process.env.SECRET_KEY);
const cors = require('cors');
const corsOptions = {
    origin: true, 
    credentials: true,  
  };
  
  // Apply CORS middleware with options
  router.use(cors(corsOptions));
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    const { name, username, email, phone, password, confirmpassword, Clgname, subject } = req.body;

    // Validate that all required fields are present
    if (!name || !username || !email || !phone || !password || !confirmpassword || !Clgname || !subject) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Check if password and confirmpassword match
    if (password !== confirmpassword) {
        return res.status(400).json({ success: false, error: 'Password and Confirm Password do not match' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Store the hashed password in the database
        const result = await client.query(
            'INSERT INTO users (name, username, email, phone, password, confirmpassword, Clgname, subject) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, username, email, phone, hashedPassword, confirmpassword, Clgname, subject]
        );
        res.status(201).json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Error registering user:', error.stack);
        // Check for specific error codes to provide appropriate error messages
        if (error.code === '23505') {
            return res.status(400).json({ success: false, error: 'Username or Email already exists' });
        }
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            // User exists, compare hashed password
            const user = result.rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                // Passwords match, generate JWT token
                const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
                
                // Store the current token in the user's database record
                await client.query('UPDATE users SET token = $1 WHERE id = $2', [token, user.id]);

                // Set the token in a cookie and send it in the response
                res.cookie('token', token, { httpOnly: true });
                res.status(200).json({ success: true, token: token });
             
            } else {
                // Passwords do not match
                res.status(401).json({ success: false, error: 'Invalid credentials' });
            }
        } else {
            // User not found
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});




router.get('/log-out', (req, res) => {
    res.clearCookie('token', { httpOnly: true }); // Clear the token cookie
    res.status(200).send("User logged out successfully");
});


  



router.get('/mydetails', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (result.rows.length > 0) {
            const userDetails = result.rows[0];
            // Remove sensitive information like password before sending the response
            delete userDetails.password;
            delete userDetails.confirmpassword;
            res.status(200).json({ success: true, user: userDetails });
            // console.log(userDetails);
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user details:', error.stack);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

   
module.exports = router;