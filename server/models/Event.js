const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: String,
  
    // possible dates for the event
    dates: {
      type: [Date],
      required: true
    },
  
    // user 
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
  
    createdAt: {
      type: Date,
      default: Date.now
    },

    publicId: {
      type: String,
      unique: true,
      required: true
    }
  });

  module.exports = mongoose.model('Event', eventSchema);