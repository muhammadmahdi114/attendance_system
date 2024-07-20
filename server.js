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
const GradingCriteriaSchema = require("./src/models/Grade");

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

app.get('/admin/attendance-records', async (req, res) => {
  try {
    const attendanceRecords = await AttendanceSchema.find();
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

app.get('/admin/leave-requests', async (req, res) => {
  try {
    const leaveRequests = await LeaveRequestSchema.find();
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests' });
  }
});

app.post('/admin/attendance-records', async (req, res) => {
  const { email, date, status } = req.body;
  try {
    const newRecord = new AttendanceSchema({ email, date, status });
    await newRecord.save();
    res.status(201).json({ success: true, message: 'Attendance record created successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating attendance record' });
  }
});

app.put('/admin/attendance-records/:id', async (req, res) => {
  const { id } = req.params;
  const { date, status } = req.body;
  try {
    await AttendanceSchema.findByIdAndUpdate(id, { date, status }, { new: true });
    res.json({ success: true, message: 'Attendance record updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating attendance record' });
  }
});

app.delete('/admin/attendance-records/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await AttendanceSchema.findByIdAndDelete(id);
    res.json({ success: true, message: 'Attendance record deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting attendance record' });
  }
});

app.get('/admin/grading-criteria', async (req, res) => {
  try {
    const criteria = await GradingCriteriaSchema.find();
    res.status(200).json(criteria);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grading criteria' });
  }
});

app.post('/admin/grading-criteria', async (req, res) => {
  const { name, value } = req.body;
  try {
    const newCriteria = new GradingCriteriaSchema({ name, value });
    await newCriteria.save();
    res.status(201).json({ success: true, message: 'Grading criteria added successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding grading criteria' });
  }
});

app.put('/admin/grading-criteria/:id', async (req, res) => {
  const { id } = req.params;
  const { name, value } = req.body;
  try {
    await GradingCriteriaSchema.findByIdAndUpdate(id, { name, value }, { new: true });
    res.json({ success: true, message: 'Grading criteria updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating grading criteria' });
  }
});

app.delete('/admin/grading-criteria/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await GradingCriteriaSchema.findByIdAndDelete(id);
    res.json({ success: true, message: 'Grading criteria deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting grading criteria' });
  }
});

app.get('/admin/report/system', async (req, res) => {
  try {
    const attendance = await AttendanceSchema.aggregate([
      {
        $group: {
          _id: "$email",
          totalDays: { $sum: 1 },
          presentDays: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "email",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 0,
          email: "$_id",
          name: "$user.name",
          totalDays: 1,
          presentDays: 1
        }
      }
    ]);
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating system report' });
  }
});


app.get('/admin/report/user', async (req, res) => {
  const { email } = req.query;
  try {
    const attendance = await AttendanceSchema.find({ email });
    const user = await UserSchema.findOne({ email });
    if (user) {
      res.json({ success: true, user, attendance });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating user report' });
  }
});


app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
