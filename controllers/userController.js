const User = require("../models/userModels");
const SystemSettings = require("../models/systemSettingModel");
const saveNotification = require("../models/notification");
const saveLogs = require("../models/logs");
const Posts = require("../models/postModels");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const querystring = require('querystring');
const path = require('path'); // For handling file paths
const emailTemplate = require('./allEmails');
var md5 = require('md5');
const sendEmail = require("./sendEmail")
const TeacherOther = require("../models/teacherother");

const register = (req, res, next) => {
   const email = req.body.email;
   const password = req.body.password;
   const ss = req.body.ss;
   // bcrypt.hash(password, saltRounds, function (err, hash) {
   //    console.log(hash);
   // });
   console.log(md5(email + password + ss));


};

const login = (req, res, next) => {
   const newUser = {
      email: req.body.email,
      password: req.body.password,
   };

   User.login(newUser, async (err, result) => {
      if (err) {
         return res.status(500).json({ err });
      }

      const accessToken = jwt.sign(
         { user_id: result.t_id },
         process.env.ACCESS_TOKEN_KEY,
         { expiresIn: "3h" }
      );
      const refreshToken = jwt.sign(
         { user_id: result.t_id },
         process.env.REFRESH_TOKEN_KEY,
         { expiresIn: "24h" }
      );

      try {
         const p_finish_class = await User.penFinishClass(result.t_id)

      } catch (error) {
         console.log(error)
      }

      const logsData = {
         t_id: result.t_id,
         module: "User Login",
         comment: `User ${result.t_id} login successfully`,
      };

      saveLogs(logsData, (logErr, logResult) => {
         if (logErr) {
            return res.status(500).json({ logError: logErr });
         }

         return res.status(200).json({
            message: "Login Successful",
            user: result,
            accessToken: accessToken,
            refreshToken: refreshToken,

         });
      });
   });
};

const token = (req, res, next) => {
   const refreshToken = req.body.refreshToken;

   if (refreshToken == null) return res.sendStatus(401);

   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = jwt.sign(
         { user_id: user.user_id },
         process.env.ACCESS_TOKEN_KEY,
         { expiresIn: "3h" }
      );
      return res.status(200).json({
         message: "Login Successful",
         accessToken: accessToken,
      });
   });
};

const getAllUsers = (req, res) => {
   User.getAllUsers((err, users) => {
      if (err) {
         return res.status(500).json({ err });
      }

      return res.status(200).json({ message: "All Users", users: users });
   });
};

const oneUser = (req, res) => {

   const userDeatils = req.user
   const id = userDeatils.user_id

   User.findOne(id, async (err, user) => {
      if (err) {
         return res.status(500).json({ error: err });
      }

      if (user.length === 0) {
         return res.status(404).json({ message: "User not found" });
      }

      user[0].password = '';

      const categoryJson = user[0].category;
      const categoryData = JSON.parse(categoryJson);
      user[0].category = categoryData;

      if (categoryData.length === 0) {
         return res
            .status(200)
            .json({ message: "User Found", user: user[0], allcategory: [] });
      }

      if (categoryData.length > 0) {
         try {
            const allcategory = await User.category(categoryData);

            if (allcategory.length === 0) {
               return res.status(204).json({ message: "User not Found" });
            }

            if (allcategory.length > 0) {
               return res
                  .status(200)
                  .json({
                     message: "User Found",
                     user: user[0],
                     allcategory: allcategory,
                  });
            }
         } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Invalid JSON data in category" });
         }
      }

      console.log(categoryJson, typeof categoryData);
   });
};

