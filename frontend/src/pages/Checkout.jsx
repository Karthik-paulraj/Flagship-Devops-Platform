import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, CheckCircle2, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/EmptyState';

export const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { error } = useToast();

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    address: '450 Mission Street, Suite 200',
    city: 'San Francisco',
    postalCode: '94105',
    country: 'United States',
  });

  const [cardDetails, setCardDetails] = useState({
    name: 'Alex Shopper',
    cardNumber: '4242 4242 4242 4242',
    expDate: '12/28',
    cvc: '123',
  });

  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const items = cart?.items || [];

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="No Items to Checkout"
          message="Your cart is currently empty. Add products to begin checkout."
          actionLabel="Browse Products"
          actionLink="/products"
        />
      </div>
    );
  }

  const shippingPrice = totalPrice >= 100 ? 0 : 10;
  const taxPrice = Math.round(totalPrice * 0.08 * 100) / 100;
  const finalTotal = Math.round((totalPrice + shippingPrice + taxPrice) * 100) / 100;

  const handleInputChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const fillTestCard = (type = 'success') => {
    if (type === 'success') {
      setCardDetails({
        name: 'Alex Shopper',
        cardNumber: '4242 4242 4242 4242',
        expDate: '12/28',
        cvc: '123',
      });
    } else {
      setCardDetails({
        name: 'Decline Tester',
        cardNumber: '4000 0000 0000 0000',
        expDate: '10/26',
        cvc: '999',
      });
    }
  };

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();

    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      error('Please complete all shipping address fields');
      return;
    }

    setProcessing(true);
    try {
      // 1. Create order from cart
      const orderRes = await api.post('/orders', {
        shippingAddress,
        paymentMethod: 'simulated_card',
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to initialize order');
      }

      const order = orderRes.data.order;

      // 2. Process simulated payment
      const payRes = await api.post('/payment/simulate', {
        orderId: order._id,
        cardDetails: {
          cardNumber: cardDetails.cardNumber,
          name: cardDetails.name,
        },
      });

      if (payRes.data.success) {
        // Clear cart local state
        await clearCart();
        setCompletedOrder(payRes.data.order);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Payment simulation failed';
      error(msg);
    } finally {
      setProcessing(false);
    }
  };

  // Order Confirmation View
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Confirmed!</h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Thank you for your purchase. Your payment was verified through our simulated Stripe checkout sandbox.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-left shadow-sm space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Order Number:</span>
            <span className="font-mono font-bold text-gray-900">{completedOrder._id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Payment Transaction:</span>
            <span className="font-mono text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              {completedOrder.paymentResult?.id || 'sim_charge'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Total Paid:</span>
            <span className="font-extrabold text-gray-900">${completedOrder.totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Fulfillment Status:</span>
            <span className="font-bold text-amber-600 capitalize">{completedOrder.orderStatus}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={`/orders/${completedOrder._id}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors shadow-sm"
          >
            Track Order Details
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete your shipping details and test simulated payment
        </p>
      </div>

      <form onSubmit={handleSubmitCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left 2 Columns: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h3 className="font-extrabold text-gray-900 text-lg">1. Delivery Address</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 123 Market Street, Apt 4B"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                2. Simulated Card Payment
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Sandbox Mode
              </span>
            </div>

            {/* Sandbox Notice & Quick Test Fills */}
            <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-4 text-xs text-blue-900 space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                This is a simulated payment gateway. No real charges are processed.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-bold text-blue-700">Quick Test:</span>
                <button
                  type="button"
                  onClick={() => fillTestCard('success')}
                  className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  Fill Success Card (4242)
                </button>
                <button
                  type="button"
                  onClick={() => fillTestCard('fail')}
                  className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors"
                >
                  Fill Declined Card (0000)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={cardDetails.name}
                  onChange={handleCardChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  required
                  value={cardDetails.cardNumber}
                  onChange={handleCardChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    name="expDate"
                    required
                    value={cardDetails.expDate}
                    onChange={handleCardChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    CVC
                  </label>
                  <input
                    type="text"
                    name="cvc"
                    required
                    value={cardDetails.cvc}
                    onChange={handleCardChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6 sticky top-28">
            <h3 className="font-extrabold text-gray-900 text-lg">Order Items ({items.length})</h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.product?._id || item._id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.product?.name}</p>
                    <p className="text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-extrabold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900">
                  {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-semibold text-gray-900">${taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900">
                <span>Total Amount</span>
                <span className="text-xl text-teal-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50"
            >
              {processing ? (
                <span>Simulating Payment...</span>
              ) : (
                <>
                  <span>Pay ${finalTotal.toFixed(2)} (Simulated)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Simulated Payment Engine</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
