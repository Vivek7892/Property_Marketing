import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ compact }) {
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [type, setType] = useState(params.get('property_type') || '');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (category) q.set('category', category);
    if (type) q.set('property_type', type);
    navigate(`/properties?${q.toString()}`);
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
          className="form-control"
          placeholder="Search city, locality..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary px-3"><FaSearch /></button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="search-bar bg-white rounded-3 shadow p-3 p-md-4">
      <div className="row g-2">
        <div className="col-12 col-md">
          <input
            className="form-control form-control-lg"
            placeholder="Search by city, locality, property name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-auto">
          <select className="form-select form-select-lg" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Types</option>
            <option value="sale">Buy</option>
            <option value="rent">Rent</option>
            <option value="lease">Lease</option>
          </select>
        </div>
        <div className="col-6 col-md-auto">
          <select className="form-select form-select-lg" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Property Type</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Site/Plot</option>
            <option value="shop">Shop</option>
            <option value="office">Office</option>
            <option value="commercial">Commercial</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>
        <div className="col-12 col-md-auto">
          <button className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2">
            <FaSearch /> Search
          </button>
        </div>
      </div>
    </form>
  );
}
