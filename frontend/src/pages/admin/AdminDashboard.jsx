import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading administration dashboard..." />;
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Active Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: 'Registered Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-amber-500/10 text-amber-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-100 text-teal-800">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Control Panel
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
            Store Administration
          </h1>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-sm"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition-colors shadow-sm"
          >
            Manage Orders
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors"
          >
            Users Directory
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-gray-400 block">{card.title}</span>
                <span className="text-2xl font-black text-gray-900 mt-1 block">{card.value}</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Low Stock Alert & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Products */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Inventory Alert
            </h3>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              Manage Stock
            </Link>
          </div>

          {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.lowStockProducts.map((p) => (
                <div key={p._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                    />
                    <div>
                      <p className="font-bold text-gray-900 max-w-[200px] truncate">{p.name}</p>
                      <p className="text-gray-400">{p.category}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">
              All product inventory levels are healthy!
            </p>
          )}
        </div>

        {/* Recent Orders Overview */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-base">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.recentOrders.map((o) => (
                <div key={o._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-gray-900 block truncate max-w-[150px]">
                      #{o._id}
                    </span>
                    <span className="text-gray-400">{o.user?.name || 'Customer'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-gray-900 block">${o.totalPrice.toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-teal-700 capitalize">
                      {o.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">No orders recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
