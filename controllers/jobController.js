const { Job, JobApplication } = require('../models/Job');
const { z } = require('zod');
const User = require('../models/User');

// Job posting schema (for organizations)
const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
});

// Job application schema (for individuals)
const createJobApplicationSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  fatherOrHusbandName: z.string().min(1, 'Father/Husband Name is required'),
  associationType: z.string().min(1, 'Association Type is required'),
  educationQualification: z.string().min(1, 'Educational Qualification is required'),
  totalWorkExperience: z.number().min(0, 'Total Work Experience is required'),
  mobileNumbers: z.array(z.string().min(10)).min(1, 'At least one mobile number is required'),
  email: z.string().email('Valid Email is required'),
  references: z.array(z.object({
    name: z.string().min(1, 'Reference Name is required'),
    mobile: z.string().min(10, 'Reference Mobile is required')
  })).min(1, 'At least one reference is required'),
  address: z.string().min(1, 'Address is required'),
  pin: z.string().min(1, 'PIN is required'),
  aadhaarNumber: z.string().min(1, 'AADHAAR Number is required'),
  pan: z.string().optional(),
  dlNo: z.string().optional(),
  interestedAreas: z.array(z.string()).optional(),
  signature: z.string().optional(),
  attachedFiles: z.array(z.string()).optional(),
  jobId: z.string().optional(),
});

const updateJobApplicationSchema = createJobApplicationSchema.partial();

// Organization: Create Job Posting
exports.createJob = async (req, res) => {
    try {
    if (!req.user || (req.user.accountType !== 'organization' && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Only organizations or admins can post jobs.' });
    }
    // Admins have no limit
    if (req.user.role !== 'admin') {
      if (!req.user.isPaidMember && req.user.jobPostsThisYear >= 2) {
        return res.status(403).json({ success: false, message: 'Free job post limit reached. Upgrade to paid membership to post more jobs.' });
      }
    }
        const result = createJobSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ success: false, errors: result.error.errors });
        }
    const job = await Job.create({ ...result.data, postedBy: req.user._id });
    // Increment jobPostsThisYear for non-admins
    if (req.user.role !== 'admin') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { jobPostsThisYear: 1 } });
    }
    res.status(201).json({ success: true, job });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Individual: Apply to Job
exports.createJobApplication = async (req, res) => {
  try {
    if (!req.user || req.user.accountType !== 'individual') {
      return res.status(403).json({ success: false, message: 'Only individuals can apply to jobs.' });
    }
    // Check free application limit
    if (!req.user.isUpgraded && req.user.jobApplicationsThisYear >= 2) {
      return res.status(403).json({ success: false, message: 'Free application limit reached. Upgrade to apply to more jobs.' });
    }
    const result = createJobApplicationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, errors: result.error.errors });
    }
    const jobAppData = result.data;
    jobAppData.applicantId = req.user._id;
    if (jobAppData.jobId) {
      jobAppData.jobId = jobAppData.jobId;
    }
    const newJobApp = await JobApplication.create(jobAppData);
    // Add application to Job's applicants array
    if (jobAppData.jobId) {
      await Job.findByIdAndUpdate(jobAppData.jobId, { $push: { applicants: newJobApp._id } });
    }
    // Increment jobApplicationsThisYear
    await User.findByIdAndUpdate(req.user._id, { $inc: { jobApplicationsThisYear: 1 } });
    res.status(201).json({ success: true, jobApplication: newJobApp });
  } catch (error) {
    console.error('Error creating job application:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Organization: View applicants for a job
exports.getApplicantsForJob = async (req, res) => {
  try {
    if (!req.user || (req.user.accountType !== 'organization' && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Only organizations or admins can view applicants.' });
    }
    const job = await Job.findById(req.params.jobId).populate('applicants');
    // Admins can view any job's applicants
    if (req.user.role !== 'admin') {
      if (!job || String(job.postedBy) !== String(req.user._id)) {
        return res.status(404).json({ success: false, message: 'Job not found or not authorized.' });
      }
    }
    res.status(200).json({ success: true, applicants: job.applicants });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Organization: Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    if (!req.user || req.user.accountType !== 'organization') {
      return res.status(403).json({ success: false, message: 'Only organizations can update application status.' });
    }
    const { applicationId, status } = req.body;
    if (!['pending', 'shortlisted', 'rejected', 'selected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    // Check if the organization owns the job
    const job = await Job.findById(application.jobId);
    if (!job || String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    application.applicationStatus = status;
    await application.save();
    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Individual: View my job applications and their status
exports.getMyApplications = async (req, res) => {
  try {
    if (!req.user || req.user.accountType !== 'individual') {
      return res.status(403).json({ success: false, message: 'Only individuals can view their applications.' });
    }
    const applications = await JobApplication.find({ applicantId: req.user._id });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get All Job Applications (for admin: all jobs, for org: only their jobs)
exports.getAllJobApplications = async (req, res) => {
  try {
    let jobs;
    if (req.user && req.user.role === 'admin') {
      jobs = await Job.find().populate('applicants');
    } else if (req.user && req.user.accountType === 'organization') {
      jobs = await Job.find({ postedBy: req.user._id }).populate('applicants');
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get Single Job Application
exports.getSingleJobApplication = async (req, res) => {
    try {
        const jobApplication = await JobApplication.findById(req.params.id);
        if (!jobApplication) {
            return res.status(404).json({ success: false, message: 'Job Application not found' });
        }
        res.status(200).json({ success: true, jobApplication });
    } catch (error) {
        console.error('Error fetching job application:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Update Job Application
exports.updateJobApplication = async (req, res) => {
    try {
        const result = updateJobApplicationSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ success: false, errors: result.error.errors });
        }
        const updatedJobApp = await JobApplication.findByIdAndUpdate(req.params.id, result.data, { new: true });
        if (!updatedJobApp) {
            return res.status(404).json({ success: false, message: 'Job Application not found' });
        }
        res.status(200).json({ success: true, jobApplication: updatedJobApp });
    } catch (error) {
        console.error('Error updating job application:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Delete Job Application
exports.deleteJobApplication = async (req, res) => {
    try {
        const deletedJobApp = await JobApplication.findByIdAndDelete(req.params.id);
        if (!deletedJobApp) {
            return res.status(404).json({ success: false, message: 'Job Application not found' });
        }
        res.status(200).json({ success: true, message: 'Job Application deleted' });
    } catch (error) {
        console.error('Error deleting job application:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
