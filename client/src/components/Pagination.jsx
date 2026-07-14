export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn-secondary text-sm px-3 py-1.5"
      >
        Prev
      </button>
      {pages[0] > 1 && <span className="text-gray-400 px-2">...</span>}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            p === page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && <span className="text-gray-400 px-2">...</span>}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-secondary text-sm px-3 py-1.5"
      >
        Next
      </button>
    </div>
  );
}
