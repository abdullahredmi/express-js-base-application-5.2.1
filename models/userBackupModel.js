const mongoose = require('mongoose');

const userBackupSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  mobile: String,
  token: String
}, { timestamps: true });

module.exports = mongoose.model('UserBackup', userBackupSchema);