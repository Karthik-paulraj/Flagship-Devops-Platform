const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { memoryOrders, memoryCarts, defaultProducts } = require('../seed/productsData');

// @desc    Create new order from user's cart or order items
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'simulated_card' } = req.body;
    let items = req.body.orderItems;
    const userId = req.user._id.toString();

    // Offline in-memory order creation
    if (mongoose.connection.readyState !== 1) {
      if (!items || items.length === 0) {
        const cart = memoryCarts.get(userId) || { items: [] };
        if (cart.items.length === 0) {
          return res.status(400).json({ success: false, message: 'No items in cart to create an order' });
        }
        items = cart.items.map((ci) => ({
          product: ci.product._id,
          name: ci.product.name,
          quantity: ci.quantity,
          price: ci.price,
          image: ci.product.images?.[0] || '',
        }));
      }

      const orderItems = [];
      let itemsPrice = 0;

      for (const item of items) {
        const product = defaultProducts.find((p) => p._id === item.product);
        const price = product ? product.price : item.price;
        itemsPrice += price * item.quantity;
        orderItems.push({
          _id: 'ord_item_' + Date.now(),
          product: item.product,
          name: item.name || product?.name,
          quantity: item.quantity,
          price,
          image: item.image || product?.images?.[0] || '',
        });
      }

      const shippingPrice = itemsPrice >= 100 ? 0 : 10;
      const taxPrice = Math.round(itemsPrice * 0.08 * 100) / 100;
      const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

      const order = {
        _id: '65e00000000000000000' + Math.floor(1000 + Math.random() * 9000),
        user: { _id: userId, name: req.user.name, email: req.user.email },
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        orderStatus: 'processing',
        paymentStatus: 'pending',
        isPaid: false,
        createdAt: new Date().toISOString(),
      };

      memoryOrders.unshift(order);
      memoryCarts.set(userId, { items: [], totalPrice: 0, totalQuantity: 0 });

      return res.status(201).json({ success: true, order });
    }

    // Live MongoDB Order Flow
    if (!items || items.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No items in cart to create an order',
        });
      }

      items = cart.items.map((ci) => ({
        product: ci.product._id,
        name: ci.product.name,
        quantity: ci.quantity,
        price: ci.price,
        image: ci.product.images && ci.product.images[0] ? ci.product.images[0] : '',
      }));
    }

    const orderItems = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name || item.product} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }

      product.stock -= item.quantity;
      await product.save();

      const price = product.price;
      itemsPrice += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price,
        image: product.images && product.images[0] ? product.images[0] : item.image || '',
      });
    }

    const shippingPrice = itemsPrice >= 100 ? 0 : 10;
    const taxPrice = Math.round(itemsPrice * 0.08 * 100) / 100;
    const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus: 'processing',
      paymentStatus: 'pending',
      isPaid: false,
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    if (mongoose.connection.readyState !== 1) {
      const orders = memoryOrders.filter((o) => {
        const oUserId = o.user?._id ? o.user._id.toString() : o.user.toString();
        return oUserId === userId;
      });
      return res.status(200).json({ success: true, orders });
    }

    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const order = memoryOrders.find((o) => o._id === req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.status(200).json({ success: true, order });
    }

    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        total: memoryOrders.length,
        page: 1,
        pages: 1,
        orders: memoryOrders,
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const order = memoryOrders.find((o) => o._id === req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      order.orderStatus = status;
      if (status === 'delivered') order.deliveredAt = new Date().toISOString();
      return res.status(200).json({ success: true, order });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.orderStatus = status;
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
