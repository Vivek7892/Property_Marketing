import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch, FiMapPin, FiHome, FiDollarSign } from 'react-icons/fi';

const BUDGET_OPTIONS = [
  { label: 'Any Budget',  value: '' },
  { label: 'Under ₹20L', value: '0-2000000' },
  { label: '₹20L – 50L', value: '2000000-5000000' },
  { label: '₹50L – 1Cr', value: '5000000-10000000' },
  { label: '₹1Cr – 2Cr', value: '10000000-20000000' },
  { label: 'Above ₹2Cr', value: '20000000-' },
];

const CITIES = ['Nanjangud', 'Mysuru', 'T. Narasipura', 'Hunsur', 'H.D. Kote'];

function Field({ icon, label, children }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 flex-1 min-w-0">
      <span className="text-[#D4AF37] flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

export default function SearchBar({ compact }) {
  const [urlParams] = useSearchParams();
  const [search,   setSearch]   = useState(urlParams.get('search') || '');
  const [category, setCategory] = useState(urlParams.get('category') || '');
  const [type,     setType]     = useState(urlParams.get('property_type') || '');
  const [budget,   setBudget]   = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (search)   q.set('search', search);
    if (category) q.set('category', category);
    if (type)     q.set('property_type', type);
    if (budget) {
      const [min, max] = budget.split('-');
      if (min) q.set('min_price', min);
      if (max) q.set('max_price', max);
    }
    navigate(`/properties?${q.toString()}`);
  };

  /* ── Compact (used on list page header) ── */
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="lph-input pl-10 py-3 text-sm"
            placeholder="Search city, locality, property…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary px-5 py-3 text-sm whitespace-nowrap">
          <FiSearch size={15} /> Search
        </button>
      </form>
    );
  }

  /* ── Hero search pill ── */
  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(15,23,42,0.18)] overflow-hidden">

        {/* Fields row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

          <Field icon={<FiMapPin size={16} />} label="Location">
            <input
              className="w-full text-sm text-[#111827] placeholder-slate-400 outline-none bg-transparent font-medium truncate"
              placeholder="Nanjangud, Mysuru…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              list="city-list"
            />
            <datalist id="city-list">
              {CITIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </Field>

          <Field icon={<FiHome size={16} />} label="Looking For">
            <select
              className="w-full text-sm text-[#111827] outline-none bg-transparent font-medium cursor-pointer appearance-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Buy / Rent / Lease</option>
              <option value="sale">Buy</option>
              <option value="rent">Rent</option>
              <option value="lease">Lease</option>
            </select>
          </Field>

          <Field icon={<FiHome size={16} />} label="Property Type">
            <select
              className="w-full text-sm text-[#111827] outline-none bg-transparent font-medium cursor-pointer appearance-none"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="house">House / Villa</option>
              <option value="shop">Shop / Commercial</option>
              <option value="site">Site / Plot</option>
            </select>
          </Field>

          <Field icon={<FiDollarSign size={16} />} label="Budget">
            <select
              className="w-full text-sm text-[#111827] outline-none bg-transparent font-medium cursor-pointer appearance-none"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              {BUDGET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Search button — full width bottom on mobile, right on desktop */}
        <div className="border-t border-slate-100 p-2">
          <button
            type="submit"
            className="w-full btn-primary justify-center py-3.5 text-[15px] rounded-xl"
          >
            <FiSearch size={17} /> Search Properties
          </button>
        </div>
      </div>
    </form>
  );
}
