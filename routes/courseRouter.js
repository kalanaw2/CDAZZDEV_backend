const express = require('express');
const router = express.Router();
const {allCourse, oneCourse, enrollCourse, getenrollCourse, oneCourseEnroll, getAllCourses, updateStudentCourse, updateVideos, addCourse, AllEnrollment, updateEnrollment, addEnrolment} = require("../controllers/courseController")
const auth = require("../middleware/auth")


router.post('/',  allCourse);

router.post('/one', auth, oneCourse);

router.post('/enroll', auth, enrollCourse);

router.post('/enroll-courses', auth, getenrollCourse);

router.post('/one-enroll', auth, oneCourseEnroll);

router.post('/all-courses', auth, getAllCourses);

router.post('/update-student-course', auth, updateStudentCourse);

router.post('/update-videos', auth, updateVideos); 

router.post('/add-course', auth, addCourse);

router.post('/all-enrollment', auth, AllEnrollment);

router.post('/update-enrollment', auth, updateEnrollment);

router.post('/add-enrolment', auth, addEnrolment);

module.exports = router;