const updateUser = (req, res) => {
   const data = req.body.data;
   const userDeatils = req.user
   const id = userDeatils.user_id

   User.updateUser(data, id, async (err, result) => {

      if (err) {
         return res.status(500).json({ error: err });
      }

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: "User not found" });
      }

      const teacherstatus = await User.editteacherstatus(id);

      const sociallinks = await TeacherOther.social_links()

      if (!sociallinks) return res.status(400).json({ message: 'sociallinks not found' })

      const teacherDetails = await Posts.teacherDetails(id)
      const TeacherName = `${teacherDetails[0].t_fname} ${teacherDetails[0].t_lname}`
      const cNumber = teacherDetails[0].t_contactnum

      const title = "Teacher Profile Update"
      const Description = `Teacher(${id}) profile has been updated. Review the changes if necessary` 

      const admin_notifications = await TeacherOther.admin_notifications(title, Description, id)

      const emailList = await TeacherOther.get_admin()

      if (!emailList) return res.status(400).json({ message: 'Admins not found' })

      const allEmails = emailList.map((email) =>email.username)
     
      const mailCont = emailTemplate.teacherUpdateNotification(sociallinks, id, TeacherName, cNumber)

      const postData = {
         'to': allEmails[0],
         'cc': allEmails,
         'sub': 'Teacher Profile Update Notification',
         'msg': mailCont,
      }

      const emailRes = await sendEmail(postData)

      const logsData = {
         t_id: id,
         module: "Update User",
         comment: `Upated user personal information for ${id}`,
      };

      saveLogs(logsData, (err, result) => {
         if (err) {
            return res.status(500).json({ error: err });
         }

         return res.status(200).json({ message: "User Updated" });

         // Prepare notification data
         // const notificationData = {
         //    title: "Update User",
         //    comment: "Upated user personal information",
         //    t_id: id,
         // };

         // saveNotification(notificationData, (err, result) => {
         //    if (err) {
         //       return res.status(500).json({ error: err });
         //    }

         //    return res.status(200).json({ message: "User Updated" });
         // });
      });
   });
};

const updateClass = (req, res) => {
   const category = req.body.category;
   const hourrate = req.body.hourrate;
   const userDeatils = req.user
   const id = userDeatils.user_id

   const categoryJson = JSON.stringify(category);
   User.updateClass(categoryJson, hourrate, id, async (err, result) => {
      console.log("result", result);
      if (err) {
         return res.status(500).json({ error: err });
      }

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: "User not found" });
      }

      const teacherstatus = await User.editteacherstatus(id);

      const sociallinks = await TeacherOther.social_links()

      if (!sociallinks) return res.status(400).json({ message: 'sociallinks not found' })

      const teacherDetails = await Posts.teacherDetails(id)
      const TeacherName = `${teacherDetails[0].t_fname} ${teacherDetails[0].t_lname}`
      const cNumber = teacherDetails[0].t_contactnum

      const title = "Teacher Profile Update"
      const Description = `Teacher(${id}) profile has been updated. Review the changes if necessary` 

      const admin_notifications = await TeacherOther.admin_notifications(title, Description, id)

      const emailList = await TeacherOther.get_admin()

      if (!emailList) return res.status(400).json({ message: 'Admins not found' })

      const allEmails = emailList.map((email) =>email.username)
     
      const mailCont = emailTemplate.teacherUpdateNotification(sociallinks, id, TeacherName, cNumber)

      const postData = {
         'to': allEmails[0],
         'cc': allEmails,
         'sub': 'Teacher Profile Update Notification',
         'msg': mailCont,
      }

      const emailRes = await sendEmail(postData)


      const logsData = {
         t_id: id,
         module: "Update Class",
         comment: `Upated class details for ${id}`,
      };

      saveLogs(logsData, (err, result) => {
         if (err) {
            return res.status(500).json({ error: err });
         }

         return res.status(200).json({ message: "User Updated" });
         // Prepare notification data
         // const notificationData = {
         //    title: "Update Class",
         //    comment: "Upated class details",
         //    t_id: id,
         // };

         // saveNotification(notificationData, (err, result) => {
         //    if (err) {
         //       return res.status(500).json({ error: err });
         //    }

         //    return res.status(200).json({ message: "User Updated" });
         // });
      });
   });
};

