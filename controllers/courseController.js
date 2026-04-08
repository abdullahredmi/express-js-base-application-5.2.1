const Course = require('../models/courseModel');
const Payment = require('../models/paymentModel');

// GET all courses
const getCourses = async (req, res, next) => {
  try {

    const userId = req.user._id;

    // user purchased courses
    const purchased = await Payment.find({
      userId,
      status: "success"
    }).select("courseId");

    const purchasedCourseIds = purchased.map(p => p.courseId.toString());

    // all courses
    const courses = await Course.find();

    // add purchased flag
    const updatedCourses = courses.map(course => ({
      ...course.toObject(),
      purchased: purchasedCourseIds.includes(course._id.toString())
    }));

    res.status(200).json({
      message: 'Courses fetched successfully!',
      status: 'success',
      statusCode: 200,
      data: updatedCourses
    });

  } catch (err) {
    next(err);
  }
};

// POST new course
const createCourse = async (req, res) => {
  try {
    const { title, description, duration, level } = req.body;
    await Course.create({ title, description, duration, level });

    res.status(201).json({
      message: 'Course created successfully!',
      status: 'success',
      statusCode: 201
    }); // POST → only message + status
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: 'error',
      statusCode: 500
    });
  }
};

const getPurchasedCourses = async (req, res, next) => {
  try {

    const userId = req.user._id;

    // find successful payments
    const payments = await Payment.find({
      userId,
      status: "success"
    }).populate("courseId");

    // extract courses
    const courses = payments.map(payment => payment.courseId);

    if(courses.length === 0) {
      return res.status(200).json({
        message: "No courses purchased yet",
        status: "failed",
        statusCode: 400,
        data: []
      });
    }

    res.status(200).json({
      message: "Purchased courses fetched successfully",
      status: "success",
      statusCode: 200,
      data: courses
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { getCourses, createCourse, getPurchasedCourses };