const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { defaultProducts } = require('../seed/productsData');

// In-memory fallback helper when MongoDB is not connected
const getFallbackProducts = (req) => {
  let list = [...defaultProducts];

  // Search filter
  if (req.query.search && req.query.search.trim()) {
    const term = req.query.search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }

  // Category filter
  if (req.query.category && req.query.category.trim() && req.query.category !== 'All') {
    const cat = req.query.category.trim().toLowerCase();
    list = list.filter((p) => p.category.toLowerCase() === cat);
  }

  // Price filter
  if (req.query.minPrice !== undefined && req.query.minPrice !== '') {
    list = list.filter((p) => p.price >= Number(req.query.minPrice));
  }
  if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') {
    list = list.filter((p) => p.price <= Number(req.query.maxPrice));
  }

  // Featured
  if (req.query.featured === 'true') {
    list = list.filter((p) => p.featured);
  }

  // Sorting
  if (req.query.sort) {
    if (req.query.sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (req.query.sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (req.query.sort === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (req.query.sort === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 12);
  const total = list.length;
  const skip = (page - 1) * limit;
  const paginated = list.slice(skip, skip + limit);

  return {
    products: paginated,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    count: paginated.length,
  };
};

// @desc    Get all products with filtering, searching, sorting and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    // If MongoDB is not connected, use initial catalog fallback
    if (mongoose.connection.readyState !== 1) {
      const fallback = getFallbackProducts(req);
      return res.status(200).json({
        success: true,
        isOfflineFallback: true,
        ...fallback,
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 12);
    const skip = (page - 1) * limit;

    const query = {};

    // Search keyword in name or description
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    // Category filter
    if (req.query.category && req.query.category.trim() && req.query.category !== 'All') {
      query.category = { $regex: new RegExp(`^${req.query.category.trim()}$`, 'i') };
    }

    // Price range filter
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
      query.price = {};
      if (req.query.minPrice !== undefined && req.query.minPrice !== '') {
        query.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice !== undefined && req.query.maxPrice !== '') {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Featured filter (optional)
    if (req.query.featured === 'true') {
      query.featured = true;
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'rating_desc':
          sortOption = { rating: -1 };
          break;
        case 'name_asc':
          sortOption = { name: 1 };
          break;
        case 'newest':
        default:
          sortOption = { createdAt: -1 };
          break;
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      products,
    });
  } catch (error) {
    // If DB fails unexpectedly, return fallback
    const fallback = getFallbackProducts(req);
    res.status(200).json({
      success: true,
      isOfflineFallback: true,
      ...fallback,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const product = defaultProducts.find((p) => p._id === req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({
        success: true,
        product: {
          ...product,
          reviews: [],
        },
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
        reviews,
      },
    });
  } catch (error) {
    // Fallback if ID matched default mock
    const fallback = defaultProducts.find((p) => p._id === req.params.id);
    if (fallback) {
      return res.status(200).json({
        success: true,
        product: { ...fallback, reviews: [] },
      });
    }
    next(error);
  }
};

// @desc    Get distinct product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const categories = [...new Set(defaultProducts.map((p) => p.category))];
      return res.status(200).json({
        success: true,
        categories,
      });
    }

    const categories = await Product.distinct('category');
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    const categories = [...new Set(defaultProducts.map((p) => p.category))];
    res.status(200).json({
      success: true,
      categories,
    });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, images, stock, featured } = req.body;

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
      ],
      stock: stock !== undefined ? Number(stock) : 0,
      featured: Boolean(featured),
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const { name, description, price, category, images, stock, featured } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category) product.category = category;
    if (images && Array.isArray(images)) product.images = images;
    if (stock !== undefined) product.stock = Number(stock);
    if (featured !== undefined) product.featured = Boolean(featured);

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ product: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Product and associated reviews removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    const review = await Review.create({
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
      product: productId,
    });

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
