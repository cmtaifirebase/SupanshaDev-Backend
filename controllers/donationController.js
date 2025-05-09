const {Donation} = require('../models/Donation');
const { z } = require('zod');

const donationSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  amount: z.number().positive(),
  causeId: z.string().optional().nullable(),
  customCause: z.string().optional().nullable(),
  message: z.string().optional().default(''),
  paymentId: z.string().min(3),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  receipt: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
  aadharNumber: z.string().optional().nullable(),
  panCardNumber: z.string().optional().nullable()
});


// Create Donation
exports.createDonation = async (req, res) => {
  const result = donationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, errors: result.error.errors });
  }

  try {
    const donation = await Donation.create(result.data);
    res.status(201).json({
      message: "Donation successful",
      donation
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to process donation", error: err.message });
  }
};

// Get all Donations
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch donations" });
  }
};

// Get updateDonation
exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update donation" });
  }
}

// Get single donation
exports.getSingleDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });
    res.status(200).json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch donation" });
  }
};

// Delete donation
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });
    res.status(200).json({ success: true, message: "Donation deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete donation" });
  }
};

// getDonationOverview
exports.getDonationOverview = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch donation overview" });
  }
} 

// Get total Donation
exports.getTotalDonation = async (req, res) => {
  try {
    // Current date and dates for 30 and 60 days ago
    const currentDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(currentDate.getDate() - 60);

    // Get total donations
    const totalResult = await Donation.aggregate([
      {
        $match: {
          status: 'completed' // Only count completed donations
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        }
      }
    ]);

    // Get donations from last 30 days
    const last30DaysResult = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
        }
      }
    ]);

    // Get donations from previous 30 days (30-60 days ago)
    const prev30DaysResult = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
        }
      }
    ]);

    // Get donations from last 60 days
    const last60DaysResult = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
        }
      }
    ]);

    // Get donations from previous 60 days (60-120 days ago)
    const prev60DaysResult = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { 
            $gte: new Date(new Date().setDate(currentDate.getDate() - 120)),
            $lt: sixtyDaysAgo
          }
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
        }
      }
    ]);

    // Extract amounts (default to 0 if no results)
    const totalAmount = totalResult[0]?.totalAmount || 0;
    const last30DaysAmount = last30DaysResult[0]?.amount || 0;
    const prev30DaysAmount = prev30DaysResult[0]?.amount || 0;
    const last60DaysAmount = last60DaysResult[0]?.amount || 0;
    const prev60DaysAmount = prev60DaysResult[0]?.amount || 0;

    // Calculate percentage changes
    const thirtyDayChange = prev30DaysAmount > 0 
      ? ((last30DaysAmount - prev30DaysAmount) / prev30DaysAmount * 100).toFixed(1)
      : (last30DaysAmount > 0 ? "100.0" : "0.0");
    
    const sixtyDayChange = prev60DaysAmount > 0 
      ? ((last60DaysAmount - prev60DaysAmount) / prev60DaysAmount * 100).toFixed(1)
      : (last60DaysAmount > 0 ? "100.0" : "0.0");

    res.status(200).json({ 
      success: true, 
      totalAmount,
      thirtyDayStats: {
        change: `${thirtyDayChange.startsWith('-') ? '' : '+'}${thirtyDayChange}%`,
        description: "Last 30 days"
      },
      sixtyDayStats: {
        change: `${sixtyDayChange.startsWith('-') ? '' : '+'}${sixtyDayChange}%`,
        description: "Last 60 days"
      }
    });
  } catch (err) {
    console.error('Error fetching donation statistics:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch donation statistics" 
    });
  }
};


exports.getDonationByCause = async (req, res) => {
  try {
    // Get total donations with status 'completed'
    const totalResult = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const totalAmount = totalResult[0]?.totalAmount || 1;

    // Donations grouped by cause
    const causeResults = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          causeId: { $ne: null }
        }
      },
      {
        $lookup: {
          from: 'causes',
          localField: 'causeId',
          foreignField: '_id',
          as: 'cause'
        }
      },
      { $unwind: '$cause' },
      {
        $group: {
          _id: '$cause.name',
          amount: { $sum: '$amount' },
          causeId: { $first: '$cause._id' }
        }
      },
      {
        $project: {
          name: '$_id',
          amount: 1,
          causeId: 1,
          percentage: {
            $round: [{ $multiply: [{ $divide: ['$amount', totalAmount] }, 100] }, 0]
          },
          _id: 0
        }
      },
      { $sort: { amount: -1 } }
    ]);

    // Donations without cause (general fund)
    const generalFund = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          causeId: null
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' }
        }
      }
    ]);

    if (generalFund.length > 0) {
      causeResults.push({
        name: 'General Fund',
        amount: generalFund[0].amount,
        percentage: Math.round((generalFund[0].amount / totalAmount) * 100),
        causeId: null
      });
    }

    res.status(200).json({
      success: true,
      data: causeResults
    });
  } catch (err) {
    console.error('Error in getDonationByCause:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation data by cause'
    });
  }
};

// Get User Donations
exports.getUserDonations = async (req, res) => {
  try {
    // Check if user is requesting their own donations
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only view your own donations" 
      });
    }

    const donations = await Donation.find({ 
      userId: req.params.userId 
    })
    .sort({ createdAt: -1 })
    .populate('causeId', 'name description');

    res.status(200).json({ 
      success: true, 
      donations 
    });
  } catch (err) {
    console.error('Error fetching user donations:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch donations" 
    });
  }
};
