import React, { useState, } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function StudentLoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordType, setPasswordType] = useState("password")
    const [role] = useState("user")
    const navigate = useNavigate();

    async function submit(e) {
        e.preventDefault();

        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email address");
                return;
            }

            const response = await axios.post("http://localhost:8000/login", {
                email,
                password,
                role
            });

            if (response.data.success) {
                const nameFromResponse = response.data.username;
                sessionStorage.setItem("name", nameFromResponse);
                navigate("/dashboard");
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            alert("Error occurred while logging in");
            console.log(error);
        }
    }

    const handleTogglePass = () => {
        if (passwordType === "password") {
            setPasswordType("text")
        } else {
            setPasswordType("password")
        }
    }
    return (
        <div className="w-screen h-screen flex flex-col items-center bg-gradient-to-r from-blue-500 to-navy-200">
            <div className="absolute top-4 right-4 flex items-center">
                <button
                    onClick={() => navigate("/facultyLoginPage")}
                    className="bg-blue-500 text-white p-2 rounded-lg shadow transition-transform duration-300 ease-in-out transform hover:scale-105"
                >
                    Switch to Admin Login
                </button>
            </div>
            <div className="w-1/3 my-32 bg-white border-4 border-white rounded-lg p-9 flex flex-col justify-center items-center text-black">
                <h1 className="text-3xl mt-3">Student Login</h1>
                <form onSubmit={submit}>
                    <div className="w-80 mt-10">
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 border-b-2 border-gray-200 pl-5 w-full" />
                    </div>
                    <div className="w-80 mt-10">
                        <input type={passwordType} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-8 border-b-2 border-gray-200 pl-5 w-full" />
                    </div>
                    <div className="mt-10">
                        <input type="checkbox" onChange={handleTogglePass} />
                        <label className="ml-2">Show password</label>
                    </div>
                    <div className="w-80 mt-10">
                        <button
                            type="submit"
                            className="p-2 rounded text-center border-white mt-4 bg-blue-500 text-white h-12 w-full hover:bg-blue-700 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:shadow-outline"
                        >
                            Submit
                        </button>
                    </div>
                </form>
                <Link to="/register" className="mt-3">Dont have an account? <span className="underline text-blue-600">Register!</span></Link>
            </div>
        </div>
    )
}