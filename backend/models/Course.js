const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
});

module.exports = mongoose.model('Course', courseSchema);
