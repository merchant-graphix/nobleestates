import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi';
import { getProperties } from '../api/properties';
import { useCompare } from '../context/CompareContext';
import { formatMK } from '../utils';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').map(Number) || [];
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length < 2) return;
    Promise.all(ids.map(id => getProperties({ limit: 1 })))
      .then(results => {
        const allProps = results.flatMap(r => r.properties);
        const matched = ids.map(id => allProps.find(p => p.id === id)).filter(Boolean);
        setProperties(matched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ids.join(',')]);

  if (ids.length < 2) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-lg">Select at least 2 properties to compare.</p>
        <Link to="/listings" className="text-indigo-600 hover:underline mt-4 inline-block">Browse properties</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const fields = [
    { label: 'Price', key: 'price', format: (v, p) => p.type === 'buy' ? formatMK(v) : `${formatMK(v)}/mo` },
    { label: 'Type', key: 'type', format: (v) => v === 'buy' ? 'For Sale' : 'For Rent' },
    { label: 'Bedrooms', key: 'bedrooms' },
    { label: 'Bathrooms', key: 'bathrooms' },
    { label: 'Area', key: 'area_sqft', format: (v) => `${v?.toLocaleString()} sqm` },
    { label: 'City', key: 'city' },
    { label: 'Region', key: 'state' },
    { label: 'Status', key: 'status' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Compare Properties</h1>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-xl border border-gray-100">
          <thead>
            <tr>
              <th className="p-4 text-left text-sm font-medium text-gray-500 w-40">Feature</th>
              {properties.map(p => (
                <th key={p.id} className="p-4 text-center min-w-[200px]">
                  <Link to={`/listings/${p.id}`} className="block group">
                    <img
                      src={p.primary_image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}
                      alt={p.title}
                      className="w-full h-36 object-cover rounded-lg mb-3 group-hover:opacity-80 transition-opacity"
                    />
                    <p className="font-semibold text-sm group-hover:text-indigo-600 transition-colors">{p.title}</p>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(field => (
              <tr key={field.key} className="border-t">
                <td className="p-4 text-sm font-medium text-gray-500">{field.label}</td>
                {properties.map(p => (
                  <td key={p.id} className="p-4 text-center text-sm">
                    {field.format ? field.format(p[field.key], p) : p[field.key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t">
              <td className="p-4 text-sm font-medium text-gray-500">Action</td>
              {properties.map(p => (
                <td key={p.id} className="p-4 text-center">
                  <Link to={`/listings/${p.id}`} className="btn-primary text-sm">View Details</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
