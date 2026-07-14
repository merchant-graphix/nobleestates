import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getProperties } from '../api/properties';
import PropertyCard from '../components/PropertyCard';
import PropertyFilter from '../components/PropertyFilter';
import Pagination from '../components/Pagination';
import Breadcrumbs from '../components/Breadcrumbs';
import { PropertyCardSkeleton } from '../components/Skeleton';

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const filters = Object.fromEntries(searchParams.entries());

  useEffect(() => {
    setLoading(true);
    getProperties({ ...filters, limit: 12 })
      .then(data => {
        setProperties(data.properties);
        setPagination(data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleFilterChange = (newFilters) => {
    const clean = {};
    Object.entries(newFilters).forEach(([k, v]) => { if (v) clean[k] = v; });
    setSearchParams(clean);
  };

  const handlePageChange = (page) => {
    handleFilterChange({ ...filters, page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>Properties | Noble Estates</title>
        <meta name="description" content="Browse properties for sale and rent across Malawi. Filter by city, price, bedrooms, and more." />
      </Helmet>

      <Breadcrumbs items={[{ label: 'Listings' }]} />
      <h1 className="text-3xl font-bold mb-6">Properties</h1>
      <PropertyFilter filters={filters} onFilterChange={handleFilterChange} />
      <p className="text-gray-500 mt-4 mb-6">{pagination.total} property{pagination.total !== 1 ? 'ies' : 'y'} found</p>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No properties found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => <PropertyCard key={p.id} property={p} showCompare />)}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
