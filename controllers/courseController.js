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

    return res.status(200).json({ message: "Course successfully", result });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  allCourse,
  oneCourse,
  enrollCourse,
  getenrollCourse,
  oneCourseEnroll,
  getAllCourses
};
