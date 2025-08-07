const express = require('express');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-csv', authMiddleware, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'departmentHead') {
    return res.status(403).json({ msg: 'Only department heads can upload courses' });
  }

  if (!req.file) {
    return res.status(400).json({ msg: 'CSV file is required' });
  }

  const courses = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      const { courseCode, courseName, facultyEmail } = row;
      if (courseCode && courseName && facultyEmail) {
        courses.push({ courseCode, courseName, facultyEmail });
      }
    })
    .on('end', async () => {
      try {
        const insertedCourses = [];
        for (let c of courses) {
          const faculty = await require('../models/User').findOne({ email: c.facultyEmail, role: 'faculty' });
          if (!faculty) continue;

          const exists = await Course.findOne({ courseCode: c.courseCode });
          if (exists) continue;

          const newCourse = new Course({
            courseCode: c.courseCode,
            courseName: c.courseName,
            faculty: faculty._id,
            registeredStudents: []
          });
          await newCourse.save();
          insertedCourses.push(newCourse);
        }

        fs.unlinkSync(req.file.path); 
        res.json({ msg: 'Courses created', inserted: insertedCourses });
      } catch (err) {
        fs.unlinkSync(req.file.path);
        console.error(err);
        res.status(500).json({ msg: 'Failed to process CSV', error: err.message });
      }
    });
});

router.post('/create-course', authMiddleware, async (req, res) => {
  try {
    const { courseCode, courseName, facultyId } = req.body;

    if (req.user.role !== 'departmentHead') {
      return res.status(403).json({ msg: 'Only department heads can create courses' });
    }

    const exists = await Course.findOne({ courseCode });
    if (exists) return res.status(400).json({ msg: 'Course already exists' });

    const course = new Course({
      courseCode,
      courseName,
      faculty: facultyId,
      registeredStudents: []
    });

    await course.save();
    res.json({ msg: 'Course created', course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:courseId/assignments', async (req, res) => {
  const { courseId } = req.params;

  try {
    const assignments = await Assignment.find({ course: courseId }).populate('submissions.student', 'name email');
    res.json({ assignments });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/pending/:assignmentId', authMiddleware, async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const assignment = await Assignment.findById(assignmentId).populate('course');
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });

    const course = await Course.findById(assignment.course).populate('registeredStudents');
    const submissions = await Submission.find({ assignment: assignmentId });

    const submittedStudentIds = submissions.map(s => s.student.toString());
    const pendingStudents = course.registeredStudents.filter(
      student => !submittedStudentIds.includes(student._id.toString())
    );

    res.json({ pendingStudents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});
module.exports = router;
