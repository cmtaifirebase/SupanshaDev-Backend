const Contact = require('../models/Contact');
const { z } = require('zod');

// Zod schema
const contactSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  subject: z.string().min(3),
  message: z.string().min(5)
});

// Create contact
exports.createContact = async (req, res) => {
  const result = contactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, errors: result.error.errors });
  }

  try {
    const contact = await Contact.create(result.data);
    res.status(201).json({
      message: "Message sent successfully. We'll get back to you soon!",
      contact
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
  }
};

// Get all contacts
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch contacts" });
  }
};

// Get single contact
exports.getSingleContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });
    res.status(200).json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch contact" });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: "Contact not found" });
    res.status(200).json({ success: true, message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete contact" });
  }
};
