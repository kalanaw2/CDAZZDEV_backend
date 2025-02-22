const express = require('express');
const router = express.Router();
const {Login, token} = require("../controllers/adminController")
const auth = require("../middleware/auth")


router.post('/login',  Login);

router.post('/token',  token);




module.exports = router;