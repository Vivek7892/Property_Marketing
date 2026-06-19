import { useSearchParams } from 'react-router-dom';

export default function PropertyFilters() {
  const [params, setParams] = useSearchParams();

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete('page');
    setParams(next);
  };

  return (
    <div className="card border-0 shadow-sm p-3">
      <h6 className="fw-semibold mb-3">Filters</h6>

      <div className="mb-3">
        <label className="form-label small fw-medium">Category</label>
        <select className="form-select form-select-sm" value={params.get('category') || ''} onChange={(e) => update('category', e.target.value)}>
          <option value="">All</option>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
          <option value="lease">Lease</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label small fw-medium">Property Type</label>
        <select className="form-select form-select-sm" value={params.get('property_type') || ''} onChange={(e) => update('property_type', e.target.value)}>
          <option value="">All Types</option>
          {['house','apartment','villa','plot','shop','office','commercial','warehouse'].map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label small fw-medium">Min Price (₹)</label>
        <input type="number" className="form-control form-control-sm" placeholder="Min"
          value={params.get('min_price') || ''} onChange={(e) => update('min_price', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label small fw-medium">Max Price (₹)</label>
        <input type="number" className="form-control form-control-sm" placeholder="Max"
          value={params.get('max_price') || ''} onChange={(e) => update('max_price', e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label small fw-medium">Min Bedrooms</label>
        <select className="form-select form-select-sm" value={params.get('min_bedrooms') || ''} onChange={(e) => update('min_bedrooms', e.target.value)}>
          <option value="">Any</option>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label small fw-medium">Furnished Status</label>
        <select className="form-select form-select-sm" value={params.get('furnished_status') || ''} onChange={(e) => update('furnished_status', e.target.value)}>
          <option value="">Any</option>
          <option value="furnished">Furnished</option>
          <option value="semi">Semi-Furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label small fw-medium">Sort By</label>
        <select className="form-select form-select-sm" value={params.get('ordering') || ''} onChange={(e) => update('ordering', e.target.value)}>
          <option value="-created_at">Newest First</option>
          <option value="created_at">Oldest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
        </select>
      </div>

      <button className="btn btn-outline-secondary btn-sm" onClick={() => setParams({})}>
        Clear Filters
      </button>
    </div>
  );
}