const updateAbout = (req, res) => {
   const about = req.body.about;
   const userDeatils = req.user
   const id = userDeatils.user_id

   User.updateAbout(about, id, async (err, result) => {
      if (err) {
         return res.status(500).json({ error: err });
      }

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: "User not found" });
      }

      const teacherstatus = await User.editteacherstatus(id);

      const sociallinks = await TeacherOther.social_links()

      if (!sociallinks) return res.status(400).json({ message: 'sociallinks not found' })

      const teacherDetails = await Posts.teacherDetails(id)
      const TeacherName = `${teacherDetails[0].t_fname} ${teacherDetails[0].t_lname}`
      const cNumber = teacherDetails[0].t_contactnum

      const title = "Teacher Profile Update"
      const Description = `Teacher(${id}) profile has been updated. Review the changes if necessary` 

      const admin_notifications = await TeacherOther.admin_notifications(title, Description, id)

      const emailList = await TeacherOther.get_admin()

      if (!emailList) return res.status(400).json({ message: 'Admins not found' })

      const allEmails = emailList.map((email) =>email.username)
     
      const mailCont = emailTemplate.teacherUpdateNotification(sociallinks, id, TeacherName, cNumber)

      const postData = {
         'to': allEmails[0],
         'cc': allEmails,
         'sub': 'Teacher Profile Update Notification',
         'msg': mailCont,
      }

      const emailRes = await sendEmail(postData)


      const logsData = {
         t_id: id,
         module: "Update About",
         comment: `Upated about details for ${id}`,
      };

      saveLogs(logsData, (err, result) => {
         if (err) {
            return res.status(500).json({ error: err });
         }
         return res.status(200).json({ message: "User Updated" });

         // Prepare notification data
         // const notificationData = {
         //    title: "Update About",
         //    comment: "Upated about details",
         //    t_id: id,
         // };

         // saveNotification(notificationData, (err, result) => {
         //    if (err) {
         //       return res.status(500).json({ error: err });
         //    }

         //    return res.status(200).json({ message: "User Updated" });
         // });
      });
   });
};

const updateQualification = (req, res) => {
   const about = req.body.about;
   const userDeatils = req.user
   const id = userDeatils.user_id

   User.updateQualification(about, id, async (err, result) => {
      if (err) {
         return res.status(500).json({ error: err });
      }

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: "User not found" });
      }

      const teacherstatus = await User.editteacherstatus(id);

      const sociallinks = await TeacherOther.social_links()

      if (!sociallinks) return res.status(400).json({ message: 'sociallinks not found' })

      const teacherDetails = await Posts.teacherDetails(id)
      const TeacherName = `${teacherDetails[0].t_fname} ${teacherDetails[0].t_lname}`
      const cNumber = teacherDetails[0].t_contactnum

      const title = "Teacher Profile Update"
      const Description = `Teacher(${id}) profile has been updated. Review the changes if necessary` 

      const admin_notifications = await TeacherOther.admin_notifications(title, Description, id)

      const emailList = await TeacherOther.get_admin()

      if (!emailList) return res.status(400).json({ message: 'Admins not found' })

      const allEmails = emailList.map((email) =>email.username)
     
      const mailCont = emailTemplate.teacherUpdateNotification(sociallinks, id, TeacherName, cNumber)

      const postData = {
         'to': allEmails[0],
         'cc': allEmails,
         'sub': 'Teacher Profile Update Notification',
         'msg': mailCont,
      }

      const emailRes = await sendEmail(postData)


      const logsData = {
         t_id: id,
         module: "Update Qualification",
         comment: `Upated Qualification details for ${id}`,
      };

      saveLogs(logsData, (err, result) => {
         if (err) {
            return res.status(500).json({ error: err });
         }

         return res.status(200).json({ message: "User Updated" });
         // Prepare notification data
         // const notificationData = {
         //    title: "Update Qualification",
         //    comment: "Upated Qualification details",
         //    t_id: id,
         // };

         // saveNotification(notificationData, (err, result) => {
         //    if (err) {
         //       return res.status(500).json({ error: err });
         //    }

         //    return res.status(200).json({ message: "User Updated" });
         // });
      });
   });
};

