// Validation middleware helpers

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }
  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('A valid email address is required');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', '), errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  }
  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', '), errors });
  }
  next();
};

const validateProductCreate = (req, res, next) => {
  const { name, price, category, stock } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Product name is required');
  }
  if (price === undefined || isNaN(price) || Number(price) < 0) {
    errors.push('Valid non-negative price is required');
  }
  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }
  if (stock !== undefined && (isNaN(stock) || Number(stock) < 0)) {
    errors.push('Stock cannot be negative');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', '), errors });
  }
  next();
};

const validateProductUpdate = (req, res, next) => {
  const { name, price, category, stock } = req.body;
  const errors = [];

  if (name !== undefined && name.trim().length === 0) {
    errors.push('Product name cannot be empty');
  }
  if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
    errors.push('Valid non-negative price is required');
  }
  if (category !== undefined && category.trim().length === 0) {
    errors.push('Category cannot be empty');
  }
  if (stock !== undefined && (isNaN(stock) || Number(stock) < 0)) {
    errors.push('Stock cannot be negative');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', '), errors });
  }
  next();
};

const validateReview = (req, res, next) => {
  const { rating, comment } = req.body;
  const errors = [];

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    errors.push('Rating must be an integer between 1 and 5');
  }
  if (!comment || comment.trim().length === 0) {
    errors.push('Review comment is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', '), errors });
  }
  next();
};

const validateOrder = (req, res, next) => {
  const { shippingAddress } = req.body;
  const errors = [];

  if (!shippingAddress) {
    errors.push('Shipping address is required');
  } else {
    if (!shippingAddress.address || shippingAddress.address.trim().length === 0) {
      errors.push('Street address is required');
    }
    if (!shippingAddress.city || shippingAddress.city.trim().length === 0) {
      errors.push('City is required');
    }
    if (!shippingAddress.postalCode || shippingAddress.postalCode.trim().length === 0) {
      errors.push('Postal code is required');
    }
    if (!shippingAddress.country || shippingAddress.country.trim().length === 0) {
      errors.push('Country is required');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', '), errors });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProductCreate,
  validateProductUpdate,
  validateReview,
  validateOrder,
};
