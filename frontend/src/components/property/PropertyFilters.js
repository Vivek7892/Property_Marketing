import { useSearchParams } from 'react-router-dom';

export default function PropertyFilters() {
  const [params, setParams] = useSearchParams();

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const hasFilters = ['category', 'property_type', 'min_price', 'max_price', 'min_bedrooms', 'furnished_status'].some(k => params.get(k));

  return (
    <div className="lph-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        {hasFilters && (
          <button onClick={() => setParams({})} className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {[
        {
          key: 'category', label: 'Category',
          options: [['', 'All'], ['sale', 'Buy'], ['rent', 'Rent'], ['lease', 'Lease']],
        },
        {
          key: 'property_type', label: 'Property Type',
          options: [['', 'All Types'], ['house', 'House'], ['shop', 'Shop'], ['site', 'Site / Plot']],
        },
        {
          key: 'min_bedrooms', label: 'Min Bedrooms (House)',
          options: [['', 'Any'], ...['1', '2', '3', '4', '5'].map(n => [n, `${n}+`])],
        },
        {
          key: 'furnished_status', label: 'Furnishing (House)',
          options: [['', 'Any'], ['furnished', 'Furnished'], ['semi', 'Semi-Furnished'], ['unfurnished', 'Unfurnished']],
        },
        {
          key: 'ordering', label: 'Sort By',
          options: [['-created_at', 'Newest First'], ['created_at', 'Oldest First'], ['price', 'Price: Low to High'], ['-price', 'Price: High to Low']],
        },
      ].map(({ key, label, options }) => (
        <div key={key}>
          <label className="lph-label">{label}</label>
          <select
            className="lph-select"
            value={params.get(key) || ''}
            onChange={(e) => update(key, e.target.value)}
          >
            {options.map(([val, text]) => (
              <option key={val} value={val}>{text}</option>
            ))}
          </select>
        </div>
      ))}

      <div>
        <label className="lph-label">Price Range (₹)</label>
        <div className="flex gap-2">
          <input type="number" className="lph-input" placeholder="Min"
            value={params.get('min_price') || ''}
            onChange={(e) => update('min_price', e.target.value)} />
          <input type="number" className="lph-input" placeholder="Max"
            value={params.get('max_price') || ''}
            onChange={(e) => update('max_price', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