const updateBank = (req, res) => {
   const data = req.body.data;
   const userDeatils = req.user
   const id = userDeatils.user_id

   User.updateBank(data, id, async (err, result) => {
      if (err) {
         return res.status(500).json({ error: err });
      }

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: "User not found" });
      }

      const teacherstatus = await User.editteacherstatus(id);

      const sociallinks = await TeacherOther.social_links()

      if (!sociallinks) return res.status(400).json({ message: 'sociallinks not found' })

      const teacherDetails = await Posts.teacherDetails(id)
      const TeacherName = `${teacherDetails[0].t_fname} ${teacherDetails[0].t_lname}`
      const cNumber = teacherDetails[0].t_contactnum

      const title = "Teacher Profile Update"
      const Description = `Teacher(${id}) profile has been updated. Review the changes if necessary` 

      const admin_notifications = await TeacherOther.admin_notifications(title, Description, id)

      const emailList = await TeacherOther.get_admin()

      if (!emailList) return res.status(400).json({ message: 'Admins not found' })

      const allEmails = emailList.map((email) =>email.username)
     
      const mailCont = emailTemplate.teacherUpdateNotification(sociallinks, id, TeacherName, cNumber)

      const postData = {
         'to': allEmails[0],
         'cc': allEmails,
         'sub': 'Teacher Profile Update Notification',
         'msg': mailCont,
      }

      const emailRes = await sendEmail(postData)


      const logsData = {
         t_id: id,
         module: "Update Bank",
         comment: `Upated bank details for ${id}`,
      };

      saveLogs(logsData, (err, result) => {
         if (err) {
            return res.status(500).json({ error: err });
         }

         return res.status(200).json({ message: "User Updated" });
         // Prepare notification data
         // const notificationData = {
         //    title: "Update Bank",
         //    comment: "Upated bank details",
         //    t_id: id,
         // };

         // saveNotification(notificationData, (err, result) => {
         //    if (err) {
         //       return res.status(500).json({ error: err });
         //    }

         //    return res.status(200).json({ message: "User Updated" });
         // });
      });
   });
};

const changePassword = (req, res) => {
   const currentPassword = req.body.currentPassword;
   const newPassword = req.body.password;
   const userDeatils = req.user
   const id = userDeatils.user_id

   User.changePassword(id, currentPassword, newPassword, (err, result) => {
      if (err) {
         return res.status(500).json({ error: err });
      }

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: "User not found" });
      }

      const logsData = {
         t_id: id,
         module: "Update Passowrd",
         comment: `Upated Passowrd details for ${id}`,
      };

      saveLogs(logsData, (err, result) => {
         if (err) {
            return res.status(500).json({ error: err });
         }

         return res.status(200).json({ message: "User Updated" });

         // Prepare notification data
         // const notificationData = {
         //    title: "Update Passowrd",
         //    comment: "Upated Passowrd details",
         //    t_id: id,
         // };

         // saveNotification(notificationData, (err, result) => {
         //    if (err) {
         //       return res.status(500).json({ error: err });
         //    }

         //    return res.status(200).json({ message: "Password Changed" });

         // });
      });

   });
};

const setting = async (req, res) => {
   const setting = await SystemSettings.setting();

   try {
      if (setting.length === 0) {
         return res.status(404).json({ message: "System settings not found" });
      }

      return res
         .status(200)
         .json({ message: "System settings found", result: setting[0] });
   } catch (error) {
      console.error(error);
   }
};

const updateProfilepic = async (req, res) => {
   const userDeatils = req.user
   const id = userDeatils.user_id
   const file = req.file;
   console.log(file)
   if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
   }

   const form = new FormData();
   form.append("file", fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype,
   });
   form.append("client_id", "1001");
   form.append("api_key", "os-1121");
   form.append("module", "profile pic");
   form.append("module_id", id);

   try {
      const response = await axios.post(
         "http://file.ozonedesk.info/upload.php",
         form,
         {
            headers: {
               ...form.getHeaders(),
            },
         }
      );
      const { status, file_path, module, module_id } = response.data;
      console.log(response.data)
      if (status === 200 && module == "profile pic" && module_id == id) {
         const updatejoinClass = await User.changeProfilepic(id, file_path);

         if (updatejoinClass.affectedRows > 0) {
            const teacherstatus = await User.editteacherstatus(id);

            const logsData = {
               t_id: id,
               module: "Update Profile Pic",
               comment: `Upated profile pic details for ${id}`,
            };

            saveLogs(logsData, (err, result) => {
               if (err) {
                  return res.status(500).json({ error: err });
               }
               return res.status(200).json({ message: "User Updated" });
               // Prepare notification data
               // const notificationData = {
               //    title: "Update Profile Pic",
               //    comment: "Upated profile pic details",
               //    t_id: id,
               // };

               // saveNotification(notificationData, (err, result) => {
               //    if (err) {
               //       return res.status(500).json({ error: err });
               //    }

               //    return res.status(200).json({ message: "Profile Pic Updated Successfully" });

               // });
            });
         } else {
            return res
               .status(500)
               .json({ message: "Failed to Update Profile Pic" });
         }
      } else {
         return res.status(400).json({ message: "No file uploaded" });
      }
   } catch (error) {
      console.error("Error fetching messages:", error);
   }
};

