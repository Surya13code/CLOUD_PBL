// server.js - Node.js Backend for Lifeline Ledger
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// AWS Configuration
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});

const sns = new AWS.SNS();
const ses = new AWS.SES();

// Database Configuration (AWS RDS)
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Send Email Notification via AWS SES
async function sendEmailNotification(toEmail, subject, body) {
  const params = {
    Source: process.env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [toEmail]
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: body }
      }
    }
  };

  try {
    await ses.sendEmail(params).promise();
    console.log('Email sent successfully to:', toEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// ==================== ROUTES ====================

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Lifeline Ledger API is running' });
});

// ==================== DONOR ROUTES ====================

// Donor Registration
app.post('/api/donor/register', async (req, res) => {
  try {
    const { name, email, password, bloodType, phone } = req.body;

    // Check if donor already exists
    const [existing] = await pool.query('SELECT * FROM donors WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique donor ID
    const donorId = `D${Date.now().toString().slice(-6)}`;

    // Insert donor
    await pool.query(
      'INSERT INTO donors (donor_id, name, email, password, blood_type, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [donorId, name, email, hashedPassword, bloodType, phone]
    );

    res.status(201).json({ 
      message: 'Donor registered successfully', 
      donorId 
    });
  } catch (error) {
    console.error('Error registering donor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Donor Login
app.post('/api/donor/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [donors] = await pool.query('SELECT * FROM donors WHERE email = ?', [email]);

    if (donors.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const donor = donors[0];
    const validPassword = await bcrypt.compare(password, donor.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: donor.id, donorId: donor.donor_id, type: 'donor' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      donor: {
        id: donor.donor_id,
        name: donor.name,
        email: donor.email,
        bloodType: donor.blood_type
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Donor Dashboard Data
app.get('/api/donor/dashboard', authenticateToken, async (req, res) => {
  try {
    const { donorId } = req.user;

    // Get all donations for this donor
    const [donations] = await pool.query(
      'SELECT * FROM donations WHERE donor_id = ? ORDER BY donation_date DESC',
      [donorId]
    );

    // Get statistics
    const totalDonations = donations.length;
    const usedCount = donations.filter(d => d.status === 'used').length;
    const availableCount = donations.filter(d => d.status === 'available').length;

    res.json({
      statistics: {
        totalDonations,
        usedCount,
        availableCount
      },
      donations
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== HOSPITAL ROUTES ====================

// Hospital Registration
app.post('/api/hospital/register', async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    const [existing] = await pool.query('SELECT * FROM hospitals WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hospitalId = `H${Date.now().toString().slice(-6)}`;

    await pool.query(
      'INSERT INTO hospitals (hospital_id, name, email, password, address, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [hospitalId, name, email, hashedPassword, address, phone]
    );

    res.status(201).json({ 
      message: 'Hospital registered successfully', 
      hospitalId 
    });
  } catch (error) {
    console.error('Error registering hospital:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Hospital Login
app.post('/api/hospital/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [hospitals] = await pool.query('SELECT * FROM hospitals WHERE email = ?', [email]);

    if (hospitals.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const hospital = hospitals[0];
    const validPassword = await bcrypt.compare(password, hospital.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: hospital.id, hospitalId: hospital.hospital_id, type: 'hospital' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      hospital: {
        id: hospital.hospital_id,
        name: hospital.name,
        email: hospital.email
      }
    });
  } catch (error) {
    console.error('Error during hospital login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record New Donation
app.post('/api/hospital/donation', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { donorId, bloodType, quantity } = req.body;

    // Verify donor exists
    const [donors] = await pool.query('SELECT * FROM donors WHERE donor_id = ?', [donorId]);
    
    if (donors.length === 0) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    const donationId = `DON${Date.now().toString().slice(-8)}`;
    const donationDate = new Date().toISOString().split('T')[0];

    await pool.query(
      'INSERT INTO donations (donation_id, donor_id, blood_type, quantity, donation_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [donationId, donorId, bloodType, quantity, donationDate, 'available']
    );

    // Send notification to donor
    const donor = donors[0];
    await sendEmailNotification(
      donor.email,
      'Blood Donation Recorded',
      `<h2>Thank You for Your Donation!</h2>
       <p>Dear ${donor.name},</p>
       <p>Your blood donation has been successfully recorded.</p>
       <p><strong>Donation ID:</strong> ${donationId}</p>
       <p><strong>Blood Type:</strong> ${bloodType}</p>
       <p><strong>Quantity:</strong> ${quantity}</p>
       <p>We will notify you when your blood is utilized.</p>
       <p>Thank you for saving lives!</p>`
    );

    res.status(201).json({ 
      message: 'Donation recorded successfully', 
      donationId 
    });
  } catch (error) {
    console.error('Error recording donation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Donation Utilization
app.put('/api/hospital/donation/:donationId/utilize', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { donationId } = req.params;
    const { purpose } = req.body;

    // Get donation details
    const [donations] = await pool.query(
      'SELECT d.*, don.name, don.email FROM donations d JOIN donors don ON d.donor_id = don.donor_id WHERE d.donation_id = ?',
      [donationId]
    );

    if (donations.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const donation = donations[0];

    if (donation.status === 'used') {
      return res.status(400).json({ error: 'Donation already utilized' });
    }

    // Get hospital details
    const [hospitals] = await pool.query(
      'SELECT * FROM hospitals WHERE hospital_id = ?',
      [req.user.hospitalId]
    );

    const hospital = hospitals[0];
    const usedDate = new Date().toISOString().split('T')[0];

    // Update donation status
    await pool.query(
      'UPDATE donations SET status = ?, used_date = ?, used_by = ?, purpose = ? WHERE donation_id = ?',
      ['used', usedDate, hospital.name, purpose, donationId]
    );

    // Send notification to donor
    await sendEmailNotification(
      donation.email,
      'Your Blood Donation Has Saved a Life!',
      `<h2>Your Donation Made a Difference!</h2>
       <p>Dear ${donation.name},</p>
       <p>We're excited to inform you that your blood donation has been utilized.</p>
       <p><strong>Donation ID:</strong> ${donationId}</p>
       <p><strong>Used Date:</strong> ${usedDate}</p>
       <p><strong>Used By:</strong> ${hospital.name}</p>
       <p><strong>Purpose:</strong> ${purpose}</p>
       <p>Thank you for your invaluable contribution to saving lives!</p>`
    );

    res.json({ 
      message: 'Donation utilization updated successfully',
      notification: 'Donor has been notified'
    });
  } catch (error) {
    console.error('Error updating utilization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Hospital Dashboard Data
app.get('/api/hospital/dashboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all donations
    const [donations] = await pool.query(
      'SELECT d.*, don.name as donor_name FROM donations d JOIN donors don ON d.donor_id = don.donor_id ORDER BY d.donation_date DESC'
    );

    const totalBloodUnits = donations.length;
    const availableUnits = donations.filter(d => d.status === 'available').length;
    const utilizedUnits = donations.filter(d => d.status === 'used').length;

    res.json({
      statistics: {
        totalBloodUnits,
        availableUnits,
        utilizedUnits
      },
      donations
    });
  } catch (error) {
    console.error('Error fetching hospital dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Available Donations
app.get('/api/hospital/available-donations', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'hospital') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [donations] = await pool.query(
      'SELECT d.*, don.name as donor_name FROM donations d JOIN donors don ON d.donor_id = don.donor_id WHERE d.status = ? ORDER BY d.donation_date DESC',
      ['available']
    );

    res.json({ donations });
  } catch (error) {
    console.error('Error fetching available donations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get("/", (req, res) => {
  res.json({ message: "Backend connected successfully!" });
});


// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`✅ Lifeline Ledger API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});