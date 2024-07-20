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
    const [hasLeaveRequestToday, setHasLeaveRequestToday] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const navigate = useNavigate();
    const email = sessionStorage.getItem('email');
    const name = sessionStorage.getItem('name');

    useEffect(() => {
        setProfilePic(sessionStorage.getItem('profilePic'));
        fetchAttendanceRecords();
        fetchLeaveRequests();
    }, []);

    const fetchAttendanceRecords = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/attendance-records?email=${email}`);
            setAttendanceRecords(response.data.attendanceRecords);
            checkAttendanceMarked(response.data.attendanceRecords);
        } catch (error) {
            console.error("Error fetching attendance records", error);
        }
    };

    const fetchLeaveRequests = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/leave-requests?email=${email}`);
            setLeaveRequests(response.data.leaveRequests);
            checkLeaveRequestToday(response.data.leaveRequests);
        } catch (error) {
            console.error("Error fetching leave requests", error);
        }
    };

    const checkAttendanceMarked = (records) => {
        const today = new Date().toISOString().split('T')[0];
        const marked = records.some(record => record.date === today);
        setAttendanceMarked(marked);
    };

    const checkLeaveRequestToday = (requests) => {
        const today = new Date().toISOString().split('T')[0];
        const hasRequestToday = requests.some(request => {
            const requestDate = new Date(request.date).toISOString().split('T')[0];
            return requestDate === today;
        });
        setHasLeaveRequestToday(hasRequestToday);
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
        if (hasLeaveRequestToday) {
            alert('Leave request for today already submitted.');
            return;
        }

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

    const viewAttendance = async (email) => {
        try {
            const response = await axios.get(`http://localhost:8000/attendance-records?email=${email}`);
            setAttendanceRecords(response.data.attendanceRecords);
            setShowPopup(true);
        } catch (error) {
            console.error('Error fetching attendance records', error);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
        setAttendanceRecords([]);
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
                                <span className='my-1'>{name}</span>
                            </li>
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
                {attendanceMarked ? (
                    <span className="p-2 rounded text-center border-white mt-4 bg-green-500 text-white h-12 w-full">Attendance Marked</span>
                ) : hasLeaveRequestToday ? (
                    <span className="p-2 rounded text-center border-white mt-4 bg-yellow-500 text-white h-12 w-full">Leave Requested</span>
                ) :
                    (
                        <button
                            className="p-2 rounded text-center border-white mt-4 bg-blue-500 text-white h-12 w-full hover:bg-blue-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:shadow-outline"
                            onClick={handleMarkAttendance}
                        >
                            Mark Attendance
                        </button>
                    )}
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
                        disabled={hasLeaveRequestToday}
                    >
                        Submit Leave Request
                    </button>
                </div>
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
                <button
                    onClick={() => viewAttendance(email)}
                    className="bg-blue-500 text-white px-4 py-2 mt-5 rounded hover:bg-blue-700 transition"
                >
                    View Attendance
                </button>
                {showPopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="bg-white rounded-lg p-6 w-1/2">
                            <h2 className="text-2xl font-semibold mb-4">Attendance Records for {name}</h2>
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
        </div>
    );
}
