const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  mobile: {
    type: String,
    required: true
  },

  razorpay_order_id: {
    type: String
  },

  razorpay_payment_id: {
    type: String
  },

  razorpay_signature: {
    type: String
  },

  amount: {
    type: Number,
    required: true
  },

  currency: {
    type: String,
    default: "INR"
  },

  status: {
    type: String,
    enum: ["created", "success", "failed"],
    default: "created"
  },

  paidAt: {
    type: Date
  }

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);