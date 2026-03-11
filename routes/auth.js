const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, role, department, rollNo } = req.body;

    // Check if username exists
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      username,
      password,
      role: role || "student",
      department: department || null,
      rollNo: rollNo || null,
      approved: false
    });

    res.status(201).json({
      message: 'Registration submitted! Wait for admin approval.'
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});


// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const match = await user.comparePassword(password);

    if (!match) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    if (!user.approved) {
      return res.status(403).json({
        message: 'Your account is pending admin approval.'
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        department: user.department,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        department: user.department
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get pending users (admin)
router.get('/pending', auth, adminOnly, async (req, res) => {
  try {
    const pending = await User.find({ approved: false }).select('-password');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Approve user
router.put('/approve/:id', auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { approved: true });
    res.json({ message: 'User approved!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Reject user
router.delete('/reject/:id', auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User rejected.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;