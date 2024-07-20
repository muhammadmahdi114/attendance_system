import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const [profilePic, setProfilePic] = useState("");
    const [profileClick, setProfileClick] = useState(false);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveReason, setLeaveReason] = useState("");

    const navigate = useNavigate();
    const email = sessionStorage.getItem('email');

    useEffect(() => {
        setProfilePic(sessionStorage.getItem('profilePic'));
        fetchAttendanceRecords();
        fetchLeaveRequests();
    }, []);

    const fetchAttendanceRecords = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/attendance-records?email=${email}`);
            setAttendanceRecords(response.data.attendanceRecords);
        } catch (error) {
            console.error("Error fetching attendance records", error);
        }
    };

    const fetchLeaveRequests = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/leave-requests?email=${email}`);
            setLeaveRequests(response.data.leaveRequests);
        } catch (error) {
            console.error("Error fetching leave requests", error);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    const handleEditProfile = () => {
        navigate("/editProfile");
    };

    const handleProfileClick = () => {
        setProfileClick(!profileClick);
    };

    const handleClose = () => {
        setProfileClick(false);
    };

    const handleMarkAttendance = async () => {
        try {
            const response = await axios.post('http://localhost:8000/mark-attendance', { email });
            if (response.data.success) {
                alert('Attendance marked successfully!');
                setAttendanceMarked(true);
                fetchAttendanceRecords();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Error marking attendance", error);
        }
    };

    const handleSubmitLeaveRequest = async () => {
        try {
            const response = await axios.post('http://localhost:8000/submit-leave-request', { email, reason: leaveReason });
            if (response.data.success) {
                alert('Leave request submitted successfully!');
                setLeaveReason("");
                fetchLeaveRequests();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Error submitting leave request", error);
        }
    };

    return (
        <div className="w-full h-screen flex flex-col items-center bg-gradient-to-r from-blue-500 to-navy-800">
            <div className='flex flex-col justify-center items-center absolute top-5 right-1'>
                {profilePic && (
                    <img
                        src={profilePic}
                        alt="Profile"
                        className="rounded-full h-24 w-24"
                        onClick={handleProfileClick}
                    />
                )}
                {profileClick && (
                    <div className='w-28 flex flex-col items-center justify-center rounded-lg bg-gray-600 text-white'>
                        <ul>
                            <li>
                                <button className="hover:text-gray-400 my-1" onClick={handleEditProfile}>Edit Profile</button>
                            </li>
                            <li>
                                <button className="hover:text-gray-400 my-1" onClick={handleLogout}>Logout</button>
                            </li>
                            <li>
                                <button className="hover:text-gray-400 my-1" onClick={handleClose}>Close</button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            <div className="w-1/3 my-10 bg-white border-4 border-white rounded-lg p-9 flex flex-col justify-center items-center text-black">
                <h1 className="text-3xl mt-3">Dashboard</h1>
                <button
                    className="p-2 rounded text-center border-white mt-4 bg-blue-500 text-white h-12 w-full hover:bg-blue-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:shadow-outline"
                    onClick={handleMarkAttendance}
                    disabled={attendanceMarked}
                >
                    Mark Attendance
                </button>
                <div className="w-80 mt-10">
                    <input
                        type="text"
                        placeholder="Leave Reason"
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        className="h-8 border-b-2 border-gray-200 pl-5 w-full"
                    />
                    <button
                        className="p-2 rounded text-center border-white mt-4 bg-blue-500 text-white h-12 w-full hover:bg-blue-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:shadow-outline"
                        onClick={handleSubmitLeaveRequest}
                    >
                        Submit Leave Request
                    </button>
                </div>
                <h2 className="text-2xl mt-10">Attendance Records</h2>
                <ul>
                    {attendanceRecords.map(record => (
                        <li key={record._id}>{record.date}: {record.status}</li>
                    ))}
                </ul>
                <h2 className="text-2xl mt-10">Leave Requests</h2>
                <ul>
                    {leaveRequests.map(request => (
                        <li
                            key={request._id}
                            className={`mt-4 text-white px-4 py-2 flex flex-col items-left ${request.status === 'Approved' ? 'bg-green-500' : request.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}
                        >
                            {request.date}: {request.reason}
                        </li>
                    ))}

                </ul>
            </div>
        </div>
    );
}
