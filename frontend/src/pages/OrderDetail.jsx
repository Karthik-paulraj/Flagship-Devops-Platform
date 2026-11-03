import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, CreditCard } from 'lucide-react';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', done: true },
    { label: 'Processing', done: ['processing', 'shipped', 'delivered'].includes(order.orderStatus) },
    { label: 'Shipped', done: ['shipped', 'delivered'].includes(order.orderStatus) },
    { label: 'Delivered', done: order.orderStatus === 'delivered' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Order History
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
            Order Confirmation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-mono">
            #{order._id}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize ${
              order.isPaid
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {order.isPaid ? 'Payment Complete' : 'Payment Pending'}
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 capitalize">
            {order.orderStatus}
          </span>
        </div>
      </div>

      {/* Order Progress Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="font-extrabold text-gray-900 text-base mb-6">Delivery Progress</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                  step.done
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.done ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span
                className={`text-xs font-bold ${
                  step.done ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items & Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-gray-900 text-base">Ordered Products</h3>
          <div className="divide-y divide-gray-100">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-gray-100"
                  />
                  <div>
                    <Link
                      to={`/products/${item.product}`}
                      className="font-bold text-sm text-gray-900 hover:text-teal-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ${Number(item.price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>

                <span className="font-black text-sm text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" /> Shipping Destination
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{order.user?.name}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-600" /> Payment Details
            </h4>
            <div className="text-xs text-gray-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-semibold text-gray-900">
                  {order.paymentResult?.card_brand || 'Simulated Card'} (•••• {order.paymentResult?.card_last4 || '4242'})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-emerald-600 uppercase">
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentResult?.id && (
                <div className="flex justify-between">
                  <span>Charge ID:</span>
                  <span className="font-mono text-[10px] text-gray-500 truncate max-w-[120px]">
                    {order.paymentResult.id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h4 className="font-extrabold text-gray-900 text-sm">Summary Breakdown</h4>
            <div className="text-xs text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-semibold text-gray-900">
                  {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (8%):</span>
                <span className="font-semibold text-gray-900">${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-black text-gray-900">
                <span>Total Amount:</span>
                <span className="text-base text-teal-600">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
