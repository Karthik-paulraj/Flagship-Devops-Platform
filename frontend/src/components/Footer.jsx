import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20 border-t border-gray-800">
      {/* Value Propositions */}
      <div className="border-b border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Free Express Shipping</h4>
              <p className="text-xs text-gray-400">On all qualifying orders over $100</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Simulated Payments</h4>
              <p className="text-xs text-gray-400">Safe sandbox checkout simulation</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">30-Day Guarantee</h4>
              <p className="text-xs text-gray-400">Hassle-free return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Stripe-Ready Architecture</h4>
              <p className="text-xs text-gray-400">Easily integrated with real gateways</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-black text-lg">
                F
              </div>
              <span className="text-lg font-black tracking-tight text-white">FLAGSHIP</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Curated premium gear, modern electronics, and lifestyle essentials with effortless shopping.
            </p>
          </div>

          <div>
            <h5 className="text-white font-bold text-sm mb-4">Shop Categories</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/products?category=Electronics" className="hover:text-teal-400 transition-colors">
                  Electronics & Tech
                </Link>
              </li>
              <li>
                <Link to="/products?category=Fashion" className="hover:text-teal-400 transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link to="/products?category=Home+%26+Living" className="hover:text-teal-400 transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link to="/products?category=Fitness+%26+Outdoors" className="hover:text-teal-400 transition-colors">
                  Fitness & Outdoors
                </Link>
              </li>
              <li>
                <Link to="/products?category=Books+%26+Audio" className="hover:text-teal-400 transition-colors">
                  Books & Audio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-sm mb-4">Customer Account</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/profile" className="hover:text-teal-400 transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-teal-400 transition-colors">
                  Order History & Tracking
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-teal-400 transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition-colors">
                  Sign In / Demo Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-sm mb-4">Architecture & Tech</h5>
            <p className="text-sm text-gray-400 mb-3">
              MERN Stack: React, Node.js, Express, MongoDB (Mongoose), Tailwind CSS.
            </p>
            <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 text-xs text-gray-300">
              <span className="font-semibold text-teal-400 block mb-1">Local Development:</span>
              Backend API on port 5000, Vite client on port 5173.
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Flagship E-Commerce. All rights reserved.</p>
          <p>Designed for production readiness and seamless scalability.</p>
        </div>
      </div>
    </footer>
  );
};
