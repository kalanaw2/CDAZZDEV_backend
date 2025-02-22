const Students = require("../models/studentModels");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const Register = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  try {
    const checkemail = await Students.findemail(email);

    if (checkemail.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, saltRounds);

    // Call the database function to register the student
    const result = await Students.Register(email, hash, name);

    if (result.affectedRows === 0)
      return res.status(400).json({ message: "Registration failed" });

    return res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.log(error);
  }
};

const Login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const studentDetails = await Students.login(email);

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

const AllStudents = async (req, res) => {

  const userDeatils = req.user;
  const user_id = userDeatils.user_id;

  try {
    const result = await Students.getAllStudents();

    if (result.length === 0)
      return res.status(404).json({ message: "Course not found" });

    return res
      .status(200)
      .json({ message: "Course successfully", result: result });
  } catch (error) {
    console.log(error);
  }
};

const updateStudents = async (req, res) => {

  const userDeatils = req.user;
  const user_id = userDeatils.user_id;
  const { id, name, email, status } = req.body

  try {
    const result = await Students.updateStudents(id, name, email, status);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "not Updated" });

    return res
      .status(200)
      .json({ message: "Course successfully" });
  } catch (error) {
    console.log(error);
  }
};

const addStudents = async (req, res) => {

  const userDeatils = req.user;
  const user_id = userDeatils.user_id;
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  try {
    const checkemail = await Students.findemail(email);

    if (checkemail.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, saltRounds);
 
    // Call the database function to register the student
    const result = await Students.Register(email, hash, name);

    if (result.affectedRows === 0)
      return res.status(400).json({ message: "Registration failed" });

    return res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { Register, Login, token, AllStudents, updateStudents, addStudents };
