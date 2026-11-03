const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { memoryUsers, memoryOrders, defaultProducts } = require('../seed/productsData');

// @desc    Get dashboard metrics and statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const paidOrders = memoryOrders.filter((o) => o.isPaid);
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders: memoryOrders.length,
          totalProducts: defaultProducts.length,
          totalUsers: memoryUsers.length,
          recentOrders: memoryOrders.slice(0, 5),
          lowStockProducts: defaultProducts.filter((p) => p.stock < 10).slice(0, 5),
        },
      });
    }

    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? Math.round(revenueAgg[0].total * 100) / 100 : 0;

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        users: memoryUsers.map((u) => {
          const c = { ...u };
          delete c.password;
          return c;
        }),
      });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (mongoose.connection.readyState !== 1) {
      const u = memoryUsers.find((x) => x._id === req.params.id);
      if (!u) return res.status(404).json({ success: false, message: 'User not found' });
      u.role = role;
      return res.status(200).json({
        success: true,
        user: { _id: u._id, name: u.name, email: u.email, role: u.role },
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const idx = memoryUsers.findIndex((x) => x._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
      memoryUsers.splice(idx, 1);
      return res.status(200).json({ success: true, message: 'User removed successfully' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  updateUserRole,
  deleteUser,
};
