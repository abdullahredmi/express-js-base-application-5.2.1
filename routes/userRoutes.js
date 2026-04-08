const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, getUserByMobile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getUsers);
router.post('/', createUser);
router.put('/', protect, updateUser); 
router.get('/:mobile', protect, getUserByMobile);

module.exports = router;