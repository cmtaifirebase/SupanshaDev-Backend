const Blog = require('../models/Blog');
const slugify = require('slugify');
const { z } = require('zod');

const createBlogSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    category: z.string().min(2, "Category is required"),
    content: z.string().min(100, "Content must be at least 100 characters"),
    status: z.enum(["Draft", "Review", "Published"]).optional(),
    publishDate: z.string().optional(),
    metaDescription: z.string().max(160, "Meta Description must be under 160 characters").optional(),
    seoKeywords: z.array(z.string()).max(10).optional(),
    tags: z.array(z.string()).max(7).optional(),
    schemaTags: z.array(z.string()).optional(),
    audioField: z.boolean().optional(),
    videoField: z.string().url("Must be a valid URL").optional()
  });
  
const updateBlogSchema = createBlogSchema.partial();

exports.createBlog = async (req, res) => {
  try {
    const result = createBlogSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: result.error.errors });
    }

    const { title, content } = result.data;

    const slug = slugify(title, { lower: true });
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res.status(409).json({ success: false, message: "Slug already exists" });
    }

    const estimatedReadTime = `${Math.ceil(content.split(' ').length / 200)} min read`;

    const newBlog = new Blog({
      ...result.data,
      slug,
      authorId: req.user.id,
      estimatedReadTime
    });

    const saved = await newBlog.save();
    res.status(201).json({ success: true, blog: saved });

  } catch (error) {
    console.error("Blog creation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch blogs" });
  }
};

exports.getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    res.status(200).json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch blog" });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const result = updateBlogSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: result.error.errors });
    }

    const updates = result.data;
    if (updates.title) {
      updates.slug = slugify(updates.title, { lower: true });
      updates.estimatedReadTime = `${Math.ceil(updates.content.split(' ').length / 200)} min read`;
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, blog: updated });

  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update blog" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    res.status(200).json({ success: true, message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete blog" });
  }
};
