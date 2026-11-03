import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'processing':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading your order history..." />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon={Package}
          title="No Orders Found"
          message="You have not placed any orders yet. Discover our latest collections and start shopping!"
          actionLabel="Explore Catalog"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order History</h1>
        <p className="text-sm text-gray-500 mt-1">Review your recent purchases and package tracking</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Order ID</span>
                <span className="font-mono font-bold text-gray-900 text-sm">{order._id}</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Date Placed</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Status</span>
                  {getStatusBadge(order.orderStatus)}
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto max-w-lg">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-100"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-gray-900 max-w-[140px] truncate">{item.name}</p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:border-l sm:border-gray-100 sm:pl-6">
                <div>
                  <span className="text-xs text-gray-400 block font-medium">Total Amount</span>
                  <span className="text-lg font-black text-gray-900">
                    ${order.totalPrice.toFixed(2)}
                  </span>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition-colors"
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