const userSkill = async (req, res) => {
   const id = req.body.id;
   try {
      const result = await User.userSkill(id);

      if (result.length === 0) {
         return res.status(204).json({ message: "User skills not found" });
      }

      return res.status(200).json({ message: "User skills found", result });
   } catch (error) {
      console.log(error);
   }
};

const completeProfile = async (req, res) => {
   const file = req.file;

   const userDeatils = req.user
   const id = userDeatils.user_id

   const {
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
      qualification,
   } = req.body;



   try {
      if (file) {
         const form = new FormData();
         form.append("file", fs.createReadStream(file.path), {
            filename: file.originalname,
            contentType: file.mimetype,
         });
         form.append("client_id", "1001");
         form.append("api_key", "os-1121");
         form.append("module", "profile pic");
         form.append("module_id", id);

         try {
            const response = await axios.post(
               "http://file.ozonedesk.info/upload.php",
               form,
               {
                  headers: {
                     ...form.getHeaders(),
                  },
               }
            );
            const { status, file_path, module, module_id } = response.data;
            if (status === 200 && module == "profile pic" && module_id == id) {
               const postresult = await User.completeProfile(
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
               );

               if (postresult.affectedRows > 0) {

                  const teacherDetails = await Posts.teacherDetails(id)
                  const studentName = `${teacherDetails[0].t_fname} ${teacherDetails[0].t_lname}`
                  const email = teacherDetails[0].t_email

                  const sociallinks = await TeacherOther.social_links()

                  if (!sociallinks) return res.status(400).json({ message: 'sociallinks not found' })

                  const mailCont = emailTemplate.profileSubmittedEmail(studentName, email, sociallinks)

                  const postData = {
                     'to': email,
                     'sub': 'Profile Submitted Successfully',
                     'msg': mailCont,
                  }

                  const emailRes = await sendEmail(postData)

                  const logsData = {
                     t_id: id,
                     module: "Update Profile",
                     comment: `Upated Profile details for ${id}`,
                  };

                  saveLogs(logsData, (err, result) => {
                     if (err) {
                        return res.status(500).json({ error: err });
                     }

                     return res.status(200).json({ message: "User Updated" });

                     // Prepare notification data
                     // const notificationData = {
                     //    title: "Update Profile",
                     //    comment: "Upated Profile details",
                     //    t_id: id,
                     // };

                     // saveNotification(notificationData, (err, result) => {
                     //    if (err) {
                     //       return res.status(500).json({ error: err });
                     //    }

                     //    return res
                     //       .status(200)
                     //       .json({ message: "Update profile successfully" });
                     // });
                  });

               } else {
                  return res.status(500).json({ message: "Failed to add post " });
               }
            } else {
               return res.status(400).json({ message: "No file uploaded" });
            }
         } catch (error) {
            console.error("Error fetching messages:", error);
         }
      } else {
         const postresult = await User.completewithoutprofilepic(
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
         );

         if (postresult.affectedRows > 0) {

            const teacherDetails = await Posts.teacherDetails(id)
            const studentName = `${teacherDetails[0].t_fname} ${teacherDetails[0].t_lname}`
            const email = teacherDetails[0].t_email

            const sociallinks = await TeacherOther.social_links()

            if (!sociallinks) return res.status(400).json({ message: 'sociallinks not found' })

            const mailCont = emailTemplate.profileSubmittedEmail(studentName, email, sociallinks)

            const postData = {
               'to': email,
               'sub': 'Profile Submitted Successfully',
               'msg': mailCont,
            }

            const emailRes = await sendEmail(postData)

            const logsData = {
               t_id: id,
               module: "Update Profile",
               comment: `Upated Profile details for ${id}`,
            };

            saveLogs(logsData, (err, result) => {
               if (err) {
                  return res.status(500).json({ error: err });
               }
               
               return res.status(200).json({ message: "User Updated" });
               // Prepare notification data
               // const notificationData = {
               //    title: "Update Profile",
               //    comment: "Upated Profile details",
               //    t_id: id,
               // };

               // saveNotification(notificationData, (err, result) => {
               //    if (err) {
               //       return res.status(500).json({ error: err });
               //    }

               //    return res
               //       .status(200)
               //       .json({ message: "Update profile successfully" });
               // });
            });
         } else {
            return res.status(500).json({ message: "Failed to add post " });
         }
      }
   } catch (error) {
      console.log(error);
   }
};

