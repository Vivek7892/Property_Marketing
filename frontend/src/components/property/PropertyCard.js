import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaHeart, FaRegHeart, FaBed, FaBath, FaRuler, FaMapMarkerAlt } from 'react-icons/fa';
import { propertyAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://via.placeholder.com/400x250?text=No+Image';

export default function PropertyCard({ property, onFavoriteToggle }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(property.is_favorited);
  const [loading, setLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to save properties'); return; }
    setLoading(true);
    try {
      const { data } = await propertyAPI.toggleFavorite(property.id);
      setFavorited(data.status === 'added');
      onFavoriteToggle?.();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    const n = Number(price);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  return (
    <div className="card h-100 border-0 shadow-sm property-card">
      <Link to={`/properties/${property.id}`} className="text-decoration-none">
        <div className="position-relative">
          <img
            src={property.primary_image || PLACEHOLDER}
            alt={property.title}
            className="card-img-top"
            style={{ height: 200, objectFit: 'cover' }}
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
          <span className={`badge position-absolute top-0 start-0 m-2 ${property.category === 'sale' ? 'bg-primary' : property.category === 'rent' ? 'bg-success' : 'bg-warning text-dark'}`}>
            For {property.category}
          </span>
          {property.is_featured && (
            <span className="badge bg-danger position-absolute top-0 end-0 m-2">Featured</span>
          )}
        </div>
      </Link>

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start">
          <h6 className="card-title mb-1 text-truncate flex-grow-1">
            <Link to={`/properties/${property.id}`} className="text-dark text-decoration-none">
              {property.title}
            </Link>
          </h6>
          <button className="btn btn-link p-0 ms-2" onClick={handleFavorite} disabled={loading}>
            {favorited ? <FaHeart className="text-danger" /> : <FaRegHeart className="text-muted" />}
          </button>
        </div>

        <p className="text-muted small mb-2 d-flex align-items-center gap-1">
          <FaMapMarkerAlt size={12} /> {property.locality}, {property.city}
        </p>

        <div className="d-flex gap-3 text-muted small mb-3">
          {property.bedrooms > 0 && <span className="d-flex align-items-center gap-1"><FaBed /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span className="d-flex align-items-center gap-1"><FaBath /> {property.bathrooms}</span>}
          {property.area_sqft && <span className="d-flex align-items-center gap-1"><FaRuler /> {property.area_sqft} sqft</span>}
        </div>

        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div>
            <span className="fs-5 fw-bold text-primary">{formatPrice(property.price)}</span>
            {property.is_negotiable && <small className="text-muted ms-1">(Negotiable)</small>}
          </div>
          <span className="badge bg-light text-dark border">{property.property_type}</span>
        </div>
      </div>
    </div>
  );
}
