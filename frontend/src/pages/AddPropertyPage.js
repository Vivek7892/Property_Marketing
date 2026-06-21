import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../api';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiHome, FiShoppingBag, FiMap } from 'react-icons/fi';
import { uploadMultipleToCloudinary } from '../utils/cloudinary';
import { FiMapPin, FiExternalLink } from 'react-icons/fi';

const AMENITIES = {
  house: ['Power Backup', 'Lift', 'Security', 'CCTV', 'Garden', 'Gym', 'Swimming Pool',
          'Children Play Area', 'Visitor Parking', 'Gated Community', '24x7 Water Supply', 'Club House'],
  shop:  ['CCTV', 'Security', 'Power Backup', 'Lift', 'Parking', 'Fire Safety',
          'Air Conditioning', 'WiFi', 'Common Washroom', 'Signage Board'],
  site:  ['Corner Plot', 'Park Facing', 'Road Facing', 'Near School', 'Near Hospital',
          'Near Market', 'Bore Well', 'Compound Wall'],
};

const FACING = ['East', 'West', 'North', 'South', 'North East', 'North West', 'South East', 'South West'];

function SectionHeader({ title }) {
  return <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">{title}</div>;
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="lph-label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function CheckBox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-gray-900"
        checked={checked} onChange={onChange} />
      <span className="text-sm text-gray-600">{label}</span>
    </label>
  );
}

const TYPE_OPTIONS = [
  { value: 'house', label: 'House', icon: <FiHome size={20} />, desc: 'Residential property' },
  { value: 'shop',  label: 'Shop',  icon: <FiShoppingBag size={20} />, desc: 'Commercial space' },
  { value: 'site',  label: 'Site / Plot', icon: <FiMap size={20} />, desc: 'Land / open plot' },
];

