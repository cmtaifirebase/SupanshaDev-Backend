const mongoose = require('mongoose');

const signatorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    signatureImage: { type: String }, // URL or File path
});

const eventSchema = new mongoose.Schema({
    organizerName: { type: String, required: true },
    organizationLogo: { type: String }, // URL
    websiteLink: { type: String },

    eventTitle: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    eventDescription: { type: String },
    eventType: { type: String },
    themeFocusArea: { type: String },
    objective: { type: String },
    targetAudience: [{ type: String }],

    expectedParticipants: { type: Number },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },

    location: {
        country: String,
        state: String,
        district: String,
        block: String,
        venueName: String,
        fullAddress: String,
        latitude: Number,
        longitude: Number,
    },

    totalPasses: { type: Number },
    isFreeEvent: { type: Boolean, default: true },
    autoAttendanceRequired: { type: Boolean, default: false },

    volunteerRolesNeeded: { type: String },
    needVolunteers: { type: Boolean, default: false },

    sponsorRequirements: { type: String },
    sponsorLogos: [{ type: String }], // Array of logo URLs
    sponsorLogoOrder: [{ type: String }], // Array of logo IDs or names

    certificateSettings: {
        enableCertificate: { type: Boolean, default: false },
        logoPosition: { type: String }, // e.g., 'top-left'
        logoSize: { type: String }, // e.g., 'small', 'medium'
        logoAlignment: { type: String }, // left, center, justified
        completionText: { type: String },
        signatories: [signatorySchema],
    },

    eventPoster: { type: String }, // URL
    eventDocuments: [{ type: String }], // Array of document URLs

    approvalStatus: { type: String, enum: ['Draft', 'Pending', 'Approved'], default: 'Pending' },
    displayOnWebsite: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who created
}, {
    timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
