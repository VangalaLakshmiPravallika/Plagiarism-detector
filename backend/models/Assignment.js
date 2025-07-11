const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  filePath: String,  
  submittedAt: { type: Date, default: Date.now },
  plagiarismScore: Number, 
  isFlagged: { type: Boolean, default: false } 
});

const AssignmentSchema = new mongoose.Schema({
  title: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, 
  deadline: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  submissions: [SubmissionSchema]
});
module.exports = mongoose.model('Assignment', AssignmentSchema);
