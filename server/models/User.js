const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  authType: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  passwordHash: String,  // only if "local"
  googleId: String,       // only if "google"
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);