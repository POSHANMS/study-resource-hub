const User = require('../models/User');
const Resource = require('../models/Resource');
const fs = require('fs');
const path = require('path');

// @desc    Get all users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all resources (including unapproved)
// @route   GET /api/admin/resources
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any resource
// @route   DELETE /api/admin/resources/:id
const adminDeleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (resource.fileUrl) {
      const filePath = path.join(__dirname, '..', resource.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle approve/unapprove resource
// @route   PUT /api/admin/resources/:id/approve
const toggleApprove = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    resource.isApproved = !resource.isApproved;
    await resource.save();
    res.json({ message: `Resource ${resource.isApproved ? 'approved' : 'unapproved'}`, resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
const changeUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = user.role === 'admin' ? 'student' : 'admin';
    await user.save();
    res.json({ message: `Role changed to ${user.role}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResources = await Resource.countDocuments();
    const totalDownloads = await Resource.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } },
    ]);
    const pendingApproval = await Resource.countDocuments({ isApproved: false });
    const resourcesByType = await Resource.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      totalResources,
      totalDownloads: totalDownloads[0]?.total || 0,
      pendingApproval,
      resourcesByType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllResources,
  adminDeleteResource,
  toggleApprove,
  changeUserRole,
  deleteUser,
  getStats,
};
