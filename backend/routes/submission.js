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

// ✅ Upload submission (student)
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const file = req.file;

    if (!assignmentId || !file) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

    const courseId = assignment.course;
    const studentId = req.user._id;
    const filePath = path.join('uploads', file.filename);

    // Fetch previous submissions from other students for this assignment
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
    return res.status(500).json({ msg: "Upload failed" });
  }
});

// ✅ Get all submissions
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

// ✅ Get similarity comparisons for a student (for faculty)
router.get('/similarity/:studentId', authMiddleware, async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.query;

  try {
    const studentSubmissions = await Submission.find({ student: studentId, course: courseId });

    const comparisons = [];

    for (let sub of studentSubmissions) {
      const others = await Submission.find({
        assignment: sub.assignment,
        student: { $ne: studentId }
      }).populate('student');

      const compareFiles = others.map(e => ({
        path: e.filePath,
        studentId: e.student._id,
        studentName: e.student.name,
        uploadTime: e.uploadTime
      }));

      if (compareFiles.length > 0) {
        const results = await compareSimilarity(sub.filePath, compareFiles);

        results.forEach(result => {
          comparisons.push({
            name: result.studentName,
            similarity: result.similarity * 100,
            uploadTime: result.uploadTime,
            assignment: sub.assignment
          });
        });
      }
    }

    return res.json({ comparisons });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Similarity check failed" });
  }
});

// ✅ Get unique list of students in a course (for dropdown)
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

// ✅ List all distinct courses in submissions
router.get('/courses', authMiddleware, async (req, res) => {
  try {
    const courseIds = await Submission.distinct('course');
    const courses = await Course.find({ _id: { $in: courseIds } });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch courses' });
  }
});

module.exports = router;
