import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { styled } from '@mui/system';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  CloudUpload as CloudUploadIcon,
  AddCircle as AddCircleIcon,
  InsertChart as InsertChartIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const DashboardContainer = styled('div')({
  padding: '32px',
  maxWidth: '1400px',
  margin: '0 auto',
});

const SectionCard = styled(Card)({
  marginBottom: '24px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
  borderRadius: '12px',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px 0 rgba(0,0,0,0.16)',
  },
});

const ActionButton = styled(Button)({
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 16px',
  borderRadius: '8px',
  marginLeft: '12px',
});

const StyledTable = styled(Table)({
  '& .MuiTableCell-root': {
    padding: '12px 16px',
  },
});

const SimilarityCell = styled(TableCell)(({ similarity }) => ({
  fontWeight: 'bold',
  color: similarity > 70 ? '#f44336' : similarity > 40 ? '#ff9800' : '#4caf50',
}));

function FacultyDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [comparisonResults, setComparisonResults] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDeadline, setAssignmentDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API}/api/submissions/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSubmissions(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setAssignments([]);
      return;
    }

    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API}/api/courses/${selectedCourse}/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAssignments(res.data.assignments || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setAssignments([]);
        setLoading(false);
      });
  }, [selectedCourse]);

  const handleSelectCourse = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedAssignmentId('');
    setSelectedStudentId('');
    setComparisonResults([]);
  };

  const handleSelectStudent = async (studentId) => {
    setSelectedStudentId(studentId);
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API}/api/submissions/similarity/${studentId}?assignmentId=${selectedAssignmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComparisonResults(res.data.comparisons || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => setCsvFile(e.target.files[0]);

  const handleStudentUpload = async () => {
    if (!csvFile || !selectedCourse) return;

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('courseId', selectedCourse);

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/faculty/upload-students`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setLoading(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignmentTitle || !assignmentDeadline) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/assignments/create`,
        {
          title: assignmentTitle,
          courseId: selectedCourse,
          deadline: assignmentDeadline,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignmentTitle('');
      setAssignmentDeadline('');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const courses = Array.from(
    new Map(
      submissions
        .filter((s) => s.course && s.course._id)
        .map((s) => [s.course._id, s.course])
    ).values()
  );

  const studentsInAssignment = Array.from(
    new Map(
      submissions
        .filter(
          (s) =>
            s.course &&
            s.course._id === selectedCourse &&
            s.assignment &&
            s.assignment._id === selectedAssignmentId &&
            s.student
        )
        .map((s) => [s.student._id, s.student])
    ).values()
  );

  return (
    <ThemeProvider theme={theme}>
      <DashboardContainer>
        {loading && <LinearProgress color="primary" />}
        
        <Box display="flex" alignItems="center" mb={4}>
          <AssessmentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Faculty Dashboard
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SectionCard>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <SchoolIcon />
                  </Avatar>
                }
                title="Course Management"
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
              />
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id="course-select-label">Select Course</InputLabel>
                      <Select
                        labelId="course-select-label"
                        value={selectedCourse}
                        onChange={(e) => handleSelectCourse(e.target.value)}
                        label="Select Course"
                      >
                        <MenuItem value="">None</MenuItem>
                        {courses.map((c) => (
                          <MenuItem key={c._id} value={c._id}>
                            {c.courseCode} - {c.courseName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </SectionCard>
          </Grid>

          {selectedCourse && (
            <>
              <Grid item xs={12} md={6}>
                <SectionCard>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                        <CloudUploadIcon />
                      </Avatar>
                    }
                    title="Upload Student Roster"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Button
                        variant="contained"
                        component="label"
                        color="secondary"
                        startIcon={<CloudUploadIcon />}
                      >
                        Choose CSV
                        <input type="file" hidden accept=".csv" onChange={handleFileChange} />
                      </Button>
                      {csvFile && (
                        <Chip
                          label={csvFile.name}
                          onDelete={() => setCsvFile(null)}
                          sx={{ ml: 2 }}
                        />
                      )}
                      <ActionButton
                        variant="contained"
                        color="primary"
                        onClick={handleStudentUpload}
                        disabled={!csvFile}
                      >
                        Upload
                      </ActionButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Upload a CSV file with student information for this course.
                    </Typography>
                  </CardContent>
                </SectionCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <SectionCard>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: '#4caf50' }}>
                        <AddCircleIcon />
                      </Avatar>
                    }
                    title="Create New Assignment"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Assignment Title"
                          value={assignmentTitle}
                          onChange={(e) => setAssignmentTitle(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Deadline"
                          type="datetime-local"
                          InputLabelProps={{ shrink: true }}
                          value={assignmentDeadline}
                          onChange={(e) => setAssignmentDeadline(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <ActionButton
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={handleCreateAssignment}
                          disabled={!assignmentTitle || !assignmentDeadline}
                        >
                          Create
                        </ActionButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </SectionCard>
              </Grid>

              <Grid item xs={12}>
                <SectionCard>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: '#ff9800' }}>
                        <AssignmentIcon />
                      </Avatar>
                    }
                    title="Assignment Analysis"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel id="assignment-select-label">Select Assignment</InputLabel>
                          <Select
                            labelId="assignment-select-label"
                            value={selectedAssignmentId}
                            onChange={(e) => {
                              setSelectedAssignmentId(e.target.value);
                              setSelectedStudentId('');
                              setComparisonResults([]);
                            }}
                            label="Select Assignment"
                          >
                            <MenuItem value="">None</MenuItem>
                            {assignments.map((a) => (
                              <MenuItem key={a._id} value={a._id}>
                                {a.title} — Due: {new Date(a.deadline).toLocaleDateString()}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {selectedAssignmentId && (
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel id="student-select-label">Select Student</InputLabel>
                            <Select
                              labelId="student-select-label"
                              value={selectedStudentId}
                              onChange={(e) => handleSelectStudent(e.target.value)}
                              label="Select Student"
                            >
                              <MenuItem value="">None</MenuItem>
                              {studentsInAssignment.map((s) => (
                                <MenuItem key={s._id} value={s._id}>
                                  {s.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </SectionCard>
              </Grid>
            </>
          )}

          {comparisonResults.length > 0 && (
            <Grid item xs={12}>
              <SectionCard>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: '#9c27b0' }}>
                      <InsertChartIcon />
                    </Avatar>
                  }
                  title="Similarity Analysis Report"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                />
                <CardContent>
                  <TableContainer component={Paper} elevation={0}>
                    <StyledTable>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                          <TableCell><strong>Compared With</strong></TableCell>
                          <TableCell><strong>Similarity</strong></TableCell>
                          <TableCell><strong>Upload Time</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {comparisonResults.map((r, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>{r.name || 'N/A'}</TableCell>
                            <SimilarityCell similarity={r.similarity * 100}>
                              {(r.similarity * 100).toFixed(2)}%
                            </SimilarityCell>
                            <TableCell>
                              {new Date(r.uploadTime).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </StyledTable>
                  </TableContainer>
                </CardContent>
              </SectionCard>
            </Grid>
          )}

          {selectedStudentId && comparisonResults.length === 0 && (
            <Grid item xs={12}>
              <SectionCard>
                <CardContent>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    No similarity records found for the selected student.
                  </Typography>
                </CardContent>
              </SectionCard>
            </Grid>
          )}
        </Grid>
      </DashboardContainer>
    </ThemeProvider>
  );
}

export default FacultyDashboard;