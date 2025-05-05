const Event = require('../models/Event');
const { z } = require('zod');

// Validation Schema
const signatorySchema = z.object({
    name: z.string().min(1, "Signatory name is required"),
    designation: z.string().min(1, "Designation is required"),
    signatureImage: z.string().optional(),
});

const certificateSettingsSchema = z.object({
    enableCertificate: z.boolean().optional(),
    logoPosition: z.string().optional(),
    logoSize: z.string().optional(),
    logoAlignment: z.string().optional(),
    completionText: z.string().optional(),
    signatories: z.array(signatorySchema).optional(),
});

const eventSchema = z.object({
    organizerName: z.string().min(1, "Organizer Name is required"),
    organizationLogo: z.string().optional(),
    websiteLink: z.string().url().optional(),

    eventTitle: z.string().min(1, "Event Title is required"),
    eventDescription: z.string().optional(),
    eventType: z.string().optional(),
    themeFocusArea: z.string().optional(),
    objective: z.string().optional(),
    targetAudience: z.array(z.string()).optional(),

    expectedParticipants: z.number().optional(),
    startDateTime: z.string().datetime({ offset: true }),
    endDateTime: z.string().datetime({ offset: true }).optional(),

    location: z.object({
        country: z.string().optional(),
        state: z.string().optional(),
        district: z.string().optional(),
        block: z.string().optional(),
        venueName: z.string().optional(),
        fullAddress: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
    }).optional(),

    totalPasses: z.number().optional(),
    isFreeEvent: z.boolean().optional(),
    autoAttendanceRequired: z.boolean().optional(),

    volunteerRolesNeeded: z.string().optional(),
    needVolunteers: z.boolean().optional(),

    sponsorRequirements: z.string().optional(),
    sponsorLogos: z.array(z.string()).optional(),
    sponsorLogoOrder: z.array(z.string()).optional(),

    certificateSettings: certificateSettingsSchema.optional(),

    eventPoster: z.string().optional(),
    eventDocuments: z.array(z.string()).optional(),

    approvalStatus: z.enum(["Draft", "Pending", "Approved"]).optional(),
    displayOnWebsite: z.boolean().optional(),
});

// Create Event
exports.createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        eventData.createdBy = req.user._id; // Assuming user added by auth middleware

        // Validate using Zod
        const validatedData = eventSchema.parse(eventData);

        const newEvent = await Event.create(validatedData);
        res.status(201).json({ success: true, event: newEvent });
    } catch (error) {
        console.error('Error creating event:', error);
        
        if (error.name === 'ZodError') {
            return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
        }

        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get all Events (Admin / Public)
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json({ success: true, events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get Single Event
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event Not Found' });

        res.status(200).json({ success: true, event });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Approve Event
exports.approveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event Not Found' });

        event.approvalStatus = 'Approved';
        event.displayOnWebsite = true;
        await event.save();

        res.status(200).json({ success: true, message: 'Event Approved', event });
    } catch (error) {
        console.error('Error approving event:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// Update Event
exports.updateEvent = async (req, res) => {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedEvent) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      res.status(200).json({ success: true, event: updatedEvent });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };
  
  // Delete Event
  exports.deleteEvent = async (req, res) => {
    try {
      const event = await Event.findByIdAndDelete(req.params.id);
      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }
      res.status(200).json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };
  