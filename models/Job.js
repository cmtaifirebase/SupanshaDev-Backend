const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: String }, // Optional
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    applyLink: { type: String }, // External application link
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who posted the job
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
