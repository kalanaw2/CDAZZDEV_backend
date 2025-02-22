const express = require('express');
const router = express.Router();
const {allCourse, oneCourse, enrollCourse, getenrollCourse, oneCourseEnroll, getAllCourses} = require("../controllers/courseController")
const auth = require("../middleware/auth")


router.post('/',  allCourse);

router.post('/one', auth, oneCourse);

router.post('/enroll', auth, enrollCourse);

router.post('/enroll-courses', auth, getenrollCourse);

router.post('/one-enroll', auth, oneCourseEnroll);

router.post('/all-courses', auth, getAllCourses);


module.exports = router;