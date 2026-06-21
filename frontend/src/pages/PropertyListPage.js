import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyAPI } from '../api';
import PropertyCard from '../components/property/PropertyCard';
import SearchBar from '../components/property/SearchBar';
import { FiSliders, FiX, FiGrid, FiList, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const CATEGORIES = [
  { label: 'All',   value: '' },
  { label: 'Buy',   value: 'sale' },
  { label: 'Rent',  value: 'rent' },
  { label: 'Lease', value: 'lease' },
];

const SORT_OPTIONS = [
  { label: 'Newest First',   value: '-created_at' },
  { label: 'Price: Low–High', value: 'price' },
  { label: 'Price: High–Low', value: '-price' },
  { label: 'Most Viewed',    value: '-views_count' },
];

const PROPERTY_TYPES = ['house', 'shop', 'site'];
const FURNISHED_OPTS  = ['unfurnished', 'semi', 'furnished'];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-bold text-slate-900 mb-3"
      >
        {title}
        {open ? <FiChevronUp size={14} className="text-slate-400" /> : <FiChevronDown size={14} className="text-slate-400" />}
      </button>
      {open && children}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
      }`}
    >
      {label}
    </button>
  );
}

function SidebarFilters({ params, setParams, onClose }) {
  const get    = (k) => params.get(k) || '';
  const toggle = (k, v) => {
    const next = new URLSearchParams(params);
    if (next.get(k) === v) next.delete(k); else next.set(k, v);
    next.delete('page');
    setParams(next);
  };
  const set    = (k, v) => {
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    next.delete('page');
    setParams(next);
  };
  const clear  = () => { setParams(new URLSearchParams()); onClose?.(); };

  const hasFilters = [...params.entries()].some(([k]) => !['page', 'search', 'category'].includes(k));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-slate-900">Filters</h3>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={clear} className="text-xs text-blue-600 font-semibold hover:text-blue-700">
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Verified only */}
      <div className="mb-4">
        <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
          <input
            type="checkbox"
            className="w-4 h-4 accent-emerald-600 cursor-pointer"
            checked={get('is_verified') === 'true'}
            onChange={(e) => set('is_verified', e.target.checked ? 'true' : '')}
          />
          <span className="text-sm font-semibold text-emerald-700">✓ Verified Properties Only</span>
        </label>
      </div>

      <FilterSection title="Property Type">
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <FilterChip key={t} label={t === 'site' ? 'Plot / Site' : t.charAt(0).toUpperCase() + t.slice(1)}
              active={get('property_type') === t} onClick={() => toggle('property_type', t)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Budget">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="lph-label text-[10px]">Min (₹)</label>
            <input type="number" placeholder="0" className="lph-input py-2 text-xs"
              value={get('min_price')} onChange={(e) => set('min_price', e.target.value)} />
          </div>
          <div>
            <label className="lph-label text-[10px]">Max (₹)</label>
            <input type="number" placeholder="Any" className="lph-input py-2 text-xs"
              value={get('max_price')} onChange={(e) => set('max_price', e.target.value)} />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Bedrooms" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {['1', '2', '3', '4', '5+'].map((b) => (
            <FilterChip key={b} label={`${b} BHK`} active={get('bedrooms') === b}
              onClick={() => toggle('bedrooms', b)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Furnished Status" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {FURNISHED_OPTS.map((f) => (
            <FilterChip key={f} label={f === 'semi' ? 'Semi-Furnished' : f.charAt(0).toUpperCase() + f.slice(1)}
              active={get('furnished_status') === f} onClick={() => toggle('furnished_status', f)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Posted Within" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {[['Last 7 days', '7'], ['Last 30 days', '30'], ['Last 90 days', '90']].map(([label, v]) => (
            <FilterChip key={v} label={label} active={get('posted_within') === v}
              onClick={() => toggle('posted_within', v)} />
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="lph-card overflow-hidden">
      <div className="h-52 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-4 skeleton rounded w-4/5" />
        <div className="h-3 skeleton rounded w-2/3" />
        <div className="h-6 skeleton rounded w-1/3 mt-4" />
      </div>
    </div>
  );
}

export default function PropertyListPage() {
  const [params, setParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [count, setCount]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort]             = useState('-created_at');
  const [viewMode, setViewMode]     = useState('grid');

  useEffect(() => {
    setLoading(true);
    propertyAPI.list({ ...Object.fromEntries(params.entries()), page, ordering: sort })
      .then(({ data }) => { setProperties(data.results || []); setCount(data.count || 0); })
      .catch(() => { setProperties([]); setCount(0); })
      .finally(() => setLoading(false));
  }, [params, page, sort]);

  useEffect(() => { setPage(1); }, [params]);

  const updateCategory = (val) => {
    const next = new URLSearchParams(params);
    val ? next.set('category', val) : next.delete('category');
    next.delete('page');
    setParams(next);
  };

  const totalPages = Math.ceil(count / 12);
  const activeCategory = params.get('category') || '';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top search bar */}
      <div className="bg-white border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar compact />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Category Tabs + Sort */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {CATEGORIES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => updateCategory(value)}
                className={`px-5 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                  activeCategory === value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.3)]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs font-medium text-slate-600 border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none hover:border-slate-300 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Grid/List toggle */}
            <div className="hidden sm:flex border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:text-slate-700'}`}>
                <FiGrid size={15} />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:text-slate-700'}`}>
                <FiList size={15} />
              </button>
            </div>

            {/* Mobile filters toggle */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 md:hidden"
            >
              <FiSliders size={14} /> Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-60 flex-shrink-0">
            <div className="sticky top-24 lph-card p-5">
              <SidebarFilters params={params} setParams={setParams} />
            </div>
          </aside>

          {/* Mobile Filters Drawer */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-5 shadow-2xl animate-in slide-in-from-right duration-200">
                <SidebarFilters params={params} setParams={setParams} onClose={() => setFiltersOpen(false)} />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-900">{count.toLocaleString()}</span> properties found
                {params.get('search') && (
                  <span> for "<span className="text-blue-600 font-semibold">{params.get('search')}</span>"</span>
                )}
              </p>
            </div>

            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-4'}>
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center lph-card">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No properties found</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-xs">Try adjusting your filters or searching a different location</p>
                <button onClick={() => setParams(new URLSearchParams())} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-4'}>
                  {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-10">
                    <button
                      onClick={() => setPage(page - 1)} disabled={page === 1}
                      className="px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={`w-10 h-10 text-sm font-semibold rounded-xl transition-all ${
                            page === p
                              ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)]'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(page + 1)} disabled={page === totalPages}
                      className="px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating List Property button (mobile) */}
      <div className="fixed bottom-20 right-4 md:hidden z-40">
        <a href="/properties/add"
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-[0_4px_20px_rgba(37,99,235,0.5)] hover:bg-blue-700 transition-colors">
          + List Property
        </a>
      </div>
    </div>
  );
}
