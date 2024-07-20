import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradingCriteria, setGradingCriteria] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [formMode, setFormMode] = useState('add'); // add or update
  const [currentRecord, setCurrentRecord] = useState(null); // for update
  const [formData, setFormData] = useState({email: '', date: '', status: '' });
  const name = sessionStorage.getItem('name');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchLeaveRequests();
    fetchGradingCriteria();
  }, []);
  
  useEffect(() => {
    setFormData({email: selectedStudent, date: '', status: ''});
  }, [selectedStudent]);

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
      const response = await axios.get('http://localhost:8000/admin/leave-requests');
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Error fetching leave requests', error);
    }
  };

  const fetchGradingCriteria = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/grading-criteria');
      setGradingCriteria(response.data);
    } catch (error) {
      console.error('Error fetching grading criteria', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/attendance-records');
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching attendance records', error);
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

  const generateUserReport = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8000/admin/report/user?email=${email}`);
      const userReport = response;
      console.log(userReport);
    } catch (error) {
      console.error('Error generating user report', error);
    }
  };

  const generateSystemReport = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/report/system');
      const systemReport = response;
      console.log(systemReport);
    } catch (error) {
      console.error('Error generating system report', error);
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
    setFormMode('add');
    setCurrentRecord(null);
    setFormData({ date: '', status: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = async () => {
    try {
      await axios.post('http://localhost:8000/admin/attendance-records', formData);
      fetchAttendanceRecords();
      closePopup();
    } catch (error) {
      console.error('Error adding attendance record', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8000/admin/attendance-records/${currentRecord._id}`, formData);
      fetchAttendanceRecords();
      closePopup();
    } catch (error) {
      console.error('Error updating attendance record', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/admin/attendance-records/${id}`);
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error deleting attendance record', error);
    }
  };
  
  const deleteGradingCriteria = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/admin/grading-criteria/${id}`)
      alert("Grading criteria Deleted.")
    } catch (error) {
      console.log("Error deleting Grading criteria", error)
    }
  }
  const updateGradingCriteria = async (id) => {
    try {
      await axios.put(`http://localhost:8000/admin/grading-criteria/${id}`)
      alert("Grading criteria Updated.")
    } catch (error) {
      console.log("Error updating Grading criteria", error)
    }
  }
  const addGradingCriteria = async (id) => {
    try {
      await axios.post(`http://localhost:8000/admin/grading-criteria/${id}`)
      alert("Grading criteria Added.")
    } catch (error) {
      console.log("Error adding Grading criteria", error)
    }
  }

  const addOrUpdateAttendanceRecord = () => {
    if (formMode === 'add') {
      handleAdd();
    } else if (formMode === 'update') {
      handleUpdate();
    }
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
                <li key={record._id} className="mb-2 flex justify-between items-center">
                  <span>Date: {record.date}, Status: {record.status}</span>
                  <div>
                    <button
                      onClick={() => {
                        setFormMode('update');
                        setCurrentRecord(record);
                        setFormData({ date: record.date, status: record.status });
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 transition mr-2"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(record._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="border border-gray-300 p-2 rounded mb-2 w-full"
              />
              <input
                type="text"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="border border-gray-300 p-2 rounded mb-4 w-full"
                placeholder="Status"
              />
              <button
                onClick={addOrUpdateAttendanceRecord}
                className={`bg-${formMode === 'add' ? 'green' : 'blue'}-500 text-white px-4 py-2 rounded hover:bg-${formMode === 'add' ? 'green' : 'blue'}-700 transition`}
              >
                {formMode === 'add' ? 'Add Attendance Record' : 'Update Attendance Record'}
              </button>
            </div>

            <button
              onClick={closePopup}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="w-4/5 bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Grading Criteria</h2>
        <ul>
          {gradingCriteria.map(criteria => (
            <li key={criteria._id} className="flex justify-between items-center mb-2">
              <span>{criteria.name} - {criteria.value}</span>
              <button
                onClick={() => updateGradingCriteria(criteria._id, criteria)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Edit
              </button>
              <button
                onClick={() => deleteGradingCriteria(criteria._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={() => addGradingCriteria({ name: 'New Criteria', value: 0 })}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Add Grading Criteria
        </button>
      </div>

      <div className="w-4/5 bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Generate Reports</h2>
        <button
          onClick={() => generateSystemReport()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Generate System Report
        </button>
        <button
          onClick={() => generateUserReport(selectedStudent)}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Generate User Report
        </button>
      </div>
    </div>
  );
}
