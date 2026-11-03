import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Product Image */}
      <Link
        to={`/products/${product._id}`}
        className="relative aspect-square overflow-hidden bg-gray-100 block"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
          {product.category}
        </span>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 bg-rose-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute top-3 right-3 bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
            Only {product.stock} left
          </span>
        ) : null}
      </Link>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-2">
          <RatingStars rating={product.rating} numReviews={product.numReviews} size="xs" />
        </div>

        <Link
          to={`/products/${product._id}`}
          className="text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1 mb-2"
        >
          {product.name}
        </Link>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Price</span>
            <span className="text-lg font-extrabold text-gray-900">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product._id, 1)}
            disabled={isOutOfStock}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95'
            }`}
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
