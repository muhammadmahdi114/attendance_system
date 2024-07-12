import React, { useState, } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
export default function RegisterPage() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState("");
    const [passwordType, setPasswordType] = useState("password")
    const navigate = useNavigate();

    async function submit(e) {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert("Please enter a valid email address");
          return;
        }
    
        try {
          const response = await axios.post("http://localhost:8000/signup", {
            name,
            email,
            password,
            age,
          });
    
          if (response.data.status === "exist") {
            alert("User already exists");
          } else {
            navigate("/");
          }
        } catch (error) {
          alert("Error occurred while signing up");
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
        <div className="w-full h-screen flex flex-col items-center bg-gradient-to-r from-blue-500 to-navy-200">
            <div className="w-1/3 my-10 bg-white border-4 border-white rounded-lg p-9 flex flex-col justify-center items-center text-black">
                <h1 className="text-3xl mt-3">SignUp</h1>
                <form onSubmit={submit}>
                <div className="w-80 mt-10">
                        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="h-8 border-b-2 border-gray-200 pl-5 w-full" />
                    </div>
                    <div className="w-80 mt-10">
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 border-b-2 border-gray-200 pl-5 w-full" />
                    </div>
                    <div className="w-80 mt-10">
                        <input type="text" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="h-8 border-b-2 border-gray-200 pl-5 w-full" />
                    </div>
                    <div className="w-80 mt-10">
                        <input type={passwordType} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-8 border-b-2 border-gray-200 pl-5 w-full" />
                    </div>
                    <div className="mt-10">
                        <input type="checkbox" onChange={handleTogglePass}/>
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
                <Link to="/" className="mt-3">Already have an account? <span className="underline text-blue-600">Login!</span></Link>
            </div>
        </div>
    )
}