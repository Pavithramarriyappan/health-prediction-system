const Setting = require('../models/Setting');
const logger = require('../utils/logger');

const defaultSettings = {
  clinicName: 'Health Prediction System',
  websiteName: 'Health Prediction System',
  logoUrl: '',
  address: '',
  contactNumber: '',
  supportEmail: '',
  footerText: '',
  dashboardTitle: 'Super Admin Dashboard'
};

const getSettingsDocument = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting(defaultSettings);
    await settings.save();
  }
  return settings;
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();
    res.json({ success: true, settings });
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    const settings = await getSettingsDocument();

    Object.keys(defaultSettings).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        settings[key] = updates[key] || '';
      }
    });

    settings.updatedAt = new Date();
    await settings.save();

    logger.info('Settings updated by Super Admin');
    res.json({ success: true, settings });
  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};
