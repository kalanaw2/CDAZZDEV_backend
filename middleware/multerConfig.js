
const multer  = require('multer')
const path = require('path');

// Multer configuration for uploading files to a temporary directory
const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, 'public/Images')
  // },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
 
const upload = multer({ storage: storage,  limits: { fileSize: 15000000 } })

module.exports = upload;