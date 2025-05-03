const { Donation, Cause } = require('../models/Donation');

exports.getRecentActivities = async (req, res) => {
  try {
    const recentDonations = await Donation.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('causeId', 'name')
      .lean();

    const activities = recentDonations.map((donation) => ({
      title: 'New Donation Received',
      description: `₹${donation.amount.toLocaleString()} donated by ${donation.name}` +
        (donation.causeId ? ` for ${donation.causeId.name}` : ''),
      time: donation.createdAt,
      type: 'donation'
    }));

    // You can later push more activities like volunteer applications, blogs, etc.
    // activities.push(...volunteerActivities, ...blogPosts, etc.)

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (err) {
    console.error('Error in getRecentActivities:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
};
