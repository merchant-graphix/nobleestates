import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiHeart } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { toggleFavorite } from '../api/favorites';
import { useState } from 'react';
import { formatMK } from '../utils';

export default function PropertyCard({ property, onFavChange, showCompare = false }) {
  const { user } = useAuth();
  const { toggleCompare, isInCompare } = useCompare();
  const [faved, setFaved] = useState(property.is_favorite || false);

  const handleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const res = await toggleFavorite(property.id);
    setFaved(res.favorited);
    if (onFavChange) onFavChange(property.id, res.favorited);
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(property);
  };

  const imgUrl = property.primary_image || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';

  return (
    <Link to={`/listings/${property.id}`} className="card group">
      <div className="relative h-52 overflow-hidden">
        <img
          src={imgUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
            property.type === 'buy' ? 'bg-indigo-600' : 'bg-emerald-600'
          }`}>
            {property.type === 'buy' ? 'For Sale' : 'For Rent'}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          {showCompare && (
            <button
              onClick={handleCompare}
              className={`p-2 rounded-full transition-colors ${
                isInCompare(property.id) ? 'bg-indigo-600 text-white' : 'bg-white/80 hover:bg-white text-gray-600'
              }`}
              title="Add to compare"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </button>
          )}
          {user && (
            <button onClick={handleFav} className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
              {faved ? <HiHeart className="w-5 h-5 text-red-500" /> : <HiOutlineHeart className="w-5 h-5 text-gray-600" />}
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">{property.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{property.city}, {property.state || 'Malawi'}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
          <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          <span>{property.area_sqft.toLocaleString()} sqm</span>
        </div>
        <p className="text-xl font-bold text-indigo-600 mt-3">
          {property.type === 'buy' ? formatMK(property.price) : `${formatMK(property.price)}/mo`}
        </p>
      </div>
    </Link>
  );
}
