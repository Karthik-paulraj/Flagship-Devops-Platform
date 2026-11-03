import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/EmptyState';

export const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Your Cart is Empty"
          message="Explore our collection of premium electronics, apparel, and home gear to find something you love."
          actionLabel="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  const shippingThreshold = 100;
  const isFreeShipping = totalPrice >= shippingThreshold;
  const amountToFreeShipping = Math.max(0, shippingThreshold - totalPrice);
  const estimatedShipping = isFreeShipping ? 0 : 10;
  const estimatedTax = Math.round(totalPrice * 0.08 * 100) / 100;
  const finalTotal = Math.round((totalPrice + estimatedShipping + estimatedTax) * 100) / 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shopping Bag</h1>
          <p className="text-sm text-gray-500 mt-1">{totalItems} item(s) in your basket</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress */}
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
        {isFreeShipping ? (
          <p className="text-sm font-bold text-teal-800">
            🎉 Congratulations! You have unlocked Free Standard Shipping on this order.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-teal-900">
              Add <span className="font-black text-teal-700">${amountToFreeShipping.toFixed(2)}</span> more to qualify for Free Shipping!
            </p>
            <div className="w-full bg-teal-200/50 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalPrice / shippingThreshold) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const image =
              product.images && product.images.length > 0
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

            return (
              <div
                key={product._id}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-xs"
              >
                {/* Thumbnail */}
                <Link
                  to={`/products/${product._id}`}
                  className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
                >
                  <img src={image} alt={product.name} className="w-full h-full object-cover" />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <Link
                    to={`/products/${product._id}`}
                    className="font-bold text-gray-900 text-sm hover:text-teal-600 transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <span className="text-xs text-gray-400 block mt-0.5">{product.category}</span>
                  <span className="text-sm font-extrabold text-gray-900 block mt-2">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1 bg-gray-50">
                  <button
                    onClick={() => updateQuantity(product._id, item.quantity - 1)}
                    className="p-1 rounded-lg bg-white text-gray-700 shadow-xs hover:bg-gray-100"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-gray-900 px-2">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(product._id, item.quantity + 1)}
                    className="p-1 rounded-lg bg-white text-gray-700 shadow-xs hover:bg-gray-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Line Total & Remove */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="text-sm font-black text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-28">
            <h3 className="font-extrabold text-gray-900 text-lg">Order Summary</h3>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-gray-900">
                  {isFreeShipping ? 'FREE' : `$${estimatedShipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-gray-900">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900">
                <span>Estimated Total</span>
                <span className="text-xl text-teal-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all text-center"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Simulated SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
