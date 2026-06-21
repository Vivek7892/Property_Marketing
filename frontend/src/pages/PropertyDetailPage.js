import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyAPI, inquiryAPI, chatAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/common/MapComponent';import PropertyCard from '../components/property/PropertyCard';
import {
  FiMapPin, FiUsers, FiMaximize, FiTruck, FiLayers,
  FiUser, FiPhone, FiShare2, FiMessageSquare, FiCheckCircle,
  FiArrowLeft, FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80';
const CATEGORY_STYLES = { sale: 'bg-gray-900 text-white', rent: 'bg-emerald-600 text-white', lease: 'bg-amber-500 text-white' };

function formatPrice(price) {
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [inquiry, setInquiry] = useState({ message: '', inquiry_type: 'question', visit_date: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    propertyAPI.get(id)
      .then(({ data }) => {
        setProperty(data);
        return propertyAPI.list({ city: data.city, property_type: data.property_type, page: 1 });
      })
      .then(({ data }) => setSimilar(data.results?.filter((p) => String(p.id) !== String(id)).slice(0, 4) || []))
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login'); navigate('/login'); return; }
    setSending(true);
    try {
      await inquiryAPI.create({ property: id, ...inquiry });
      toast.success('Inquiry sent!');
      setInquiry({ message: '', inquiry_type: 'question', visit_date: '' });
    } catch { toast.error('Failed to send inquiry'); }
    finally { setSending(false); }
  };

  const handleChat = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await chatAPI.getOrCreateRoom(id);
      navigate('/chat', { state: { roomId: data.id } });
    } catch (err) { toast.error(err.response?.data?.error || 'Cannot start chat'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Property not found</h2>
        <Link to="/properties" className="btn-primary">Browse Properties</Link>
      </div>
    );
  }

  const images = property.images?.length ? property.images : [{ image: PLACEHOLDER }];
  const currentImg = images[activeImg]?.image || PLACEHOLDER;

  // Build type-specific spec cards
  const buildSpecs = () => {
    const common = [
      { label: 'Type', value: property.property_type?.toUpperCase() },
      { label: 'Category', value: property.category?.toUpperCase() },
      { label: 'Area', value: property.area_sqft ? `${property.area_sqft} sqft` : null },
      { label: 'Facing', value: property.facing?.replace('_', ' ') },
    ];

    const house = [
      { label: 'Bedrooms', value: property.bedrooms || null },
      { label: 'Bathrooms', value: property.bathrooms || null },
      { label: 'Balconies', value: property.balconies || null },
      { label: 'Floors', value: property.floors },
      { label: 'Floor No.', value: property.floor_number !== null ? property.floor_number : null },
      { label: 'Furnished', value: property.furnished_status },
      { label: 'Parking', value: property.parking ? 'Yes' : 'No' },
      { label: 'Lift', value: property.lift ? 'Yes' : 'No' },
      { label: 'Water', value: property.water_supply ? 'Available' : null },
      { label: 'Power Backup', value: property.power_backup ? 'Yes' : null },
    ];

    const shop = [
      { label: 'Frontage', value: property.shop_frontage_ft ? `${property.shop_frontage_ft} ft` : null },
      { label: 'Depth', value: property.shop_depth_ft ? `${property.shop_depth_ft} ft` : null },
      { label: 'Floor Type', value: property.floor_type || null },
      { label: 'Elec. Load', value: property.current_load_kw ? `${property.current_load_kw} kW` : null },
      { label: 'Washroom', value: property.washroom ? 'Yes' : 'No' },
      { label: 'Display Window', value: property.display_window ? 'Yes' : 'No' },
      { label: 'Pantry', value: property.pantry ? 'Yes' : null },
      { label: 'Parking', value: property.parking ? 'Yes' : 'No' },
    ];

    const site = [
      { label: 'Dimensions', value: property.plot_length_ft && property.plot_width_ft ? `${property.plot_length_ft}×${property.plot_width_ft} ft` : null },
      { label: 'Road Width', value: property.road_width_ft ? `${property.road_width_ft} ft` : null },
      { label: 'Corner Plot', value: property.is_corner_plot ? 'Yes' : 'No' },
      { label: 'Gated', value: property.is_gated ? 'Yes' : 'No' },
      { label: 'Approval', value: property.approval_type || null },
      { label: 'DC Conversion', value: property.conversion_done ? 'Done' : 'Pending' },
    ];

    const financial = [
      { label: 'Advance', value: property.advance_amount ? `₹${Number(property.advance_amount).toLocaleString('en-IN')}` : null },
      { label: 'Maintenance', value: property.maintenance_fee ? `₹${Number(property.maintenance_fee).toLocaleString('en-IN')}/mo` : null },
      { label: 'Rent Includes', value: property.rent_includes || null },
      { label: 'Lease Years', value: property.lease_years ? `${property.lease_years} yrs` : null },
    ];

    const typeMap = { house, shop, site };
    return [
      ...common,
      ...(typeMap[property.property_type] || []),
      ...financial,
    ].filter((s) => s.value !== null && s.value !== undefined && s.value !== '');
  };

  const specs = buildSpecs();

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6">
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image Gallery */}
            <div className="lph-card overflow-hidden">
              <img
                src={currentImg}
                alt={property.title}
                className="w-full h-80 lg:h-[440px] object-cover"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-gray-900' : 'border-transparent'}`}>
                      <img src={img.image} alt="" className="w-20 h-14 object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="lph-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`lph-badge ${CATEGORY_STYLES[property.category] || 'bg-gray-700 text-white'}`}>
                      For {property.category}
                    </span>
                    {property.is_verified && (
                      <span className="lph-badge bg-blue-50 text-blue-700">
                        <FiCheckCircle size={11} /> Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h1>
                  <p className="flex items-center gap-1.5 text-sm text-gray-400">
                    <FiMapPin size={13} /> {property.address}, {property.locality}, {property.city} — {property.pincode}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{formatPrice(property.price)}</div>
                  {property.is_negotiable && <span className="text-xs text-emerald-600 font-medium">Negotiable</span>}
                </div>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specs.map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center">
                    <div className="text-xs text-gray-400">{s.label}</div>
                    <div className="text-sm font-semibold text-gray-900 capitalize mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="lph-card p-6">
              <h2 className="section-title mb-4">Description</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="lph-card p-6">
                <h2 className="section-title mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a.id} className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {(property.map_url || property.latitude) && (
              <div className="lph-card p-6">
                <h2 className="section-title mb-4">Location</h2>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiMapPin size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{property.address}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{property.locality}, {property.city} — {property.pincode}</p>
                  </div>
                </div>

                {property.map_url ? (
                  <a
                    href={property.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2.5 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_2px_8px_rgba(37,99,235,0.3)] active:scale-[0.98]"
                  >
                    <FiMapPin size={16} />
                    View on Google Maps
                    <FiExternalLink size={14} className="opacity-70" />
                  </a>
                ) : property.latitude && property.longitude ? (
                  <a
                    href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2.5 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_2px_8px_rgba(37,99,235,0.3)] active:scale-[0.98]"
                  >
                    <FiMapPin size={16} />
                    View on Google Maps
                    <FiExternalLink size={14} className="opacity-70" />
                  </a>
                ) : null}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">

            {/* Owner Card */}
            <div className="lph-card p-5">
              <h3 className="section-title mb-4">Property Owner</h3>
              <div className="flex items-center gap-3 mb-4">
                {property.owner?.profile_photo
                  ? <img src={property.owner.profile_photo} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                  : <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center"><FiUser size={20} className="text-gray-400" /></div>
                }
                <div>
                  <div className="font-semibold text-sm text-gray-900">{property.owner?.full_name}</div>
                  <div className="text-xs text-gray-400 capitalize">{property.owner?.user_type}</div>
                </div>
              </div>

              <div className="space-y-2">
                {property.owner?.mobile && (
                  <a href={`tel:${property.owner.mobile}`} className="btn-secondary w-full py-2.5 text-sm justify-center">
                    <FiPhone size={14} /> {property.owner.mobile}
                  </a>
                )}
                {user && user.id !== property.owner?.id && (
                  <button onClick={handleChat} className="btn-primary w-full py-2.5 text-sm justify-center">
                    <FiMessageSquare size={14} /> Chat with Owner
                  </button>
                )}
                <button
                  onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
                  className="btn-secondary w-full py-2.5 text-sm justify-center"
                >
                  <FiShare2 size={14} /> Share Property
                </button>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="lph-card p-5">
              <h3 className="section-title mb-4">Send Inquiry</h3>
              <form onSubmit={handleInquiry} className="space-y-3">
                <div>
                  <label className="lph-label">Inquiry Type</label>
                  <select className="lph-select" value={inquiry.inquiry_type}
                    onChange={(e) => setInquiry({ ...inquiry, inquiry_type: e.target.value })}>
                    <option value="question">Ask a Question</option>
                    <option value="visit">Schedule Visit</option>
                    <option value="offer">Make an Offer</option>
                  </select>
                </div>
                {inquiry.inquiry_type === 'visit' && (
                  <div>
                    <label className="lph-label">Visit Date</label>
                    <input type="date" className="lph-input" value={inquiry.visit_date}
                      onChange={(e) => setInquiry({ ...inquiry, visit_date: e.target.value })} />
                  </div>
                )}
                <div>
                  <label className="lph-label">Message</label>
                  <textarea
                    className="lph-input resize-none"
                    rows={4}
                    placeholder="Your message..."
                    value={inquiry.message}
                    onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" disabled={sending} className="btn-accent w-full py-3 justify-center">
                  {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {sending ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
