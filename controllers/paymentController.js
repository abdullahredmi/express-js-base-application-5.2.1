const Razorpay = require("razorpay");
const crypto = require("crypto");
const Course = require("../models/courseModel");
const Payment = require("../models/paymentModel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (req, res) => {
  try {

    const { courseId, mobile } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
        status: "error",
        statusCode: 404
      });
    }
    const price = course.price;
    const existing = await Payment.findOne({ userId, courseId, status: "success"});

    if (existing) {
      return res.json({
        message: "Course already purchased",
        status: "success",
        statusCode: 200
      });
    }

    const options = {
      amount: price * 100,
      currency: "INR",
      receipt: `course_${course._id}_${Date.now()}`
    };

    const pending = await Payment.findOne({ userId, courseId, status: "created" });

    if (pending) {
        return res.json({
            message: "Payment already initiated",
            orderId: pending.razorpay_order_id,
            status: "success"
        });
    }

    const order = await razorpay.orders.create(options);

    // SAVE PAYMENT
    await Payment.create({ userId, courseId, mobile, amount: price, razorpay_order_id: order.id, status: "created" });

    res.json({
      message: "Order created successfully",
      order, course,
      status: "success",
      statusCode: 200
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
      status: "error",
      statusCode: 500
    });
  }
};

const verifyPayment = async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const payment = await Payment.findOne({ razorpay_order_id });
    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
        status: "error",
        statusCode: 404
      });
    }

    if (payment.status === "success") {
        return res.json({
            message: "Payment already verified",
            status: "success",
            statusCode: 200
        });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {

      await Payment.findOneAndUpdate( { razorpay_order_id },
        {
          razorpay_payment_id,
          razorpay_signature,
          status: "success",
          paidAt: new Date()
        }
      );

      return res.json({
        message: "Payment verified successfully",
        status: "success",
        statusCode: 200
      });

    } else {

      await Payment.findOneAndUpdate(
        { razorpay_order_id },
        { status: "failed" }
      );

      return res.status(400).json({
        message: "Payment verification failed",
        status: "error",
        statusCode: 400
      });
    }

  } catch (err) {
    res.status(500).json({
        error: err.message,
        status: "error",
        statusCode: 500
    });
  }
};

module.exports = { createOrder, verifyPayment };