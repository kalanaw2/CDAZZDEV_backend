const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const Admins = require("../models/adminModels");

const Login = async (req, res, next) => {
  const { email, password } = req.body; 

  try {
    const studentDetails = await Admins.login(email);

    if (!studentDetails || studentDetails.length === 0) {
      return res.status(400).json({ message: "Student not found" });
    }

    const student = studentDetails[0]; 

    if (student.status === "inactive") {
      return res.status(403).json({ message: "User is suspended" });
    }

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { user_id: student.id },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "3h" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { user_id: student.id },
      process.env.REFRESH_TOKEN_KEY,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login Successful",
      user_id: student.id,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const token = (req, res, next) => {
   const refreshToken = req.body.refreshToken;

   if (refreshToken == null) return res.sendStatus(401);

   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = jwt.sign(
         { user_id: user.user_id },
         process.env.ACCESS_TOKEN_KEY,
         { expiresIn: "3h" }
      );
      return res.status(200).json({
         message: "Login Successful",
         accessToken: accessToken,
      });
   });
};

module.exports = { Login, token };
