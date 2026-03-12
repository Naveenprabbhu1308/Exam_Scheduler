const router  = require('express').Router();
const Student = require('../models/Student');
const { auth, adminOnly, staffOrAdmin } = require('../middleware/auth');

// GET all students — staff sees only their dept, admin sees all
router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'staff' ? { department: req.user.department } : {};
    const students = await Student.find(filter).sort({ rollNo: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET top students — staff sees only their dept, admin sees all
router.get('/top', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'staff' ? { department: req.user.department } : {};
    const students = await Student.find(filter).sort({ score: -1 }).limit(10);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET student by id
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create student — staff or admin
router.post('/', auth, staffOrAdmin, async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update student — staff or admin
router.put('/:id', auth, staffOrAdmin, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE student — staff or admin
router.delete('/:id', auth, staffOrAdmin, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;