const profileMessage = async (req, res) => {
   const id = req.body.id
   const status = await User.profileMessage(id)

   if (status.length === 0) {
      return res.status(404).json({ message: "User messages not found" });
   }

   return res.status(200).json({ message: "User messages found", result: status });
}


const systemSettings = async (req, res, next) => {

   try {
      const result = await User.systemSettings()

      if (result.length === 0) {
         return res.status(204).json({ message: "System settings not found" });
      }

      return res.status(200).json({ message: "System settings found", result: result[0] });
   } catch (error) {
      console.log(error)
   }
}

const userPrivate = async (req, res, next) => {
   const id = req.body.id
   const pro_status = req.body.pro_status

   try {
      const result = await User.userPrivate(id, pro_status)

      if (result.affectedRows > 0) {
         return res.status(200).json({ message: "User Private status updated successfully" });
      } else {
         return res.status(400).json({ message: "Failed to update user private status" });
      }
   } catch (error) {
      console.log(error)
   }
}


const forgotPassword = async (req, res, next) => {
   const email = req.body.email

   try {
      const result = await User.forgotPassword(email)

      if (result.length > 0) {

         const teacherDetails = await User.teacherDetails(email)
         const teacherName = `${teacherDetails[0].t_fname} ${teacherDetails[0].t_lname}`

         const resetEmailToken = jwt.sign(
            { email: email },
            process.env.RESET_EMAIL_TOKEN,
            { expiresIn: "1h" }
         );

         let resetLink = `${process.env.TEACHER_DEV_URL}/reset-password?token=${resetEmailToken}`;

         const sociallinks = await TeacherOther.social_links()

         if (!sociallinks) return res.status(400).json({ message: 'sociallinks not found' })

         const mailCont = emailTemplate.resetPassword(teacherName, resetLink, email, sociallinks)

         const postData = {
            'to': email,
            'sub': 'Teacher Portal Password Reset Request',
            'msg': mailCont,
         }
         console.log(resetLink)
         const emailRes = await sendEmail(postData)

         if (emailRes.status === 200) {
            return res.status(200).json({ message: "Please check your inbox to reset your password" });
         } else {
            return res.status(400).json({ message: "Failed to send email" });
         }



      } else {
         return res.status(400).json({ message: "User not found. Please check the email and try again." });
      }
   } catch (error) {
      console.log(error)
   }
}

function generateRandomNumber() {
   return Math.floor(1000 + Math.random() * 9000);
}

const resetPassword = async (req, res, next) => {
   const password = req.body.password
   const token = req.body.token

   jwt.verify(token, process.env.RESET_EMAIL_TOKEN, async (err, user) => {
      if (err) return res.status(403).json({ message: 'Reset password link expired. Please initiate the reset process again.' });

      const email = user.email

      const teacherDetails = await User.teacherDetails(email)
      const studentName = `${teacherDetails[0].t_fname} ${teacherDetails[0].t_lname}`

      bcrypt.hash(password, saltRounds, async function (err, hash) {
         if (err) return res.status(400).json({ message: err })

         const result = await User.resetPassword(hash, email)

         if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Password reset failed. Please try again." });
         }

         const sociallinks = await TeacherOther.social_links()

         if (!sociallinks) return res.status(400).json({ message: 'sociallinks not found' })

         const mailCont = emailTemplate.confirmPassword(studentName, email, sociallinks)

         const postData = {
            'to': email,
            'sub': 'Teacher Portal Password Changed',
            'msg': mailCont,
         }

         const emailRes = await sendEmail(postData)

         return res.status(200).json({
            message: "Password Reset Successful",
         })
      });

      ;
   });

}

const clearcompletemsg = async (req, res, next) => {
   const userDeatils = req.user
   const id = userDeatils.user_id

   try {
      const result = await User.clearcompletemsg(id)
      if (result.affectedRows > 0) {
         return res.status(200).json({ message: "User messages cleared successfully" });
      } else {
         return res.status(400).json({ message: "Failed to clear user messages" });
      }
   } catch (error) {
      console.log(error)
   }
}

const randomTeacher = async (req, res, next) => {
   try {
      const result = await User.randomTeacher()
   } catch (error) {
      console.log(error)
   }
}

