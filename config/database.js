const mysql = require("mysql");

const db = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "learning_platform",
  timezone: "Asia/Colombo",
});
 
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "",
//   timezone: "Asia/Colombo",
// });

// db.connect((err) => {
//   if (err) throw err;
//   console.log("Connected to the database!");
// });

module.exports = db;
