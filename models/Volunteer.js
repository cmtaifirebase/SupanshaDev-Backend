const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  interests: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Pending'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  hours: {
    type: Number,
    default: 0
  },
  skills: {
    type: String,
    trim: true
  },
  events: [{
    eventName: String,
    location: String,
    date: Date,
    hours: Number,
    status: {
      type: String,
      enum: ['Completed', 'Upcoming'],
      default: 'Upcoming'
    }
  }],
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema); 