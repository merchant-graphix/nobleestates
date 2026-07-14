import { HiOutlineHome, HiChevronRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <Link to="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
        <HiOutlineHome className="w-4 h-4" />
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <HiChevronRight className="w-4 h-4 text-gray-400" />
          {item.href ? (
            <Link to={item.href} className="hover:text-indigo-600 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
