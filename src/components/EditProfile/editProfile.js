import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
    const [name, setName] = useState(sessionStorage.getItem('name') || "");
    const [age, setAge] = useState(sessionStorage.getItem('age') || "");
    const [profilePic, setProfilePic] = useState(null);
    const navigate = useNavigate();
    const email = sessionStorage.getItem('email');

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("age", age);
        if (profilePic) {
            formData.append("profilePic", profilePic);
        }

        try {
            const response = await axios.post(`http://localhost:8000/update-profile`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (!response.data.success) {
                alert(response.data.message);
            } else {
                const { name, age, profilePic } = response.data.user;
                sessionStorage.setItem('name', name);
                sessionStorage.setItem('age', age);
                if (profilePic) {
                    sessionStorage.setItem('profilePic', profilePic);
                }
                alert('Profile updated successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            alert("Error occurred while updating profile");
            console.error(error);
        }
    }

    const handleProfilePicChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    return (
        <div className="w-full h-screen flex flex-col items-center bg-gradient-to-r from-blue-500 to-navy-200">
            <div className="w-1/3 my-16 bg-white border-4 border-white rounded-lg p-9 flex flex-col justify-center items-center text-black">
                <h1 className="text-3xl mt-3">Edit Profile</h1>
                <form onSubmit={handleSubmit}>
                    <div className="w-80 mt-10">
                        <p>Email: {email}</p>
                    </div>
                    <div className="w-80 mt-10">
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-8 border-b-2 border-gray-200 pl-5 w-full"
                        />
                    </div>
                    <div className="w-80 mt-10">
                        <input
                            type="number"
                            placeholder="Age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="h-8 border-b-2 border-gray-200 pl-5 w-full"
                        />
                    </div>
                    <div className="w-80 mt-10">
                        <label>Change Profile Picture</label>
                        <input
                            type="file"
                            onChange={handleProfilePicChange}
                            className="h-8 border-b-2 border-gray-200 pl-5 w-full mt-2"
                        />
                    </div>
                    <div className="w-80 mt-10">
                        <button
                            type="submit"
                            className="p-2 rounded text-center border-white mt-4 bg-blue-500 text-white h-12 w-full hover:bg-blue-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:shadow-outline"
                        >
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
