import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../api';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    propertyAPI.myProperties().then(({ data }) => setProperties(data.results || data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteProperty = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await propertyAPI.delete(id);
      toast.success('Property deleted');
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">My Properties</h4>
        <Link to="/properties/add" className="btn btn-primary d-flex align-items-center gap-2"><FaPlus /> Add New</Link>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>
      ) : properties.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">No properties listed yet</h5>
          <Link to="/properties/add" className="btn btn-primary mt-2">List Your First Property</Link>
        </div>
      ) : (
        <div className="row g-4">
          {properties.map((p) => (
            <div key={p.id} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <img src={p.primary_image || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={p.title} className="card-img-top" style={{ height: 160, objectFit: 'cover' }} />
                <div className="card-body">
                  <h6 className="fw-semibold mb-1 text-truncate">{p.title}</h6>
                  <p className="text-muted small mb-2">{p.city} · {p.property_type}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-primary">₹{Number(p.price).toLocaleString('en-IN')}</span>
                    <span className={`badge ${p.status === 'approved' ? 'bg-success' : p.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/properties/${p.id}`} className="btn btn-outline-primary btn-sm flex-grow-1">View</Link>
                  <Link to={`/properties/${p.id}/edit`} className="btn btn-outline-secondary btn-sm"><FaEdit /></Link>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteProperty(p.id)}><FaTrash /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
