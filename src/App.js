import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, {useEffect} from "react";
import AdminDashboard from './components/AdminDashboard/adminDashboard';
import Dashboard from './components/Dashboard/dashboard';
import EditProfile from './components/EditProfile/editProfile';
import GradingSystem from './components/GradingSystem/gradingSystem';
import LeaveApprova from './components/LeaveApproval/leaveApproval';
import StudentLoginPage from './components/StudentLoginPage/studentLoginPage';
import FacultyLoginPage from './components/FacultyLoginPage/facultyLoginPage';
import ManageAttendance from './components/ManageAttendance/manageAttendance';
import MarkAttendance from './components/MarkAttendance/markAttendance';
import MarkLeave from './components/MarkLeave/markLeave';
import RegisterPage from './components/RegisterPage/registerPage';
import Reports from './components/Reports/reports';
import ViewAttendance from './components/ViewAttendance/viewAttendance';

function App() {
  useEffect(() => {
    document.title = 'Ezitech Institue';
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentLoginPage />} />
        <Route path="/facultyLoginPage" element={<FacultyLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/editProfile" element={<EditProfile />} />
        <Route path="/gradingSystem" element={<GradingSystem />} />
        <Route path="/leaveApproval" element={<LeaveApprova />} />
        <Route path="/manageAttendance" element={<ManageAttendance />} />
        <Route path="/markAttendance" element={<MarkAttendance />} />
        <Route path="/markLeave" element={<MarkLeave />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/viewAttendance" element={<ViewAttendance />} />
      </Routes>
    </Router>
  );
}

export default App;