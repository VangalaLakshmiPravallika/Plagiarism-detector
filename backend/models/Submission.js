const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course: String,
  filePath: String,
  uploadTime: Date,
  similarityScore: Number,
  similarToStudentName: String 
});

module.exports = mongoose.model('Submission', SubmissionSchema);
