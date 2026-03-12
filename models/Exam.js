const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  rollNo:    { type: String },
  name:      { type: String },
  hallId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Hall' },
  hallName:  { type: String },
  seat:      { type: String },
}, { _id: false });

const examSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  date:    { type: String, required: true },
  time:    { type: String, required: true },
  hallIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hall' }],
  seats:   [seatSchema],
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);