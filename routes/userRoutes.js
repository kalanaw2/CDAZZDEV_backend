const express = require('express');
const router = express.Router();
const {register,login, changePassword, getAllUsers, oneUser, updateUser, updateAbout, updateClass, updateBank, setting, token, updateProfilepic, userSkill, completeProfile, updateQualification, profileMessage, systemSettings, userPrivate, forgotPassword, clearcompletemsg, randomTeacher, verifyEmail, resetPassword, sendEmailVerify, unsubscribeVerifyEmail, emailSubscribe, allReviews, TeacherNotification, oneReadNoti, allReadNoti} = require("../controllers/userController")
const upload = require("../middleware/multerConfig")
const auth = require("../middleware/auth")

router.get('/', getAllUsers);
router.post('/login', login);
router.post('/register', register);
router.post('/token', token);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/one-user', auth, oneUser);
router.post('/update-user', auth, updateUser);
router.post('/update-about', auth, updateAbout);
router.post('/update-class', auth, updateClass);
router.post('/update-bank', auth, updateBank);
router.post('/update-qualifiaction', auth, updateQualification);
router.get('/system-setting', setting)
router.post('/change-password', auth, changePassword);
router.post('/update-profilepic',auth, upload.single('file'), updateProfilepic)
router.post('/skill',userSkill)
router.post('/complete-profile', auth, upload.single('file'), completeProfile)
router.post('/profile-message', profileMessage)
router.get('/system-settings', auth, systemSettings)
router.post('/user-private', userPrivate)
router.post('/clear-completemsg', auth, clearcompletemsg )
router.post('/random-teacher,', randomTeacher )
router.post('/send-verify-email', auth, sendEmailVerify )
router.post('/verify-email', verifyEmail )
router.post('/email-unsubscribe', unsubscribeVerifyEmail)
router.post('/email-subscribe', auth, emailSubscribe)
router.post('/all-reviews', auth, allReviews)
router.post('/all-notifications', auth, TeacherNotification)
router.post('/read-noti-one', oneReadNoti)
router.post('/read-noti', allReadNoti)
 
module.exports = router;