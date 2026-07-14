export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-96 bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-36 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr className="border-b animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}