const sendEmailVerify = async (req, res) => {
   const email = req.body.email

   const verifyEmailToken = jwt.sign(
      { email: email },
      process.env.RESET_EMAIL_TOKEN,
      { expiresIn: "1h" }
   );

   const teacherDetails = await User.teacherDetails(email)
   const clientName = `${teacherDetails[0].t_fname} ${teacherDetails[0].t_lname}`

   let verificationLink = `${process.env.TEACHER_DEV_URL}/teacher/email-verify?token=${verifyEmailToken}`;

   const sociallinks = await TeacherOther.social_links()

   if (!sociallinks) return res.status(400).json({ message: 'sociallinks not found' })

   const mailCont = emailTemplate.emailVerification(clientName, verificationLink, email, sociallinks)

   const postData = {
      'to': email,
      'cc': ['sparknamindu@gmail.com', 'manjitharock@gmail.com'],
      'sub': 'Verify Your Email',
      'msg': mailCont,
   }

   const emailRes = await sendEmail(postData)


   if (emailRes.status === 200) {
      return res.status(200).json({ message: "Please check your inbox to verify your email" });
   } else {
      return res.status(400).json({ message: "Failed to send email" });
   }
}

const verifyEmail = async (req, res, next) => {
   const token = req.body.token

   try {
      jwt.verify(token, process.env.RESET_EMAIL_TOKEN, async (err, user) => {
         if (err) return res.status(403).json({ message: 'Email verification link expired. Please initiate the reset process again.' });

         const email = user.email

         const result = await User.verifyEmail(email)

         if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Email verification failed. Please try again." });
         }

         return res.status(200).json({ message: "Email verification succesfully" });

      });

   } catch (error) {
      console.log(error)
   }
}

const unsubscribeVerifyEmail = async (req, res, next) => {
   const email = req.body.email
   try {
      const result = await User.unsubscribeVerifyEmail(email)

      if (result.affectedRows === 0) {
         return res.status(400).json({ message: "Unsubscribe failed. Please try again." });
      }

      return res.status(200).json({ message: "Unsubscribe succesfully" });

   } catch (error) {
      console.log(error)
   }
}

const emailSubscribe = async (req, res, next) => {
   const userDeatils = req.user
   const id = userDeatils.user_id
   const status = req.body.status
   try {
      const result = await User.emailSubscribe(status, id)

      if (result.affectedRows === 0) {
         return res.status(400).json({ message: "Subscribe failed. Please try again." });
      }

      return res.status(200).json({ message: "Subscribe succesfully" });

   } catch (error) {
      console.log(error)
   }
}

const allReviews = async (req, res) => {
   const userDeatils = req.user
   const id = userDeatils.user_id
   try {
      const result = await User.allReviews(id)

      return res.status(200).json({ message: "Success", result: result });
   } catch (error) {
      console.log(error)
   }
}

const TeacherNotification = async (req, res) => {
   const userDeatils = req.user
   const id = userDeatils.user_id

   try {
      const result = await User.TeacherNotifications(id)

      return res.status(200).json({ message: "Success", result: result });
   } catch (error) {
      console.log(error)
   }
}

const oneReadNoti = async (req, res) => {
   const noti_id = req.body.noti_id
   const t_id = req.body.id

   try {
      const result = await User.oneReadNoti(t_id, noti_id)

      return res.status(200).json({ message: "Success", result: result });
   } catch (error) {
      console.log(error)
   }
}

const allReadNoti = async (req, res) => {
  
   const id = req.body.id

   try {
      const result = await User.allReadNoti(id)

      return res.status(200).json({ message: "Success", result: result });
   } catch (error) {
      console.log(error)
   }
}

module.exports = {
   register,
   login,
   changePassword,
   getAllUsers,
   oneUser,
   updateUser,
   updateClass,
   updateAbout,
   updateBank,
   setting,
   token,
   updateProfilepic,
   userSkill,
   completeProfile,
   updateQualification,
   profileMessage,
   systemSettings,
   userPrivate,
   forgotPassword,
   clearcompletemsg,
   randomTeacher,
   verifyEmail,
   sendEmailVerify,
   resetPassword,
   unsubscribeVerifyEmail,
   emailSubscribe,
   allReviews,
   TeacherNotification, 
   allReadNoti,
   oneReadNoti
};
