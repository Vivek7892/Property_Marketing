import { useEffect, useState } from 'react';
import { propertyAPI } from '../api';
import PropertyCard from '../components/property/PropertyCard';

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
    <div className="container my-4">
      <h4 className="fw-bold mb-4">Saved Properties</h4>
      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h5>No saved properties</h5>
          <p>Browse properties and click the heart icon to save.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {favorites.map(({ id, property }) => (
            <div key={id} className="col">
              <PropertyCard property={property} onFavoriteToggle={load} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
