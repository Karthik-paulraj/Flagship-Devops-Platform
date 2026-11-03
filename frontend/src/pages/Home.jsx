import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Headphones, Shirt, Home as HomeIcon, Dumbbell, BookOpen } from 'lucide-react';
import api from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?featured=true&limit=8');
        if (res.data.success) {
          setFeaturedProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Electronics', icon: Headphones, color: 'bg-blue-500/10 text-blue-600', count: '5+ Items' },
    { name: 'Fashion', icon: Shirt, color: 'bg-rose-500/10 text-rose-600', count: '5+ Items' },
    { name: 'Home & Living', icon: HomeIcon, color: 'bg-amber-500/10 text-amber-600', count: '5+ Items' },
    { name: 'Fitness & Outdoors', icon: Dumbbell, color: 'bg-emerald-500/10 text-emerald-600', count: '4+ Items' },
    { name: 'Books & Audio', icon: BookOpen, color: 'bg-purple-500/10 text-purple-600', count: '3+ Items' },
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-teal-950 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.2),transparent_50%)]"></div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-20 lg:py-28 flex flex-col items-start gap-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Premium Essentials
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-2xl">
            Engineered for <span className="text-teal-400">Excellence</span>, Built for Everyday.
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed">
            Discover precision audio, modern apparel, active gear, and home goods designed with uncompromising attention to detail.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-gray-950 font-extrabold text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95"
            >
              Explore Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/products?category=Electronics"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md transition-all border border-white/10"
            >
              Trending Electronics
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="text-sm text-gray-500 mt-1">Browse collections crafted for your lifestyle</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all text-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-teal-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs text-gray-400 font-medium mt-1">{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Featured Highlights</h2>
            <p className="text-sm text-gray-500 mt-1">Hand-picked bestsellers and customer favorites</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
          >
            View Entire Store <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading featured products..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
