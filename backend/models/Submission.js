const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  filePath: { type: String, required: true }, 
  uploadTime: { type: Date, default: Date.now },
  similarityScore: { type: Number, default: 0 }, 
  isFlagged: { type: Boolean, default: false } 
});

module.exports = mongoose.model('Submission', submissionSchema);
