const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const studentUploadRoutes = require('./routes/studentUpload');
console.log('studentUploadRoutes is:', typeof studentUploadRoutes);
console.log('studentUploadRoutes =', studentUploadRoutes);

app.use('/api/students', studentUploadRoutes); // ✅ keep only this

// Comment these out:
 const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const submissionRoutes = require('./routes/submission');
app.use('/api/submissions', submissionRoutes);

const courseRoutes = require('./routes/course');
app.use('/api/courses', courseRoutes);

const assignmentRoutes = require('./routes/assignment');
app.use('/api/assignments', assignmentRoutes);

const facultyRoutes = require('./routes/faculty');
app.use('/api/faculty', facultyRoutes); 


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