const INITIAL = {
  title: '', description: '', property_type: '', category: 'sale',
  price: '', is_negotiable: false, area_sqft: '',
  address: '', locality: '', city: '', state: '', pincode: '', facing: '',
  map_url: '',
  // house
  bedrooms: '', bathrooms: '', balconies: '', floors: '1', floor_number: '',
  parking: false, furnished_status: 'unfurnished',
  water_supply: false, power_backup: false, lift: false,
  // shop
  shop_frontage_ft: '', shop_depth_ft: '', floor_type: '',
  washroom: false, display_window: false, pantry: false, current_load_kw: '',
  // site
  plot_length_ft: '', plot_width_ft: '', road_width_ft: '',
  is_corner_plot: false, is_gated: false, approval_type: '', conversion_done: false,
  // financial
  advance_amount: '', maintenance_fee: '', rent_includes: '', lease_years: '',
};

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [form, setForm] = useState(INITIAL);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setv = (k) => (e) => set(k, e.target.value);
  const setb = (k) => (e) => set(k, e.target.checked);

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };
  const removeImage = (i) => {
    setImages((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };
  const toggleAmenity = (a) =>
    setAmenities((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.property_type) { toast.error('Please select a property type'); return; }
    if (images.length === 0) { toast.error('Please upload at least one image'); return; }

    setLoading(true);
    try {
      toast.loading('Uploading images...', { id: 'upload' });
      const imageUrls = await uploadMultipleToCloudinary(images, 'property_hub/properties');
      toast.dismiss('upload');

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
      });
      imageUrls.forEach((url) => fd.append('uploaded_image_urls', url));
      amenities.forEach((a) => fd.append('amenity_list', a));

      const { data } = await propertyAPI.create(fd);
      toast.success('Property listed! Pending approval.');
      navigate(`/properties/${data.id}`);
    } catch (err) {
      toast.dismiss('upload');
      const errors = err.response?.data;
      toast.error(errors ? Object.values(errors).flat().join(' ') : err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const type = form.property_type;
  const isRentLease = ['rent', 'lease'].includes(form.category);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">List Your Property</h1>
          <p className="text-sm text-gray-400 mt-0.5">Fill in the details below to submit for review</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Step 1: Pick type ── */}
          <div className="lph-card p-6">
            <SectionHeader title="Property Type" />
            <div className="grid grid-cols-3 gap-3">
              {TYPE_OPTIONS.map(({ value, label, icon, desc }) => (
                <button key={value} type="button"
                  onClick={() => { set('property_type', value); setAmenities([]); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    type === value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 hover:border-gray-400 text-gray-600'
                  }`}>
                  {icon}
                  <span className="text-sm font-semibold">{label}</span>
                  <span className={`text-xs ${type === value ? 'text-gray-300' : 'text-gray-400'}`}>{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {type && (
            <>
              {/* ── Basic Info ── */}
              <div className="lph-card p-6">
                <SectionHeader title="Basic Information" />
                <div className="space-y-4">
                  <Field label="Title" required>
                    <input className="lph-input" required value={form.title} onChange={setv('title')}
                      placeholder={type === 'house' ? '3BHK House in Jayanagar' : type === 'shop' ? 'Shop near Main Road' : '30×40 BDA Site in Whitefield'} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Category" required>
                      <select className="lph-select" value={form.category} onChange={setv('category')}>
                        <option value="sale">Sale</option>
                        <option value="rent">Rent</option>
                        <option value="lease">Lease</option>
                      </select>
                    </Field>
                    <Field label="Facing">
                      <select className="lph-select" value={form.facing} onChange={setv('facing')}>
                        <option value="">Select</option>
                        {FACING.map((f) => <option key={f} value={f.toLowerCase().replace(' ', '_')}>{f}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Description" required>
                    <textarea className="lph-input resize-none" rows={4} required
                      value={form.description} onChange={setv('description')}
                      placeholder="Describe the property in detail..." />
                  </Field>
                </div>
              </div>

              {/* ── Price ── */}
              <div className="lph-card p-6">
                <SectionHeader title="Price & Area" />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label={isRentLease ? 'Monthly Rent (₹)' : 'Sale Price (₹)'} required>
                    <input type="number" className="lph-input" required value={form.price} onChange={setv('price')} placeholder="0" />
                  </Field>
                  <Field label="Area (sq ft)">
                    <input type="number" className="lph-input" value={form.area_sqft} onChange={setv('area_sqft')} placeholder="0" />
                  </Field>
                </div>
                <CheckBox label="Price is negotiable" checked={form.is_negotiable} onChange={setb('is_negotiable')} />

                {/* Rent / Lease specific */}
                {isRentLease && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Field label="Advance / Deposit (₹)">
                      <input type="number" className="lph-input" value={form.advance_amount} onChange={setv('advance_amount')} placeholder="0" />
                    </Field>
                    <Field label="Maintenance Fee (₹/mo)">
                      <input type="number" className="lph-input" value={form.maintenance_fee} onChange={setv('maintenance_fee')} placeholder="0" />
                    </Field>
                    <Field label="Rent Includes">
                      <input className="lph-input" value={form.rent_includes} onChange={setv('rent_includes')} placeholder="Water, Electricity..." />
                    </Field>
                    {form.category === 'lease' && (
                      <Field label="Lease Duration (years)">
                        <input type="number" className="lph-input" value={form.lease_years} onChange={setv('lease_years')} placeholder="1" />
                      </Field>
                    )}
                  </div>
                )}
              </div>

              {/* ── HOUSE specific ── */}
              {type === 'house' && (
                <div className="lph-card p-6">
                  <SectionHeader title="House Details" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[['Bedrooms', 'bedrooms'], ['Bathrooms', 'bathrooms'], ['Balconies', 'balconies'], ['Total Floors', 'floors']].map(([label, key]) => (
                      <Field key={key} label={label}>
                        <input type="number" className="lph-input" min={0} value={form[key]} onChange={setv(key)} placeholder="0" />
                      </Field>
                    ))}
                    <Field label="Floor Number">
                      <input type="number" className="lph-input" min={0} value={form.floor_number} onChange={setv('floor_number')} placeholder="Ground=0" />
                    </Field>
                    <Field label="Furnished Status">
                      <select className="lph-select" value={form.furnished_status} onChange={setv('furnished_status')}>
                        <option value="unfurnished">Unfurnished</option>
                        <option value="semi">Semi-Furnished</option>
                        <option value="furnished">Fully Furnished</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <CheckBox label="Parking" checked={form.parking} onChange={setb('parking')} />
                    <CheckBox label="Lift" checked={form.lift} onChange={setb('lift')} />
                    <CheckBox label="Water Supply" checked={form.water_supply} onChange={setb('water_supply')} />
                    <CheckBox label="Power Backup" checked={form.power_backup} onChange={setb('power_backup')} />
                  </div>
                </div>
              )}

              {/* ── SHOP specific ── */}
              {type === 'shop' && (
                <div className="lph-card p-6">
                  <SectionHeader title="Shop Details" />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Field label="Frontage Width (ft)">
                      <input type="number" className="lph-input" value={form.shop_frontage_ft} onChange={setv('shop_frontage_ft')} placeholder="0" />
                    </Field>
                    <Field label="Depth (ft)">
                      <input type="number" className="lph-input" value={form.shop_depth_ft} onChange={setv('shop_depth_ft')} placeholder="0" />
                    </Field>
                    <Field label="Floor Type">
                      <input className="lph-input" value={form.floor_type} onChange={setv('floor_type')} placeholder="Tiles, Marble, Granite..." />
                    </Field>
                    <Field label="Electrical Load (kW)">
                      <input type="number" className="lph-input" value={form.current_load_kw} onChange={setv('current_load_kw')} placeholder="0" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <CheckBox label="Washroom" checked={form.washroom} onChange={setb('washroom')} />
                    <CheckBox label="Display Window" checked={form.display_window} onChange={setb('display_window')} />
                    <CheckBox label="Pantry" checked={form.pantry} onChange={setb('pantry')} />
                    <CheckBox label="Parking" checked={form.parking} onChange={setb('parking')} />
                  </div>
                </div>
              )}

              {/* ── SITE specific ── */}
              {type === 'site' && (
                <div className="lph-card p-6">
                  <SectionHeader title="Site / Plot Details" />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Field label="Plot Length (ft)">
                      <input type="number" className="lph-input" value={form.plot_length_ft} onChange={setv('plot_length_ft')} placeholder="e.g. 30" />
                    </Field>
                    <Field label="Plot Width (ft)">
                      <input type="number" className="lph-input" value={form.plot_width_ft} onChange={setv('plot_width_ft')} placeholder="e.g. 40" />
                    </Field>
                    <Field label="Road Width (ft)">
                      <input type="number" className="lph-input" value={form.road_width_ft} onChange={setv('road_width_ft')} placeholder="e.g. 30" />
                    </Field>
                    <Field label="Approval Authority">
                      <input className="lph-input" value={form.approval_type} onChange={setv('approval_type')} placeholder="BMRDA, BBMP, Panchayat..." />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <CheckBox label="Corner Plot" checked={form.is_corner_plot} onChange={setb('is_corner_plot')} />
                    <CheckBox label="Gated Layout" checked={form.is_gated} onChange={setb('is_gated')} />
                    <CheckBox label="DC Conversion Done" checked={form.conversion_done} onChange={setb('conversion_done')} />
                  </div>
                </div>
              )}

              {/* ── Location ── */}
              <div className="lph-card p-6">
                <SectionHeader title="Location" />
                <div className="space-y-3">
                  <Field label="Full Address" required>
                    <textarea className="lph-input resize-none" rows={2} required value={form.address} onChange={setv('address')} placeholder="Door no., Street, Area..." />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Locality" required>
                      <input className="lph-input" required value={form.locality} onChange={setv('locality')} placeholder="e.g. Vijayanagar" />
                    </Field>
                    <Field label="City" required>
                      <input className="lph-input" required value={form.city} onChange={setv('city')} placeholder="e.g. Nanjangud" />
                    </Field>
                    <Field label="State" required>
                      <input className="lph-input" required value={form.state} onChange={setv('state')} placeholder="e.g. Karnataka" />
                    </Field>
                    <Field label="Pincode">
                      <input className="lph-input" value={form.pincode} onChange={setv('pincode')} placeholder="571301" />
                    </Field>
                  </div>

                  {/* Google Maps URL */}
                  <div className="pt-1">
                    <Field label="Google Maps Location Link">
                      <div className="relative">
                        <FiMapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                        <input
                          className="lph-input pl-10 pr-24"
                          value={form.map_url}
                          onChange={setv('map_url')}
                          placeholder="Paste Google Maps link here..."
                          type="url"
                        />
                        {form.map_url && (
                          <a
                            href={form.map_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <FiExternalLink size={11} /> Preview
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">
                        Open <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Maps</a>, search your property location, click Share → Copy Link, then paste it above.
                      </p>
                    </Field>
                  </div>
                </div>
              </div>

              {/* ── Amenities ── */}
              <div className="lph-card p-6">
                <SectionHeader title="Amenities & Features" />
                <div className="flex flex-wrap gap-2">
                  {(AMENITIES[type] || []).map((a) => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 ${
                        amenities.includes(a)
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Images ── */}
              <div className="lph-card p-6">
                <SectionHeader title="Property Images" />
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 cursor-pointer hover:border-gray-400 transition-colors">
                  <FiUpload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">Click to upload images</span>
                  <span className="text-xs text-gray-400 mt-1">First image will be primary · Max 10 · JPEG/PNG/WebP</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
                </label>
                {previews.length > 0 && (
                  <div className="flex gap-3 mt-4 flex-wrap">
                    {previews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt="" className="w-24 h-[72px] object-cover rounded-xl border border-gray-100" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiX size={11} />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-[9px] bg-gray-900 text-white px-1.5 py-0.5 rounded">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 justify-center text-base">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
