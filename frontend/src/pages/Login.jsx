import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Welcome back!');
      navigate(redirect);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin@123');
    } else {
      setEmail('user@example.com');
      setPassword('User@123');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-md shadow-teal-600/30">
            F
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sign in to Flagship</h2>
          <p className="text-sm text-gray-500 mt-1">Access your cart, orders, and wishlist</p>
        </div>

        {/* Demo Auto-fill Pill Buttons */}
        <div className="bg-teal-50/70 border border-teal-200/60 rounded-2xl p-4 text-xs space-y-2">
          <span className="font-bold text-teal-900 block">Instant Demo Access:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Fill Admin
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('user')}
              className="flex-1 py-1.5 px-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Fill Demo User
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
          Don't have an account?{' '}
          <Link
            to={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="font-bold text-teal-600 hover:text-teal-700"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
