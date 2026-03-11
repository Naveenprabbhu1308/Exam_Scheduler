const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String },

  username: {
    type: String,
    required: true,
    unique: true
  },

  rollNo: { type: String },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['admin', 'staff', 'student'],
    default: 'student'
  },

  department: {
    type: String,
    enum: [
      'CSE',
      'IT',
      'ECE',
      'MECH',
      'BIOTECH',
      'MECHATRONICS'
    ],
    default: null
  },

  approved: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });


// Hash password before saving
userSchema.pre('save', async function (next) {

  if (!this.isModified('password')) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
  catch (err) {
    next(err);
  }
});


// Compare password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);