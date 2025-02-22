const express = require('express');
const router = express.Router();
const {Register, Login, token, AllStudents, updateStudents, addStudents} = require("../controllers/studentController")
const auth = require("../middleware/auth")

router.post('/', auth, AllStudents);

router.post('/register',  Register);

router.post('/login',  Login);

router.post('/token',  token);

router.post('/update', auth, updateStudents);

router.post('/add', auth, addStudents);



module.exports = router;