import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../api';
import PropertyCard from '../components/property/PropertyCard';
import { FiHeart, FiSearch } from 'react-icons/fi';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    propertyAPI.getFavorites()
      .then(({ data }) => setFavorites(data.results || data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiHeart size={20} className="text-gray-700" /> Saved Properties
          </h1>
          {favorites.length > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{favorites.length} saved</p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="lph-card overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-100 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="lph-card flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
              <FiHeart size={28} className="text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No saved properties</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Browse properties and click the heart icon to save your favourites here.
            </p>
            <Link to="/properties" className="btn-primary">
              <FiSearch size={15} /> Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map(({ id, property }) => (
              <PropertyCard key={id} property={property} onFavoriteToggle={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
