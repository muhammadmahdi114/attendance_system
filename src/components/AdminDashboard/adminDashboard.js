import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const name = sessionStorage.getItem('name');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchLeaveRequests();
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students', error);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/leaverequests');
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Error fetching leave requests', error);
    }
  };

  const approveLeaveRequest = async (id) => {
    try {
      await axios.post('http://localhost:8000/approve-leave-request', { id });
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error approving leave request', error);
    }
  };

  const rejectLeaveRequest = async (id) => {
    try {
      await axios.post('http://localhost:8000/reject-leave-request', { id });
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error rejecting leave request', error);
    }
  };

  const viewAttendance = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8000/attendance-records?email=${email}`);
      setAttendanceRecords(response.data.attendanceRecords);
      setSelectedStudent(email);
      setShowPopup(true);
    } catch (error) {
      console.error('Error fetching attendance records', error);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setAttendanceRecords([]);
    setSelectedStudent(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard: {name}</h1>
      <div className='absolute top-10 right-5'>
        <button onClick={handleLogout} className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition'>Logout</button>
      </div>
      <div className="w-4/5 bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Students</h2>
        <ul>
          {students.map(student => (
            <li key={student._id} className="flex justify-between items-center mb-2">
              <span>{student.name} - {student.email}</span>
              <button
                onClick={() => viewAttendance(student.email)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                View Attendance
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-4/5 bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Leave Requests</h2>
        <ul>
          {leaveRequests.map(request => (
            <li key={request._id} className="flex justify-between items-center mb-5">
              <span>{request.email} - {request.reason}</span>
              <div>
                {request.status === 'Pending' ? (
                  <>
                    <button
                      onClick={() => approveLeaveRequest(request._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectLeaveRequest(request._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className={`text-white px-4 py-2 rounded ${request.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {request.status === 'Approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white rounded-lg p-6 w-1/2">
            <h2 className="text-2xl font-semibold mb-4">Attendance Records for {selectedStudent}</h2>
            <ul>
              {attendanceRecords.map(record => (
                <li key={record._id} className="mb-2">
                  Date: {record.date}, Status: {record.status}
                </li>
              ))}
            </ul>
            <button
              onClick={closePopup}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
