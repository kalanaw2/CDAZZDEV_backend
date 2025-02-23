const db = require('../config/database')

class Course {

    static getAllCourse() {
        return new Promise((resolve, reject) => {
            const query = `SELECT id, name, description, instructor FROM courses WHERE status = 'active'`

            db.query(query,  (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        })
    }

    static getOneCourse(id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT courses.id, courses.name, courses.description, courses.instructor, courses.duration, courses.start_date, courses.end_date, courses.price, courses.video FROM courses LEFT JOIN course_enrollments ON courses.id = course_enrollments.course_id WHERE courses.id = ? AND courses.status = 'active'`

            db.query(query, [id],  (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        })
    }
   
    static postenrollCourse(id, user_id) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO course_enrollments (course_id, student_id) VALUES (?, ?)`

            db.query(query, [id, user_id],  (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        })
    }

    static getEnrollCourse(id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT courses.id, courses.name, courses.description, courses.instructor FROM courses INNER JOIN course_enrollments ON courses.id = course_enrollments.course_id WHERE course_enrollments.status = 'active' AND course_enrollments.student_id = ?`

            db.query(query, [id],  (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        })
    }

    static checkPermission(user_id, id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT id FROM course_enrollments WHERE student_id = ? AND course_id = ? AND status = 'active'`

            db.query(query, [user_id, id],  (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        })
    }

    static oneCourseEnroll(id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM courses WHERE status = 'active' AND id = ?`

            db.query(query, [id], (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        })
    }

    static getAllCourses() {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM courses `

            db.query(query,  (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        })
    }

    static updateStudentCourse(id, name, description, instructor, duration, start_date, end_date, price, status, video) {
        return new Promise((resolve, reject) => {
          const query = `
            UPDATE courses 
            SET 
              name = ?, 
              description = ?, 
              instructor = ?, 
              duration = ?, 
              start_date = ?, 
              end_date = ?, 
              price = ?, 
              status = ?, 
              video =?
            WHERE id = ?
          `;
      
          db.query(
            query, 
            [name, description, instructor, duration, start_date, end_date, price, status, video, id], 
            (err, result) => {
              if (err) {
                return reject(err);
              }
              resolve(result);
            }
          );
        });
      }

      static updateVideos(id, videos) {
        return new Promise((resolve, reject) => {
          const query = `
            UPDATE courses 
            SET 
              video_urls =?
            WHERE id = ?
          `;
      
          db.query(
            query, 
            [videos, id], 
            (err, result) => {
              if (err) {
                return reject(err);
              }
              resolve(result);
            }
          );
        });
      }

      static addCourse(courseDetails) {
        return new Promise((resolve, reject) => {
          const { name, description, instructor, duration, start_date, end_date, price, video, video_urls } = courseDetails;
      
          const query = `
            INSERT INTO courses (name, description, instructor, duration, start_date, end_date, price, video, video_urls)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
      
          db.query(query, [name, description, instructor, duration, start_date, end_date, price, video, JSON.stringify(video_urls)], (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
      }
      
      static AllEnrollment() {
        return new Promise((resolve, reject) => {
          const query = "SELECT * FROM course_enrollments";
    
          db.query(query, (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
      } 

      static updateEnrollment(id, course_id, student_id, status) {
        return new Promise((resolve, reject) => {
          const query = "UPDATE course_enrollments SET course_id = ?, student_id = ?, status = ? WHERE id = ?";
    
          db.query(query, [course_id, student_id, status, id], (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          });
        });
      }

      static addEnrolment(student, course) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO course_enrollments (course_id, student_id) VALUES (?, ?)`

            db.query(query, [course, student],  (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        })
    }

}

module.exports = Course