const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const { compareSimilarity } = require('../utils/plagiarismChecker');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const file = req.file;

    if (!assignmentId || !file) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

    if (assignment.deadline && new Date() > assignment.deadline) {
      return res.status(400).json({ msg: 'Assignment deadline has passed' });
    }

    const courseId = assignment.course;
    const studentId = req.user._id;
    const filePath = path.join('uploads', file.filename);

    const existing = await Submission.find({
      assignment: assignmentId,
      student: { $ne: studentId }
    }).populate('student');

    const compareFiles = existing.map(sub => ({
      path: sub.filePath,
      studentId: sub.student._id,
      studentName: sub.student.name,
      uploadTime: sub.uploadTime
    }));

    let similarityScore = 0;
    let bestMatch = null;

    if (compareFiles.length > 0) {
      const results = await compareSimilarity(filePath, compareFiles);
      bestMatch = results[0];
      similarityScore = bestMatch.similarity;
    }

    const submission = new Submission({
      student: studentId,
      course: courseId,
      assignment: assignmentId,
      filePath,
      similarityScore,
      uploadTime: new Date()
    });

    await submission.save();

    return res.json({
      msg: "Assignment submitted with plagiarism check",
      score: similarityScore,
      matchedStudent: bestMatch?.studentName || null
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Upload failed", error: err.message });
  }
});

router.get('/all', authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('student', 'name email')
      .populate('assignment', 'title')
      .populate('course', 'courseCode courseName');
    res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ msg: 'Failed to fetch submissions' });
  }
});

router.get('/similarity/:studentId', authMiddleware, async (req, res) => {
  const { studentId } = req.params;
  const { assignmentId } = req.query;

  try {
    const studentSubmission = await Submission.findOne({
      student: studentId,
      assignment: assignmentId,
    });

    if (!studentSubmission) {
      return res.status(404).json({ msg: "No submission found for this student and assignment" });
    }

    const others = await Submission.find({
      assignment: assignmentId,
      student: { $ne: studentId }
    }).populate('student');

    const compareFiles = others.map(sub => ({
      path: sub.filePath,
      studentId: sub.student._id,
      studentName: sub.student.name,
      uploadTime: sub.uploadTime
    }));

    if (compareFiles.length === 0) {
      return res.json({ comparisons: [] });
    }

    const results = await compareSimilarity(studentSubmission.filePath, compareFiles);

    const comparisons = results.map(result => ({
      name: result.studentName,
      similarity: (result.similarity).toFixed(2),
      uploadTime: result.uploadTime
    }));

    return res.json({ comparisons });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Similarity check failed" });
  }
});

router.get('/students/:courseId', authMiddleware, async (req, res) => {
  try {
    const students = await Submission.find({ course: req.params.courseId }).populate('student');
    
    const uniqueStudents = [];
    const seen = new Set();

    for (let sub of students) {
      if (!seen.has(sub.student._id.toString())) {
        seen.add(sub.student._id.toString());
        uniqueStudents.push({ id: sub.student._id, name: sub.student.name });
      }
    }

    res.json(uniqueStudents);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch students' });
  }
});

router.get('/courses', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ msg: 'Only students can access this' });
    }

    const courses = await Course.find({ registeredStudents: req.user.id });

    res.json(courses); 
  } catch (err) {
    console.error('Error fetching student courses:', err);
    res.status(500).json({ msg: 'Failed to fetch courses' });
  }
});

router.get('/pending-submissions/:assignmentId', authMiddleware, async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const assignment = await Assignment.findById(assignmentId).populate('course');
    if (!assignment) {
      return res.status(404).json({ msg: "Assignment not found" });
    }

    const course = await Course.findById(assignment.course._id).populate('students');
    const allStudents = course.students;

    const submissions = await Submission.find({ assignment: assignmentId });
    const submittedStudentIds = submissions.map(sub => sub.student.toString());

    const now = new Date();

    const notSubmitted = [];
    const lateOrMissed = [];

    allStudents.forEach(student => {
      const hasSubmitted = submittedStudentIds.includes(student._id.toString());
      if (!hasSubmitted) {
        if (now > assignment.deadline) {
          lateOrMissed.push(student);
        } else {
          notSubmitted.push(student);
        }
      }
    });

    return res.json({
      notSubmitted,    
      missedDeadline: lateOrMissed,  
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to fetch pending submissions" });
  }
});

module.exports = router;
