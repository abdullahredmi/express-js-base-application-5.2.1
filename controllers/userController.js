const User = require('../models/userModel');
const UserBackup = require('../models/userBackupModel');
const jwt = require('jsonwebtoken');


// GET USERS
const getUsers = async (req, res, next) => {
  try {

    const users = await User.find();
    res.status(200).json({
      status: "success",
      data: users
    });

  } catch (err) {
    next(err);
  }
};

// CREATE USER
const createUser = async (req, res, next) => {
  try {

    const { name, email, mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        message: "Mobile number required"
      });
    }

    // mobile check
    let user = await User.findOne({ mobile });

    // USER EXIST
    if (user) {

      return res.status(200).json({
        message: "User data fetched successfully",
        token: user.token,
        status: "success",
        statusCode: 200
      });

    }

    // NEW TOKEN
    const token = jwt.sign(
      { mobile },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    // CREATE USER (dummy name & email)
    user = await User.create({
      name: name || "Guest User",
      email: email || `guest${Date.now()}@mail.com`,
      mobile,
      token
    });

    // BACKUP INSERT
    await UserBackup.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      token: user.token
    });

    res.status(201).json({
      message: "User created successfully",
      token: token,
      status: "success",
      statusCode: 200
    });

  } catch (err) {
    next(err);
  }
};

// UPDATE USER
const updateUser = async (req, res, next) => {
  try {

    const { name, email, mobile } = req.body;

    const token = req.headers.authorization.split(' ')[1];

    if (!mobile) {
      return res.status(400).json({
        message: "Invalid Mobile number",
        status: "error",
        statusCode: 400 
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Unable to update user - email required",
        status: "error",
        statusCode: 400 
      });
    }
    // USER FIND WITH TOKEN
    const user = await User.findOne({ mobile, token });

    if (!user) {
      return res.status(400).json({
        message: "Unable to update user",
        status: "error",
        statusCode: 400
      });
    }

    // BACKUP OLD DATA
    await UserBackup.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      token: user.token
    });

    // NEW TOKEN
    const newToken = jwt.sign(
      {
        name: name || user.name,
        email: email || user.email,
        mobile
      },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    // UPDATE USER
    user.name = name || user.name;
    user.email = email || user.email;
    user.token = newToken;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      token: newToken,
      status: "success",
      statusCode: 200
    });

  } catch (err) {
    next(err);
  }
};

const getUserByMobile = async (req, res, next) => {
  try {

    const { mobile } = req.params;

    if (!mobile) {
      return res.status(400).json({
        message: "Mobile number required",
        status: "error"
      });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: "error"
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
      message: "User fetched successfully"
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  getUserByMobile
};