const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Organization
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

const jobApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  fatherOrHusbandName: { type: String, required: true },
  associationType: { type: String, required: true }, // Volunteer, Employee, etc.
  educationQualification: { type: String, required: true },
  totalWorkExperience: { type: Number, required: true },
  mobileNumbers: [{ type: String, required: true }], // Array for (i) and (ii)
  email: { type: String, required: true },
  references: [{
    name: { type: String, required: true },
    mobile: { type: String, required: true }
  }],
  address: { type: String, required: true },
  pin: { type: String, required: true },
  aadhaarNumber: { type: String, required: true },
  pan: { type: String },
  dlNo: { type: String },
  interestedAreas: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  signature: { type: String },
  attachedFiles: [{ type: String }], // URLs or file references
  applicationStatus: { type: String, enum: ['pending', 'shortlisted', 'rejected', 'selected'], default: 'pending' },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = { Job, JobApplication };
