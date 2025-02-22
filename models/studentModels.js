const db = require("../config/database");

class Students {
  static Register(email, hash, name) {
    return new Promise((resolve, reject) => {
      const query =
        "INSERT INTO students (email, password, name) VALUES (?, ? ,?)";

      db.query(query, [email, hash, name], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static findemail(email) {
    return new Promise((resolve, reject) => {
      const query = "SELECT *  FROM students WHERE email = ? ";

      db.query(query, [email], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static login(email) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM students WHERE email = ? ";

      db.query(query, [email], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static getAllStudents() {
    return new Promise((resolve, reject) => {
      const query = "SELECT id, name, email, status FROM students";

      db.query(query, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

  static updateStudents(id, name, email, status) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE students SET name = ?, email = ?, status = ? WHERE id = ?";

      db.query(query, [name, email, status, id], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  }

}

module.exports = Students;
