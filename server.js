const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UserSchema = require("./src/models/User");
const AttendanceSchema = require("./src/models/Attendance");
const LeaveRequestSchema = require("./src/models/LeaveRequest");

const app = express();
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/profile-pics';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

mongoose.connect("mongodb+srv://mahdimuhammad116:eqWRPyzc60Jiii8t@attendancesystem.m0sxk3u.mongodb.net/attendanceSystem?retryWrites=true&w=majority")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((error) => {
    console.error('Connection error:', error);
  });

app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: "Password is required" });
  }

  try {
    const user = await UserSchema.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      if (role && user.role !== role) {
        return res.status(403).json({ success: false, message: "Login in your portal!" });
      }

      return res.status(200).json({
        success: true,
        username: user.name,
        email: user.email,
        age: user.age,
        profilePic: user.profilePic,
        role: user.role
      });
    } else {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/signup", upload.single('profilePic'), async (req, res) => {
  const { name, email, password, age } = req.body;
  const role = 'user';
  const profilePic = req.file ? `/uploads/profile-pics/${req.file.filename}` : null;

  try {
    const check = await UserSchema.findOne({ email: email });

    if (check) {
      return res.status(409).json({ success: false, message: "User already exists" });
    } else {
      const EncPassword = await bcrypt.hash(password, 10);
      const user = await UserSchema.create({
        name,
        email,
        password: EncPassword,
        age,
        role,
        profilePic,
      });
      return res.status(201).json({ success: true, user });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post('/update-profile', upload.single('profilePic'), async (req, res) => {
  const { name, email, age } = req.body;
  const profilePic = req.file ? `/uploads/profile-pics/${req.file.filename}` : null;

  let updateData = { name, age };
  if (profilePic) {
    updateData.profilePic = profilePic;
  }

  try {
    const user = await UserSchema.findOneAndUpdate({ email }, updateData, { new: true });
    if (user) {
      const { name, age, profilePic } = user;
      console.log({user: {name, age, profilePic}})
      res.json({ success: true, message: 'Profile updated successfully!', user: { name, age, profilePic } });
    } else {
      res.json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Error occurred while updating profile' });
  }
});

app.post('/mark-attendance', async (req, res) => {
  const { email } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const existingRecord = await AttendanceSchema.findOne({ email, date: today });
    if (existingRecord) {
      return res.json({ success: false, message: 'Attendance already marked for today' });
    }

    const attendance = new AttendanceSchema({ email, date: today, status: 'Present' });
    await attendance.save();
    res.json({ success: true, message: 'Attendance marked successfully!' });
  } catch (error) {
    res.json({ success: false, message: 'Error marking attendance' });
  }
});

app.post('/submit-leave-request', async (req, res) => {
  const { email, reason } = req.body;
  try {
    const leaveRequest = new LeaveRequestSchema({ email, reason, status: 'Pending' });
    await leaveRequest.save();
    res.json({ success: true, message: 'Leave request submitted successfully!' });
  } catch (error) {
    res.json({ success: false, message: 'Error submitting leave request' });
  }
});

app.get('/attendance-records', async (req, res) => {
  const { email } = req.query;
  try {
    const attendanceRecords = await AttendanceSchema.find({ email });
    res.json({ attendanceRecords });
  } catch (error) {
    res.json({ attendanceRecords: [] });
  }
});

app.get('/leave-requests', async (req, res) => {
  const { email } = req.query;
  try {
    const leaveRequests = await LeaveRequestSchema.find({ email });
    res.json({ leaveRequests });
  } catch (error) {
    res.json({ leaveRequests: [] });
  }
});

app.post('/approve-leave-request', async (req, res) => {
  const { id } = req.body;
  try {
    await LeaveRequestSchema.findByIdAndUpdate(id, { status: 'Approved' });
    res.json({ success: true, message: 'Leave request approved!' });
  } catch (error) {
    res.json({ success: false, message: 'Error approving leave request' });
  }
});

app.post('/reject-leave-request', async (req, res) => {
  const { id } = req.body;
  try {
    await LeaveRequestSchema.findByIdAndUpdate(id, { status: 'Rejected' });
    res.json({ success: true, message: 'Leave request rejected!' });
  } catch (error) {
    res.json({ success: false, message: 'Error rejecting leave request' });
  }
});

app.get('/admin/students', async (req, res) => {
  try {
    const students = await UserSchema.find({ role: 'user' });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

app.get('/admin/attendance', async (req, res) => {
  try {
    const attendance = await AttendanceSchema.find();
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

app.get('/admin/leaverequests', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequestSchema.find();
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests' });
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
