import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../api';
import PropertyCard from '../components/property/PropertyCard';
import SearchBar from '../components/property/SearchBar';
import { FaBuilding, FaHome, FaStore, FaTree, FaCity } from 'react-icons/fa';

const CATEGORIES = [
  { label: 'Buy', value: 'sale', icon: <FaHome size={28} />, color: 'primary' },
  { label: 'Rent', value: 'rent', icon: <FaBuilding size={28} />, color: 'success' },
  { label: 'Lease', value: 'lease', icon: <FaCity size={28} />, color: 'warning' },
  { label: 'Plots', value: 'sale&property_type=plot', icon: <FaTree size={28} />, color: 'info' },
  { label: 'Shops', value: 'rent&property_type=shop', icon: <FaStore size={28} />, color: 'danger' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyAPI.featured()
      .then(({ data }) => setFeatured(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero-section text-white py-5" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a4fc4 100%)', minHeight: 420, display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div className="row justify-content-center text-center mb-4">
            <div className="col-md-8">
              <h1 className="display-5 fw-bold mb-2">Find Your Dream Property</h1>
              <p className="lead opacity-75">Buy, Sell & Rent Properties in Your Locality</p>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-md-10">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="container my-5">
        <div className="row g-3 justify-content-center">
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="col-6 col-md-auto">
              <Link to={`/properties?category=${cat.value}`} className="text-decoration-none">
                <div className={`card border-0 shadow-sm text-center p-3 h-100 category-card border-top border-3 border-${cat.color}`} style={{ minWidth: 120 }}>
                  <div className={`text-${cat.color} mb-2`}>{cat.icon}</div>
                  <div className="fw-semibold">{cat.label}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="container mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold mb-0">Featured Properties</h3>
          <Link to="/properties" className="btn btn-outline-primary btn-sm">View All →</Link>
        </div>
        {loading ? (
          <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>
        ) : featured.length === 0 ? (
          <p className="text-muted text-center py-4">No featured properties yet.</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {featured.map((p) => (
              <div key={p.id} className="col">
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-light py-5">
        <div className="container text-center">
          <h3 className="fw-bold mb-2">Have a Property to Sell or Rent?</h3>
          <p className="text-muted mb-4">List your property for free and reach thousands of buyers & renters.</p>
          <Link to="/properties/add" className="btn btn-primary btn-lg px-5">List Your Property Free</Link>
        </div>
      </section>
    </>
  );
}
