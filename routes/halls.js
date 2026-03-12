const router = require('express').Router();
const Hall   = require('../models/Hall');
const { auth, adminOnly } = require('../middleware/auth');

// GET all halls — any authenticated user (staff needs this for scheduling)
router.get('/', auth, async (req, res) => {
  try {
    const halls = await Hall.find().sort({ name: 1 });
    res.json(halls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create hall — admin only
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const hall = await Hall.create(req.body);
    res.status(201).json(hall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update hall — admin only
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(hall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE hall — admin only
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Hall.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hall deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;