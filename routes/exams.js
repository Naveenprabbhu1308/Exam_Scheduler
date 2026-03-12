const router  = require('express').Router();
const Exam    = require('../models/Exam');
const Hall    = require('../models/Hall');
const Student = require('../models/Student');
const { auth, adminOnly, staffOrAdmin } = require('../middleware/auth');

// Generate 30 seat labels A1–F5 per hall
const generateSeats = () => {
  const rows = ['A','B','C','D','E','F'];
  const cols = [1,2,3,4,5];
  const seats = [];
  rows.forEach((r) => cols.forEach((c) => seats.push(`${r}${c}`)));
  return seats;
};

// GET all exams — authenticated users
router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find().populate('hallIds').sort({ date: 1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET exam by id
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('hallIds');
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST schedule exam — admin OR staff
// Staff: seats assigned only for their department students
// Admin: seats assigned for all students
router.post('/', auth, staffOrAdmin, async (req, res) => {
  try {
    const { subject, date, time, hallIds } = req.body;

    if (!subject || !date || !time || !hallIds || hallIds.length === 0) {
      return res.status(400).json({ message: 'subject, date, time and at least one hall are required.' });
    }

    const halls      = await Hall.find({ _id: { $in: hallIds } });
    const seatLabels = generateSeats();

    // Staff → only their dept; Admin → all students
    const filter = req.user.role === 'staff' ? { department: req.user.department } : {};
    const students = await Student.find(filter).sort({ rollNo: 1 });

    const seats = [];
    let studentIdx = 0;

    for (const hall of halls) {
      for (let i = 0; i < seatLabels.length; i++) {
        if (studentIdx >= students.length) break;
        const student = students[studentIdx];
        seats.push({
          studentId: student._id,
          rollNo:    student.rollNo,
          name:      student.name,
          hallId:    hall._id,
          hallName:  hall.name,
          seat:      seatLabels[i],
        });
        studentIdx++;
      }
      if (studentIdx >= students.length) break;
    }

    const exam = await Exam.create({ subject, date, time, hallIds, seats });
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE exam — admin or staff
router.delete('/:id', auth, staffOrAdmin, async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;