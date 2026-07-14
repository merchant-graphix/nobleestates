import { useState, useEffect } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import { getCities } from '../api/properties';

export default function PropertyFilter({ filters, onFilterChange }) {
  const [cities, setCities] = useState([]);
  const [local, setLocal] = useState(filters);

  useEffect(() => {
    getCities().then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const handleChange = (key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onFilterChange(next);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by city, address..."
            value={local.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={local.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          className="input-field"
        >
          <option value="">All Types</option>
          <option value="buy">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
        <select
          value={local.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          className="input-field"
        >
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={local.bedrooms || ''}
          onChange={(e) => handleChange('bedrooms', e.target.value)}
          className="input-field"
        >
          <option value="">Any Bedrooms</option>
          <option value="0">Studio</option>
          <option value="1">1 Bed</option>
          <option value="2">2 Beds</option>
          <option value="3">3 Beds</option>
          <option value="4">4+ Beds</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <input
          type="number"
          placeholder="Min Price"
          value={local.minPrice || ''}
          onChange={(e) => handleChange('minPrice', e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={local.maxPrice || ''}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
          className="input-field"
        />
        <select
          value={local.sort || 'newest'}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="input-field"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="area_asc">Area: Smallest</option>
          <option value="area_desc">Area: Largest</option>
        </select>
      </div>
    </div>
  );
}
