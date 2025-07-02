const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Submission = require('../models/Submission');
const { compareSimilarity } = require('../utils/plagiarismChecker');
const mongoose = require('mongoose');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { studentId, course } = req.body;
    const file = req.file;

    if (!studentId || !course || !file) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const newPath = path.join('uploads', file.filename);

    // Fetch previous submissions from OTHER students in the same course
    const existing = await Submission.find({
      course,
      student: { $ne: studentId }
    }).populate('student');

    const compareFiles = existing.map(sub => ({
  path: sub.filePath,
  studentId: sub.student._id,
  studentName: sub.student.name,
  uploadTime: sub.uploadTime // Include upload time here
}));

    let similarityScore = 0;
    let bestMatch = null;

    if (compareFiles.length > 0) {
      const results = await compareSimilarity(newPath, compareFiles);
      bestMatch = results[0]; // highest match
      similarityScore = bestMatch.similarity;
    }

    // Save the submission
    const submission = new Submission({
  student: studentId,
  course,
  filePath: newPath,
  uploadTime: new Date(),
  similarityScore,
  similarToStudentName: bestMatch?.studentName || null // ✅ NEW FIELD
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

// Add this route to return similarity report for a specific student
router.get('/similarity/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    // Get submissions by this student
    const studentSubmissions = await Submission.find({ student: studentId });

    const comparisons = [];

    for (let sub of studentSubmissions) {
      const existing = await Submission.find({
        course: sub.course,
        student: { $ne: studentId }
      }).populate('student');

      const compareFiles = existing.map(e => ({
        path: e.filePath,
        studentId: e.student._id,
        studentName: e.student.name,
        uploadTime: e.uploadTime,
        course: e.course
      }));

      if (compareFiles.length > 0) {
        const results = await compareSimilarity(sub.filePath, compareFiles);

        results.forEach(result => {
          comparisons.push({
            name: result.studentName,
            similarity: result.similarity * 100, // Convert to percentage
            uploadTime: result.uploadTime,
            course: result.course
          });
        });
      }
    }

    // Sort by similarity descending
    comparisons.sort((a, b) => b.similarity - a.similarity);

    res.json({ comparisons });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to calculate similarity" });
  }
});


router.get('/courses', async (req, res) => {
  try {
    const courses = await Submission.distinct('course');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch courses' });
  }
});

// Get students for a course
router.get('/students/:course', async (req, res) => {
  try {
    const course = req.params.course;
    const students = await Submission.find({ course }).populate('student');
    
    const uniqueStudents = [];
    const seen = new Set();
    for (let sub of students) {
      if (!seen.has(sub.student._id.toString())) {
        seen.add(sub.student._id.toString());
        uniqueStudents.push({
          id: sub.student._id,
          name: sub.student.name
        });
      }
    }

    res.json(uniqueStudents);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch students' });
  }
});

module.exports = router;
router.get('/all', async (req, res) => {
  try {
    const submissions = await Submission.find().populate('student');
    res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ msg: 'Failed to fetch submissions' });
  }
});

