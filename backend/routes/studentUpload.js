const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Course = require('../models/Course');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload/:courseId', authMiddleware, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ msg: 'Only faculty can upload student lists' });
  }

  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    if (!req.file) {
      return res.status(400).json({ msg: 'CSV file is required' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);
    const students = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => {
        const { name, email } = row;
        if (name && email) {
          students.push({ name: name.trim(), email: email.trim() });
        }
      })
      .on('end', async () => {
        const addedStudents = [];

        for (let s of students) {
          let student = await User.findOne({ email: s.email });

          if (!student) {
            student = new User({
              name: s.name,
              email: s.email,
              password: 'default123',
              role: 'student'
            });
            await student.save();
          }

          if (!course.registeredStudents.includes(student._id)) {
            course.registeredStudents.push(student._id);
            addedStudents.push({ id: student._id, name: student.name });
          }
        }

        await course.save();
        fs.unlinkSync(filePath);
        res.json({ msg: 'Students uploaded successfully', added: addedStudents });
      })
      .on('error', err => {
        fs.unlinkSync(filePath);
        console.error(err);
        res.status(500).json({ msg: 'Failed to parse CSV', error: err.message });
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
