const Admin = require('../models/Admin');
const Patient = require('../models/Patient');
const Setting = require('../models/Setting');
const logger = require('../utils/logger');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const [totalAdmins, totalPatients, activeAdmins, settings] = await Promise.all([
      Admin.countDocuments(),
      Patient.countDocuments(),
      Admin.countDocuments({ isActive: true }),
      Setting.findOne()
    ]);

    const recentAdmins = await Admin.find()
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(5)
      .select('fullName username role isActive updatedAt createdAt');

    const systemStatus = {
      uptime: process.uptime(),
      timestamp: new Date(),
      databaseStatus: 'connected'
    };

    res.json({
      success: true,
      data: {
        totalAdmins,
        totalPatients,
        activeAdmins,
        settings: settings || null,
        systemStatus,
        recentActivities: recentAdmins.map((admin) => ({
          id: admin._id,
          fullName: admin.fullName,
          username: admin.username,
          role: admin.role,
          isActive: admin.isActive,
          updatedAt: admin.updatedAt || admin.createdAt,
          createdAt: admin.createdAt
        }))
      }
    });
  } catch (error) {
    logger.error('Dashboard metrics error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard metrics' });
  }
};
