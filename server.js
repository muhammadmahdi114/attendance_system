const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const UserSchema = require("./src/models/User")

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://mahdimuhammad116:OuttsrQpwdBfUHHC@attendancesystem.m0sxk3u.mongodb.net/?retryWrites=true&w=majority&appName=attendanceSystem'")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log('failed');
  })


  app.post("/login", async (req, res) => {
    const { email, password, role } = req.body;
    
    if (!password) {
      return res.json({ success: false, message: "Password is required" });
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
        });
      } else {
        return res.json({ success: false, message: "Invalid email or password" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });
  

app.post("/signup", async (req, res) => {
  const { name, email, password, age } = req.body;
  const role = 'user';
  const data = {
    name,
    email,
    password,
    age,
    role
  };

  try {
    const check = await UserSchema.findOne({ email: email });

    if (check) {
      return res.json("exist");
    } else {
      const EncPassword = await bcrypt.hash(password, 10);
      const user = await UserSchema.create({
        name,
        email,
        password: EncPassword,
        age,
        role
      });
      res.status(201).json(user);
      return;
    }
  } catch (error) {
    console.error(error);
    res.json("fail");
    return;
  }
});
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
