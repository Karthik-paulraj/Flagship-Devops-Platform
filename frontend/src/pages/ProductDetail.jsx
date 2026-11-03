import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck, ArrowLeft, Plus, Minus, Star } from 'lucide-react';
import api from '../services/api';
import { RatingStars } from '../components/RatingStars';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);
        if (res.data.product.images && res.data.product.images.length > 0) {
          setSelectedImage(res.data.product.images[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product._id, quantity);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      error('Please write a review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${id}/reviews`, {
        rating: Number(rating),
        comment: comment.trim(),
      });

      if (res.data.success) {
        success('Review submitted successfully!');
        setComment('');
        setRating(5);
        fetchProduct(); // Refresh product reviews and average
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not submit review';
      error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading product specifications..." />;
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The requested product does not exist or may have been retired.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Column */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 shadow-md">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img ? 'border-teal-600 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="flex flex-col space-y-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Ratings & Reviews summary */}
          <div className="flex items-center gap-4">
            <RatingStars rating={product.rating} numReviews={product.numReviews} size="md" />
            <span className="text-xs text-gray-400 font-semibold">•</span>
            <span className="text-xs font-semibold text-teal-600">{product.numReviews} Verified Reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-gray-900">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-sm text-gray-400 font-medium">USD</span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-base leading-relaxed">
            {product.description}
          </p>

          {/* Stock status indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Availability:</span>
            {isOutOfStock ? (
              <span className="text-sm font-bold text-rose-600">Out of Stock</span>
            ) : (
              <span className="text-sm font-bold text-emerald-600">
                In Stock ({product.stock} units available)
              </span>
            )}
          </div>

          {/* Quantity & Add to Cart Controls */}
          {!isOutOfStock && (
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center justify-between border border-gray-200 rounded-2xl p-1 bg-gray-50 max-w-[140px]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 rounded-xl bg-white text-gray-700 shadow-xs hover:bg-gray-100 disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-sm text-gray-900 px-3">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 rounded-xl bg-white text-gray-700 shadow-xs hover:bg-gray-100 disabled:opacity-40"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 px-8 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart • ${(product.price * quantity).toFixed(2)}
              </button>
            </div>
          )}

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 text-xs font-semibold text-gray-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-teal-600" />
              <span>Complimentary shipping over $100</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Simulated safe card checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="border-t border-gray-200 pt-12 space-y-10">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Customer Reviews</h3>
          <p className="text-sm text-gray-500 mt-1">Read feedback from certified shoppers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Write a review form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <h4 className="font-bold text-gray-900 text-base mb-4">Write a Review</h4>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setRating(starVal)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            rating >= starVal
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-bold text-gray-700 ml-2">{rating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Your Review
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this item..."
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-4">
                  Please sign in to your account to submit a review for this product.
                </p>
                <Link
                  to="/login"
                  className="inline-flex px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold"
                >
                  Sign In to Review
                </Link>
              </div>
            )}
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900">{rev.name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <RatingStars rating={rev.rating} size="xs" />
                  <p className="text-sm text-gray-600 pt-1 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 p-8">
                <p className="text-sm text-gray-500 font-medium">
                  Be the first to leave a review for this product!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
