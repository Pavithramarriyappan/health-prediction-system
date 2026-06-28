const Admin = require('../models/Admin');
const logger = require('../utils/logger');

const ADMIN_ROLES = ['Super Admin', 'Clinic Owner', 'Doctor'];

const sanitizeAdmin = (admin) => ({
  id: admin._id,
  fullName: admin.fullName,
  username: admin.username,
  email: admin.email,
  mobile: admin.mobile,
  role: admin.role,
  isActive: admin.isActive,
  lastLoginAt: admin.lastLoginAt,
  createdAt: admin.createdAt
});

exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.json({ success: true, admins: admins.map(sanitizeAdmin) });
  } catch (error) {
    logger.error('Get admins error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admins' });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, admin: sanitizeAdmin(admin) });
  } catch (error) {
    logger.error('Get admin by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { fullName, username, email, mobile, password, role } = req.body;

    if (!fullName || !username || !email || !mobile || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!ADMIN_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const existingAdmin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
        { mobile: mobile }
      ]
    });

    if (existingAdmin) {
      return res.status(409).json({ success: false, message: 'Username, email or mobile already exists' });
    }

    const newAdmin = new Admin({
      fullName: fullName.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password,
      role,
      isActive: true
    });

    await newAdmin.save();
    logger.info(`Super Admin created new admin: ${newAdmin.username}`);
    res.status(201).json({ success: true, admin: sanitizeAdmin(newAdmin) });
  } catch (error) {
    logger.error('Create admin error:', error);
    res.status(500).json({ success: false, message: 'Failed to create admin' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { fullName, email, mobile, role, isActive } = req.body;
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (role && !ADMIN_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    if (email && email.toLowerCase() !== admin.email) {
      const existingEmail = await Admin.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      admin.email = email.toLowerCase().trim();
    }

    if (mobile && mobile !== admin.mobile) {
      const existingMobile = await Admin.findOne({ mobile });
      if (existingMobile) {
        return res.status(409).json({ success: false, message: 'Mobile number already in use' });
      }
      admin.mobile = mobile.trim();
    }

    if (username && username.toLowerCase().trim() !== admin.username) {
      const existingUsername = await Admin.findOne({ username: username.toLowerCase().trim() });
      if (existingUsername) {
        return res.status(409).json({ success: false, message: 'Username already in use' });
      }
      admin.username = username.toLowerCase().trim();
    }

    if (fullName) admin.fullName = fullName.trim();
    if (role) admin.role = role;
    if (typeof isActive === 'boolean') admin.isActive = isActive;

    await admin.save();

    logger.info(`Super Admin updated admin: ${admin.username}`);
    res.json({ success: true, admin: sanitizeAdmin(admin) });
  } catch (error) {
    logger.error('Update admin error:', error);
    res.status(500).json({ success: false, message: 'Failed to update admin' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    await admin.deleteOne();
    logger.info(`Super Admin deleted admin: ${admin.username}`);
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    logger.error('Delete admin error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete admin' });
  }
};

exports.resetAdminPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    admin.password = newPassword;
    await admin.save();

    logger.info(`Super Admin reset password for admin: ${admin.username}`);
    res.json({ success: true, message: 'Admin password reset successfully' });
  } catch (error) {
    logger.error('Reset admin password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset admin password' });
  }
};
