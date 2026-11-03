import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-20 h-20 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
        <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
      </div>
      <span className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-2">
        Error 404
      </span>
      <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
        Page Not Found
      </h1>
      <p className="text-gray-500 text-sm max-w-md mb-8 leading-relaxed">
        We couldn't find the page or resource you're looking for. It might have been moved, renamed, or temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/20 transition-all active:scale-95"
      >
        <Home className="w-4 h-4" />
        Return to Homepage
      </Link>
    </div>
  );
};
