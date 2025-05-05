const Job = require('../models/Job');
const { z } = require('zod');

const createJobSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    company: z.string().min(1, "Company is required"),
    location: z.string().min(1, "Location is required"),
    salary: z.string().optional(),
    jobType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']).optional(),
    applyLink: z.string().url("Apply link must be a valid URL").optional(),
});

const updateJobSchema = createJobSchema.partial(); // All fields optional during update


// Create Job
exports.createJob = async (req, res) => {
    try {
        const result = createJobSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ success: false, errors: result.error.errors });
        }

        const jobData = result.data;
        jobData.postedBy = req.user._id;

        const newJob = await Job.create(jobData);
        res.status(201).json({ success: true, job: newJob });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get All Jobs
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get Single Job
exports.getSingleJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.status(200).json({ success: true, job });
    } catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update Job
exports.updateJob = async (req, res) => {
    try {
        const result = updateJobSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ success: false, errors: result.error.errors });
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, result.data, { new: true });
        if (!updatedJob) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.status(200).json({ success: true, job: updatedJob });
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Delete Job
exports.deleteJob = async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);
        if (!deletedJob) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.status(200).json({ success: true, message: 'Job deleted' });
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
