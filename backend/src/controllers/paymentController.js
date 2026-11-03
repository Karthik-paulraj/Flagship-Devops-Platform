const mongoose = require('mongoose');
const Order = require('../models/Order');
const { memoryOrders } = require('../seed/productsData');

/**
 * @desc    Process simulated payment
 * @route   POST /api/payment/simulate
 * @access  Private
 */
const simulatePayment = async (req, res, next) => {
  try {
    const { orderId, cardDetails } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required to process payment',
      });
    }

    const cardNumber = (cardDetails && cardDetails.cardNumber) || '4242424242424242';

    // Offline in-memory payment
    if (mongoose.connection.readyState !== 1) {
      const order = memoryOrders.find((o) => o._id === orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (cardNumber.endsWith('0000')) {
        order.paymentStatus = 'failed';
        return res.status(400).json({
          success: false,
          message: 'Simulated Payment Declined: Test card was declined by issuing bank (ends in 0000)',
        });
      }

      order.isPaid = true;
      order.paidAt = new Date().toISOString();
      order.paymentStatus = 'completed';
      order.paymentResult = {
        id: `sim_ch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: req.user.email,
        card_brand: 'Visa (Simulated)',
        card_last4: cardNumber.replace(/\s+/g, '').slice(-4) || '4242',
      };

      return res.status(200).json({
        success: true,
        message: 'Simulated payment succeeded! No real money was charged.',
        order,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify ownership
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order',
      });
    }

    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid',
      });
    }

    if (cardNumber.endsWith('0000')) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Simulated Payment Declined: Test card was declined by issuing bank (ends in 0000)',
      });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentStatus = 'completed';
    order.paymentResult = {
      id: `sim_ch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
      card_brand: 'Visa (Simulated)',
      card_last4: cardNumber.replace(/\s+/g, '').slice(-4) || '4242',
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Simulated payment succeeded! No real money was charged.',
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  simulatePayment,
};
