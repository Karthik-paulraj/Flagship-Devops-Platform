const express = require('express');
const {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const {
  validateProductCreate,
  validateProductUpdate,
  validateReview,
} = require('../middleware/validate');

const router = express.Router();

router.get('/categories', getCategories);

router
  .route('/')
  .get(getProducts)
  .post(protect, admin, validateProductCreate, createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, validateProductUpdate, updateProduct)
  .delete(protect, admin, deleteProduct);

router.post('/:id/reviews', protect, validateReview, createProductReview);

module.exports = router;
