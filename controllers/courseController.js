const Course = require("../models/courseModels");

const allCourse = async (req, res) => {
  try {
    const result = await Course.getAllCourse();

    return res.status(200).json({ message: "Course successfully", result });
  } catch (error) {
    console.log(error);
  }
};

const oneCourse = async (req, res) => {
  const id = req.body.id;
  const userDeatils = req.user;
  const user_id = userDeatils.user_id;
  try {
    const result = await Course.getOneCourse(id);

    if (result.length === 0)
      return res.status(404).json({ message: "Course not found" });

    const checkPermission = await Course.checkPermission(user_id, id);

    const updatedResult = {
      ...result[0],
      enroll: checkPermission.length > 0
    };
      

    return res
      .status(200)
      .json({ message: "Course successfully", result: updatedResult });
  } catch (error) {
    console.log(error);
  }
};

const enrollCourse = async (req, res) => {
  const id = req.body.id;
  const userDeatils = req.user;
  const user_id = userDeatils.user_id;
  try {
    const result = await Course.postenrollCourse(id, user_id);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Course not found" });

    return res.status(200).json({ message: "Enroll successfully" });
  } catch (error) {
    console.log(error);
  }
};

const getenrollCourse = async (req, res) => {
  const userDeatils = req.user;
  const user_id = userDeatils.user_id;

  try {
    const result = await Course.getEnrollCourse(user_id);

    if (result.length === 0)
      return res.status(404).json({ message: "Course not found" });

    return res.status(200).json({ message: "Enroll successfully", result });
  } catch (error) {
    console.log(error);
  }
};

const oneCourseEnroll = async (req, res) => {
  const id = req.body.id;
  const userDeatils = req.user;
  const user_id = userDeatils.user_id;
  try {
    const checkPermission = await Course.checkPermission(user_id, id);

    if (checkPermission.length === 0)
      return res.status(400).json({ message: "No Permission" });

    const result = await Course.oneCourseEnroll(id);

    if (result.length === 0)
      return res.status(404).json({ message: "Course not found" });

    const course = result[0];
    course.video_urls = JSON.parse(course.video_urls); 

    return res
      .status(200)
      .json({ message: "Course successfully", result: result[0] });
  } catch (error) {
    console.log(error);
  }
};

const getAllCourses = async (req, res) => {
  const userDeatils = req.user;
  const user_id = userDeatils.user_id;
  
  try {
    const result = await Course.getAllCourses();

    if (result.length === 0) return res.status(404).json({ message: "Course not found" });
    // Decode the videoUrl field for each course
    const processedResult = result.map(course => ({
      ...course,
      
      video_urls: course.video_urls ? JSON.parse(course.video_urls) : [], // Parse if valid
    }));

    return res.status(200).json({ message: "Courses retrieved successfully", result: processedResult });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateStudentCourse = async (req, res) => {
  const userDetails = req.user;
  const user_id = userDetails.user_id;

  const { 
    id, 
    name, 
    description, 
    instructor, 
    duration, 
    start_date, 
    end_date, 
    price, 
    status,
    video
  } = req.body;

  try {
    // Update course details in the database
    const result = await Course.updateStudentCourse(id, name, description, instructor, duration, start_date, end_date, price, status, video);

    // Check if no rows were updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not updated" });
    }

    // Return success response
    return res.status(200).json({ message: "Course updated successfully" });
  } catch (error) {
    // Log the error and send a server error response
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateVideos = async (req, res) => {
  const userDetails = req.user;
  const user_id = userDetails.user_id;

  const { 
    id, 
    videos
  } = req.body;

  const jsonVideo = JSON.stringify(videos);

  try {
    // Update course details in the database
    const result = await Course.updateVideos(id, jsonVideo);

    // Check if no rows were updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not updated" });
    }

    // Return success response
    return res.status(200).json({ message: "Course updated successfully" });
  } catch (error) {
    // Log the error and send a server error response
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addCourse = async (req, res) => {
  const userDetails = req.user;
  const user_id = userDetails.user_id;
  const { name, description, instructor, duration, start_date, end_date, price, video, video_urls } = req.body;

  try {
    // Insert into the database (assuming you're using a function called 'Courses.Register' for course registration)
    const result = await Course.addCourse({
      name,
      description,
      instructor,
      duration,
      start_date,
      end_date,
      price,
      video,
      video_urls
    });

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Course registration failed" });
    }

    return res.status(201).json({ message: "Course registration successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
};

const AllEnrollment = async (req, res) => {

  const userDeatils = req.user;
  const user_id = userDeatils.user_id;

  try {
    const result = await Course.AllEnrollment();

    if (result.length === 0)
      return res.status(404).json({ message: "Course not found" });

    return res
      .status(200)
      .json({ message: "Course successfully", result: result });
  } catch (error) {
    console.log(error);
  }
};

const updateEnrollment = async (req, res) => {

  const userDeatils = req.user;
  const user_id = userDeatils.user_id;
  const { id, course_id, student_id, status } = req.body

  try {
    const result = await Course.updateEnrollment(id, course_id, student_id, status);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "not Updated" });

    return res
      .status(200)
      .json({ message: "Course successfully" });
  } catch (error) {
    console.log(error);
  }
};

const addEnrollment = async (req, res) => {

  const userDeatils = req.user;
  const user_id = userDeatils.user_id;
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  try {
    const checkemail = await Course.findemail(email);

    if (checkemail.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, saltRounds);
 
    // Call the database function to register the student
    const result = await Students.Register(email, hash, name);

    if (result.affectedRows === 0)
      return res.status(400).json({ message: "Registration failed" });

    return res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.log(error);
  }
}

const addEnrolment= async (req, res) => {
  const userDetails = req.user;
  const user_id = userDetails.user_id;
  const { student, course } = req.body;

  try {
    // Insert into the database (assuming you're using a function called 'Courses.Register' for course registration)
    const result = await Course.addEnrolment(student, course);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Course registration failed" });
    }

    return res.status(201).json({ message: "Course registration successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "An error occurred" });
  }
};

module.exports = {
  allCourse,
  oneCourse,
  enrollCourse,
  getenrollCourse,
  oneCourseEnroll,
  getAllCourses,
  updateStudentCourse, 
  updateVideos,
  addCourse,
  AllEnrollment,
  updateEnrollment,
  addEnrolment
};
