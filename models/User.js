const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String },
  username: { type: String, required: true, unique: true },
  rollNo:   { type: String, default: null },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'staff', 'student'], default: 'student' },
  department: {
    type: String,
    enum: ['CSE', 'IT', 'ECE', 'MECH', 'BIOTECH', 'MECHATRONICS', 'MECHANICAL'],
    default: null
  },
  approved: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);