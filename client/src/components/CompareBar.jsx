import { Link } from 'react-router-dom';
import { HiX, HiOutlineSwitchHorizontal } from 'react-icons/hi';
import { useCompare } from '../context/CompareContext';
import { formatMK } from '../utils';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Compare ({compareList.length}/3):</span>
          {compareList.map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 flex-shrink-0">
              <span className="text-sm font-medium truncate max-w-[150px]">{p.title}</span>
              <span className="text-xs text-indigo-600">{formatMK(p.price)}</span>
              <button onClick={() => removeFromCompare(p.id)} className="text-gray-400 hover:text-red-500">
                <HiX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {compareList.length >= 2 && (
            <Link
              to={`/compare?ids=${compareList.map(p => p.id).join(',')}`}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <HiOutlineSwitchHorizontal className="w-4 h-4" /> Compare
            </Link>
          )}
          <button onClick={clearCompare} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Clear</button>
        </div>
      </div>
    </div>
  );
}
