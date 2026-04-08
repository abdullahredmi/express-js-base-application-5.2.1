const express = require('express');
const router = express.Router();
const { getCourses, createCourse, getPurchasedCourses} = require('../controllers/courseController');
const { protect } = require('../middlewares/authMiddleware');

// GET /api/courses
router.get('/', protect, getCourses);
router.get('/cart', protect, getPurchasedCourses); // NEW ENDPOINT

// POST /api/courses
router.post('/', protect, createCourse);

module.exports = router;