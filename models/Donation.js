const mongoose = require('mongoose');

// Define the Donation schema
const donationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  phone: { 
    type: String, 
    required: true, 
    trim: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  causeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cause', 
    required: false,
    default: null 
  },
  customCause: {
    type: String,
    required: false,
    trim: true,
    default: null
  },
  message: { 
    type: String, 
    required: false,
    trim: true,
    default: ''
  },
  paymentId: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  receipt: { 
    type: String, 
    required: false,
    default: null 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false,
    default: null 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  aadharNumber: { 
    type: String, 
    required: false,
    trim: true,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || /^\d{12}$/.test(v);
      },
      message: 'Aadhar number must be 12 digits'
    }
  },
  panCardNumber: { 
    type: String, 
    required: false,
    trim: true,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: 'Invalid PAN card format'
    }
  }
}, { timestamps: true });

// Export Donation model
const Donation = mongoose.model('Donation', donationSchema);

module.exports = { Donation };
