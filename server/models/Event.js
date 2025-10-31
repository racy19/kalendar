const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: String,
  
    // creator of the event 
    userId: {
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
    },
    
    // array of possible dates and user votes
    options: [
      {
        date: {
          type: String,
          required: true
        },
        votes: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              required: true
            },
            status: {
              type: String,
              enum: ['yes', 'no', 'maybe'],
              required: true
            },
            note: {
              type: String, // optional field for user to add notes to their vote
              required: false
            }
          }
        ]
      }
    ],

    invitedUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        status: {
          type: String,
          enum: ['invited', 'accepted', 'declined'], // for now is used only 'invited', other statuses can be added later
          default: 'invited'
        }
      } 
    ]
  });

  module.exports = mongoose.model('Event', eventSchema);