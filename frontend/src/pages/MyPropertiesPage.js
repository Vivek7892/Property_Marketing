import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../api';
import { FiPlus, FiEdit2, FiTrash2, FiHome, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  approved: { cls: 'bg-emerald-50 text-emerald-700', icon: <FiCheckCircle size={11} /> },
  pending:  { cls: 'bg-amber-50 text-amber-700',   icon: <FiClock size={11} /> },
  rejected: { cls: 'bg-red-50 text-red-600',       icon: <FiXCircle size={11} /> },
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80';

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    propertyAPI.myProperties()
      .then(({ data }) => setProperties(data.results || data))
      .finally(() => setLoading(false));
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
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Properties</h1>
            <p className="text-sm text-gray-400 mt-0.5">{properties.length} listing{properties.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/properties/add" className="btn-primary">
            <FiPlus size={16} /> Add New
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="lph-card overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="lph-card flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FiHome size={24} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No properties yet</h3>
            <p className="text-sm text-gray-400 mb-5">Start by listing your first property</p>
            <Link to="/properties/add" className="btn-primary">List Now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((p) => {
              const s = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
              return (
                <div key={p.id} className="lph-card overflow-hidden group">
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <img
                      src={p.primary_image || PLACEHOLDER}
                      alt={p.title}
                      className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = PLACEHOLDER; }}
                    />
                    <span className={`absolute top-3 left-3 lph-badge ${s.cls}`}>
                      {s.icon} {p.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-gray-900 truncate mb-1">{p.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">{p.city} · {p.property_type}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-gray-900">₹{Number(p.price).toLocaleString('en-IN')}</span>
                      <span className="text-xs text-gray-400 capitalize bg-gray-50 px-2.5 py-1 rounded-lg">{p.category}</span>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Link to={`/properties/${p.id}`} className="flex-1 btn-secondary py-2 text-xs justify-center">View</Link>
                      <Link to={`/properties/${p.id}/edit`} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                        <FiEdit2 size={15} />
                      </Link>
                      <button onClick={() => deleteProperty(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
