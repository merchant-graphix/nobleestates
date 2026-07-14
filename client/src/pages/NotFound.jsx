import { Link } from 'react-router-dom';
import { HiOutlineHome, HiOutlineSearch } from 'react-icons/hi';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineHome className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <HiOutlineHome className="w-5 h-5" /> Go Home
          </Link>
          <Link to="/listings" className="btn-secondary flex items-center gap-2">
            <HiOutlineSearch className="w-5 h-5" /> Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
