const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { memoryCarts, defaultProducts } = require('../seed/productsData');

// Helper to populate cart items product details
const populateCart = async (cart) => {
  return await cart.populate({
    path: 'items.product',
    select: 'name price images stock category',
  });
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    if (mongoose.connection.readyState !== 1) {
      if (!memoryCarts.has(userId)) {
        memoryCarts.set(userId, { items: [], totalPrice: 0, totalQuantity: 0 });
      }
      return res.status(200).json({
        success: true,
        cart: memoryCarts.get(userId),
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    cart = await populateCart(cart);

    // Filter out items whose product might have been deleted from DB
    const validItems = cart.items.filter((item) => item.product !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
      cart = await populateCart(cart);
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Math.max(1, parseInt(quantity, 10));
    const userId = req.user._id.toString();

    // Offline in-memory cart
    if (mongoose.connection.readyState !== 1) {
      const product = defaultProducts.find((p) => p._id === productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      let cart = memoryCarts.get(userId) || { items: [], totalPrice: 0, totalQuantity: 0 };
      const itemIndex = cart.items.findIndex(
        (i) => i.product._id === productId || i.product === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += qty;
      } else {
        cart.items.push({
          _id: 'cart_item_' + Date.now(),
          product,
          quantity: qty,
          price: product.price,
        });
      }

      cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      memoryCarts.set(userId, cart);

      return res.status(200).json({ success: true, cart });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product is currently out of stock',
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + qty;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} items in stock (${cart.items[itemIndex].quantity} already in cart)`,
        });
      }
      cart.items[itemIndex].quantity = newQuantity;
      cart.items[itemIndex].price = product.price;
    } else {
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }
      cart.items.push({
        product: productId,
        quantity: qty,
        price: product.price,
      });
    }

    await cart.save();
    cart = await populateCart(cart);

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);
    const userId = req.user._id.toString();

    if (mongoose.connection.readyState !== 1) {
      let cart = memoryCarts.get(userId) || { items: [], totalPrice: 0, totalQuantity: 0 };
      const idx = cart.items.findIndex(
        (i) => i.product._id === productId || i.product === productId
      );
      if (idx > -1) {
        if (qty <= 0) {
          cart.items.splice(idx, 1);
        } else {
          cart.items[idx].quantity = qty;
        }
      }
      cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      memoryCarts.set(userId, cart);
      return res.status(200).json({ success: true, cart });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        cart.items.splice(itemIndex, 1);
        await cart.save();
        return res.status(404).json({ success: false, message: 'Product no longer exists' });
      }

      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`,
        });
      }

      cart.items[itemIndex].quantity = qty;
      cart.items[itemIndex].price = product.price;
    }

    await cart.save();
    const updatedCart = await populateCart(cart);

    res.status(200).json({
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id.toString();

    if (mongoose.connection.readyState !== 1) {
      let cart = memoryCarts.get(userId) || { items: [], totalPrice: 0, totalQuantity: 0 };
      cart.items = cart.items.filter(
        (i) => i.product._id !== productId && i.product !== productId
      );
      cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      memoryCarts.set(userId, cart);
      return res.status(200).json({ success: true, message: 'Item removed', cart });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );

    await cart.save();
    const updatedCart = await populateCart(cart);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    if (mongoose.connection.readyState !== 1) {
      memoryCarts.set(userId, { items: [], totalPrice: 0, totalQuantity: 0 });
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        cart: { items: [], totalPrice: 0, totalQuantity: 0 },
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: { items: [], totalPrice: 0, totalQuantity: 0 },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
};
