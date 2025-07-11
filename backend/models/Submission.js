const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // role: 'student'
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  filePath: { type: String, required: true }, // path to uploaded file
  uploadTime: { type: Date, default: Date.now },
  similarityScore: { type: Number, default: 0 }, // 0 to 100
  isFlagged: { type: Boolean, default: false } // optional: true if similarityScore > threshold
});

module.exports = mongoose.model('Submission', submissionSchema);
