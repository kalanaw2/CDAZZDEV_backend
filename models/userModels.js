const db = require("../config/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

class User {
    static getAllUsers(callback) {
        db.query("SELECT * FROM Teacher", callback);
    }

    static login(user, callback) {
        const { email, password } = user;


        db.query(
            "SELECT * FROM Teacher WHERE t_email = ?",
            [email],
            (err, results) => {
                if (err) {
                    return callback(err, null);
                }
                if (results.length === 0) {
                    return callback({ message: "User not found" }, null);
                }

                db.query("SELECT * FROM Teacher WHERE t_email = ? AND suspend = 1", [email], (suserr, susresult) => {
                    if (suserr) {
                        return callback(suserr, null);
                    }

                    if (susresult.length > 0) {
                        return callback({ message: "User is suspended" }, null);
                    }

                    const hashedPassword = results[0].password;

                    bcrypt.compare(password, hashedPassword, (compareErr, isMatch) => {
                        if (compareErr) {
                            return callback(compareErr, null);
                        }
                        if (!isMatch) {
                            return callback({ message: "Incorrect password" }, null);
                        }
                        return callback(null, results[0]);
                    });
                })

            }
        );
    }

    static findOne(id, callback) {
        db.query("SELECT * FROM Teacher WHERE t_id =?", [id], callback);
    }

    static updateUser(user, id, callback) {
        const { t_fname, t_lname, t_email, t_contactnum, t_nic, t_address } = user;

        const query = "SELECT * FROM teacher_profile_edit WHERE t_id = ? AND admin_approve = 0"

        let insertQuery = "INSERT INTO teacher_profile_edit (t_id, t_fname, t_lname, t_email, t_mobile, t_nic, t_address) VALUES (?, ?, ?, ?, ?, ?, ?)";

        const updateQuery = "UPDATE teacher_profile_edit SET  t_fname = ?, t_lname = ? , t_email = ? , t_mobile = ? , t_nic = ?, t_address = ? WHERE t_id = ? AND admin_approve = 0"

        const queryParams = [
            id,
            t_fname,
            t_lname,
            t_email,
            t_contactnum,
            t_nic,
            t_address,
        ];

        db.query(query, [id], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            if (result.length > 0) {
                db.query(updateQuery, [t_fname, t_lname, t_email, t_contactnum, t_nic, t_address, id], (updateerr, updateresult) => {
                    if (updateerr) {
                        return callback(updateerr, null);
                    }

                    return callback(null, updateresult);
                })
            }

            if (result.length === 0) {
                db.query(insertQuery, queryParams, (inserterr, insertresult) => {
                    if (inserterr) {
                        return callback(inserterr, null);
                    }

                    return callback(null, insertresult);
                });
            }

        })




    }

    static updateClass(categoryJson, hourrate, id, callback) {
        const query = "SELECT * FROM teacher_profile_edit WHERE t_id = ? AND admin_approve = 0"

        let insertQuery = "INSERT INTO teacher_profile_edit (category, t_hourrate, t_id) VALUES (?, ?, ?)";

        const updateQuery = "UPDATE teacher_profile_edit SET  category = ?, t_hourrate = ? WHERE t_id = ? AND admin_approve = 0"

        const queryParams = [categoryJson, hourrate, id];

        db.query(query, [id], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            console.log(result)
            if (result.length > 0) {
                db.query(updateQuery, [categoryJson, hourrate, id], (updateerr, updateresult) => {
                    if (updateerr) {
                        return callback(updateerr, null);
                    }

                    return callback(null, updateresult);
                })
            }

            if (result.length === 0) {
                db.query(insertQuery, queryParams, (inserterr, insertresult) => {
                    if (inserterr) {
                        return callback(inserterr, null);
                    }

                    return callback(null, insertresult);
                });
            }

        })



    }

    static updateAbout(about, id, callback) {
        const query = "SELECT * FROM teacher_profile_edit WHERE t_id = ? AND admin_approve = 0"

        let insertQuery = "INSERT INTO teacher_profile_edit (t_id, summery) VALUES (?, ?)";

        const updateQuery = "UPDATE teacher_profile_edit SET  summery = ? WHERE t_id = ? AND admin_approve = 0"

        const queryParams = [id, about];

        db.query(query, [id], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            if (result.length > 0) {
                db.query(updateQuery, [about, id], (updateerr, updateresult) => {
                    if (updateerr) {
                        return callback(updateerr, null);
                    }

                    return callback(null, updateresult);
                })
            }

            if (result.length === 0) {
                db.query(insertQuery, queryParams, (inserterr, insertresult) => {
                    if (inserterr) {
                        return callback(inserterr, null);
                    }

                    return callback(null, insertresult);
                });
            }

        })


    }

    static updateQualification(about, id, callback) {
        let insertQuery = "INSERT INTO teacher_profile_edit (t_id, edu_qualification) VALUES (?, ?)";

        const query = "SELECT * FROM teacher_profile_edit WHERE t_id = ? AND admin_approve = 0"

        const updateQuery = "UPDATE teacher_profile_edit SET  edu_qualification = ? WHERE t_id = ? AND admin_approve = 0"


        const queryParams = [id, about];

        db.query(query, [id], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            if (result.length > 0) {
                db.query(updateQuery, [about, id], (updateerr, updateresult) => {
                    if (updateerr) {
                        return callback(updateerr, null);
                    }

                    return callback(null, updateresult);
                })
            }

            if (result.length === 0) {
                db.query(insertQuery, queryParams, (inserterr, insertresult) => {
                    if (inserterr) {
                        return callback(inserterr, null);
                    }

                    return callback(null, insertresult);
                });
            }

        })
    }

    static updateBank(user, id, callback) {

        const { t_accnum, t_bankname, t_branch, t_holdername } = user;

        const query = "SELECT * FROM teacher_profile_edit WHERE t_id = ? AND admin_approve = 0"

        let insertQuery = "INSERT INTO teacher_profile_edit (t_account_no, t_bankname, t_branch, t_holdername, t_id) VALUES (?, ?, ?, ?, ?) ";

        const updateQuery = "UPDATE teacher_profile_edit SET  t_account_no = ?, t_bankname = ? , t_branch = ? , t_holdername = ?  WHERE t_id = ? AND admin_approve = 0"

        const queryParams = [t_accnum, t_bankname, t_branch, t_holdername, id];

        db.query(query, [id], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            if (result.length > 0) {
                db.query(updateQuery, [t_accnum, t_bankname, t_branch, t_holdername, id], (updateerr, updateresult) => {
                    if (updateerr) {
                        return callback(updateerr, null);
                    }

                    return callback(null, updateresult);
                })
            }

            if (result.length === 0) {
                db.query(insertQuery, queryParams, (inserterr, insertresult) => {
                    if (inserterr) {
                        return callback(inserterr, null);
                    }

                    return callback(null, insertresult);
                });
            }

        })


    }

    static changePassword(id, currentPassword, newPassword, callback) {
        db.query("SELECT * FROM Teacher WHERE t_id = ?", [id], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            if (result.length == 0) {
                return callback({ message: "User not found" }, null);
            }

            const dbPassword = result[0].password;

            bcrypt.compare(currentPassword, dbPassword, function (err, result) {
                if (err) return callback(err, null);

                if (!result) {
                    return callback({ message: "Incorrect password" }, null);
                }

                if (result) {
                    bcrypt.hash(newPassword, saltRounds, function (err, hash) {
                        const dbquery = "UPDATE Teacher SET password = ? WHERE t_id = ? ";

                        db.query(dbquery, [hash, id], (err, result) => {
                            if (err) return callback(err, null);
                            return callback(null, result);
                        });
                    });
                }
            });
        });
    }

    static async changeProfilepic(id, file_path) {
        const insertQuery = "INSERT INTO teacher_profile_edit (t_id, t_profile) VALUES (?, ?)";
        const query = "SELECT * FROM teacher_profile_edit WHERE t_id = ? AND admin_approve = 0";
        const updateQuery = "UPDATE teacher_profile_edit SET t_profile = ? WHERE t_id = ? AND admin_approve = 0";

        try {
            // Check if there is an existing record
            const results = await new Promise((resolve, reject) => {
                db.query(query, [id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            if (results.length > 0) {
                // Update existing record
                return new Promise((resolve, reject) => {
                    db.query(updateQuery, [file_path, id], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            } else {
                // Insert new record
                return new Promise((resolve, reject) => {
                    db.query(insertQuery, [id, file_path], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            }
        } catch (error) {
            // Handle errors
            throw new Error(`Database operation failed: ${error.message}`);
        }
    }

    static userSkill(id) {
        return new Promise((resolve, reject) => {
            // const query = 'SELECT * FROM Teacher_Skill WHERE t_id IN (0, ?)'
            const query = "SELECT * FROM Teacher_Skill";

            db.query(query, [id], (err, result) => {
                if (err) return reject(err);

                resolve(result);
            });
        });
    }

    static completeProfile(
        id,
        file_path,
        summery,
        t_accnum,
        t_address,
        t_bankname,
        t_branch,
        t_contactnum,
        t_email,
        t_fname,
        t_holdername,
        t_hourrate,
        t_lname,
        t_nic,
        category,
        qualification
    ) {
        return new Promise((resolve, reject) => {
            // const query = 'SELECT * FROM Teacher_Skill WHERE t_id IN (0, ?)'
            const query = "INSERT INTO teacher_profile_edit (t_id, t_fname, t_lname, t_email, t_nic, t_address, t_mobile, t_hourrate, t_bankname, t_account_no, t_holdername, t_branch, t_profile, summery, category, edu_qualification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            const t_query = "UPDATE Teacher SET edit_req = 1, profile_com_status = 1 WHERE t_id = ?"

            db.query(query, [id, t_fname, t_lname, t_email, t_nic, t_address, t_contactnum, t_hourrate, t_bankname, t_accnum, t_holdername, t_branch, file_path, summery, category, qualification], (err, result) => {
                if (err) return reject(err);


                db.query(t_query, [id], (err, t_result) => {
                    if (err) return reject(err);

                    if (t_result.affectedRows > 0) {
                        resolve(result);
                    }

                })

            });
        });
    }

    static completewithoutprofilepic(
        id,
        summery,
        t_accnum,
        t_address,
        t_bankname,
        t_branch,
        t_contactnum,
        t_email,
        t_fname,
        t_holdername,
        t_hourrate,
        t_lname,
        t_nic,
        category,
        qualification
    ) {
        return new Promise((resolve, reject) => {
            // const query = 'SELECT * FROM Teacher_Skill WHERE t_id IN (0, ?)'
            const query = "INSERT INTO teacher_profile_edit (t_id, t_fname, t_lname, t_email, t_nic, t_address, t_mobile, t_hourrate, t_bankname, t_account_no, t_holdername, t_branch, summery, category, edu_qualification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            const t_query = "UPDATE Teacher SET edit_req = 1, profile_com_status = 1 WHERE t_id = ?"

            db.query(query, [id, t_fname, t_lname, t_email, t_nic, t_address, t_contactnum, t_hourrate, t_bankname, t_accnum, t_holdername, t_branch, summery, category, qualification], (err, result) => {
                if (err) return reject(err);

                db.query(t_query, [id], (err, t_result) => {
                    if (err) return reject(err);

                    if (t_result.affectedRows > 0) {
                        resolve(result);
                    }

                })
            });
        });
    }

    static category(categoryData) {
        return new Promise((resolve, reject) => {
            // const query = 'SELECT * FROM Teacher_Skill WHERE t_id IN (0, ?)'
            const query = ` SELECT sk_details FROM Teacher_Skill WHERE sk_id IN (?) AND status = '1'`;

            db.query(query, [categoryData], (err, result) => {
                if (err) return reject(err);

                resolve(result);
            });
        });
    }

    static editteacherstatus(id) {
        return new Promise((resolve, reject) => {
            const t_query = "UPDATE Teacher SET edit_req = 1, profile_com_status = 1 WHERE t_id = ?"


            db.query(t_query, [id], (err, t_result) => {
                if (err) return reject(err);

                if (t_result.affectedRows > 0) {
                    resolve(t_result);
                }

            })
        })
    }

    static profileMessage(id) {
        return new Promise((resolve, reject) => {
            const query = "SELECT profile_com_status, p_finish_class, t_email, email_verify, status, adminStatus FROM Teacher WHERE t_id =?"

            db.query(query, [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })

        })
    }

    static systemSettings() {
        return new Promise((resolve, reject) => {
            const query = "SELECT contact_num, email, logo_white, logo, company_name, company_web_url, t_timeslot_booking FROM System_Setting"

            db.query(query, (err, result) => {
                if (err) return reject(err);

                resolve(result);
            })
        })
    }

    static userPrivate(id, pro_status) {
        return new Promise((resolve, reject) => {
            const query = "UPDATE Teacher SET pro_status = ? WHERE t_id = ?"

            db.query(query, [pro_status, id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static penFinishClass(id) {
        return new Promise((resolve, reject) => {
            const currentDateTime = new Date();
            const queryUpdate = 'UPDATE Teacher SET p_finish_class = 1 WHERE t_id= ?'
            const query = `SELECT * FROM Student_Schedule WHERE t_id = ? AND class_end IN (1, 2)  AND (
                 schedule_date < CURDATE() 
                OR (schedule_date = CURDATE() AND start_time < CURTIME())
              )`

            // Extract current date and time for comparison
            const currentDate = currentDateTime.toISOString().split('T')[0]; // YYYY-MM-DD format
            const currentTime = currentDateTime.toTimeString().split(' ')[0]; // HH:MM:SS format

            // Execute the query with placeholders for t_id, current date, and current time
            db.query(query, [id, currentDate, currentDate, currentTime], (err, result) => {
                if (err) return reject(err);

                if (result.length > 0) {
                    db.query(queryUpdate, [id], (err, updateResult) => {
                        if (err) return reject(err);

                        resolve(updateResult);
                    })
                }

                resolve(result);
            });
        })
    }

    static clearcompletemsg(id) {
        return new Promise((resolve, reject) => {
            const query = "UPDATE Teacher SET p_finish_class = 0 WHERE t_id =?"

            db.query(query, [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static randomTeacher() {
        return new Promise((resolve, reject) => {
            const query = `
        SELECT
            Teacher.t_id, Teacher.t_fname, Teacher.t_lname, Teacher.profile
        FROM
            Teacher     
        INNER JOIN 
            Teacher_Schedule
        ON
            Teacher.t_id = Teacher_Schedule.t_id
        WHERE
             (
                (schedule_date = CURDATE() AND start_time > CURTIME())
                OR schedule_date > CURDATE()
            )
            AND Teacher_Schedule.status = 0
        GROUP BY
            Teacher.t_id
        ORDER BY 
            RAND();

`
        })
    }

    static verifyEmail(email) {
        return new Promise((resolve, reject) => {
            const query = "UPDATE Teacher SET email_verify = 1 WHERE t_email =?"
            db.query(query, [email], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static forgotPassword(email) {
        return new Promise((resolve, reject) => {
            const query = "SELECT t_id FROM Teacher WHERE t_email =?"
            db.query(query, [email], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static resetPassword(password, email) {
        return new Promise((resolve, reject) => {
            const query = "UPDATE Teacher SET password = ? WHERE t_email =?"
            db.query(query, [password, email], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static teacherDetails(email) {
        return new Promise((resolve, reject) => {

            const query = ` SELECT t_id, t_fname, t_lname, profile, t_email FROM Teacher WHERE t_email = ?`;

            db.query(query, [email], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });

        });
    }

    static unsubscribeVerifyEmail(email){
        return new Promise((resolve, reject) => {
            const query = "UPDATE Teacher SET email_subscribe = 0 WHERE t_email =?"
            db.query(query, [email], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static emailSubscribe(status, id){
        return new Promise((resolve, reject) => {
            const query = "UPDATE Teacher SET email_subscribe = ? WHERE t_id =?"
            db.query(query, [status, id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static allReviews(id){
        return new Promise((resolve, reject) => {
            const query = "SELECT Student_Schedule.schedule_date, Student_Schedule.rate, Student_Schedule.feedback, Student_Schedule.ssch_id, Student.stu_fname, Student.stu_lname, Student.profile FROM Student_Schedule INNER JOIN Student ON Student_Schedule.stu_id = Student.stu_id WHERE Student_Schedule.t_id = ? AND Student_Schedule.feedback_status = 1 AND Student_Schedule.class_end = 3"
            db.query(query, [id], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static TeacherNotifications(t_id){
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM teacher_notification WHERE t_id = ? ORDER BY id DESC LIMIT 20"
            db.query(query, [t_id],  (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static oneReadNoti(t_id, noti_id){
        return new Promise((resolve, reject) => {
            const query = "UPDATE teacher_notification SET status = 0 WHERE t_id = ? AND id = ?"
            db.query(query, [t_id, noti_id],  (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }

    static allReadNoti(t_id){
        return new Promise((resolve, reject) => {
            const query = "UPDATE teacher_notification SET status = 0 WHERE t_id = ?"
            db.query(query, [t_id],  (err, result) => {
                if (err) return reject(err);
                resolve(result);
            })
        })
    }
}

module.exports = User;
