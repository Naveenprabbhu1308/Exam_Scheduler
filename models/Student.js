const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  rollNo:     { type: String, required: true, unique: true },
  email:      { type: String },
  score:      { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  maxMarks:   { type: Number, default: 0 },
  department: {
    type: String,
    enum: ['CSE', 'IT', 'ECE', 'MECH', 'BIOTECH', 'MECHATRONICS', 'MECHANICAL'],
    default: null
  },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);