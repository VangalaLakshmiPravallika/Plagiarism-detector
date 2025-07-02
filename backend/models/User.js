const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['student', 'faculty'], required: true }
});

module.exports = mongoose.model('User', UserSchema);
