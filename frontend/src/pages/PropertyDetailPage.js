import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI, inquiryAPI, chatAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/common/MapComponent';
import PropertyCard from '../components/property/PropertyCard';
import { FaBed, FaBath, FaRuler, FaCar, FaCouch, FaMapMarkerAlt, FaUser, FaPhone, FaShare } from 'react-icons/fa';
import toast from 'react-hot-toast';

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
    propertyAPI.get(id)
      .then(({ data }) => {
        setProperty(data);
        return propertyAPI.list({ city: data.city, property_type: data.property_type, page: 1 });
      })
      .then(({ data }) => setSimilar(data.results?.filter((p) => p.id !== id).slice(0, 4) || []))
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login'); navigate('/login'); return; }
    setSending(true);
    try {
      await inquiryAPI.create({ property: id, ...inquiry });
      toast.success('Inquiry sent successfully!');
      setInquiry({ message: '', inquiry_type: 'question', visit_date: '' });
    } catch {
      toast.error('Failed to send inquiry');
    } finally {
      setSending(false);
    }
  };

  const handleChat = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await chatAPI.getOrCreateRoom(id);
      navigate('/chat', { state: { roomId: data.id } });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot start chat');
    }
  };

  const formatPrice = (price) => {
    const n = Number(price);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>;
  if (!property) return <div className="container py-5 text-center"><h4>Property not found</h4></div>;

  const images = property.images || [];
  const currentImg = images[activeImg]?.image || 'https://via.placeholder.com/800x450?text=No+Image';

  return (
    <div className="container my-4">
      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-8">
          {/* Image Gallery */}
          <div className="mb-3">
            <img src={currentImg} alt={property.title} className="w-100 rounded-3 object-fit-cover" style={{ height: 420 }} />
            {images.length > 1 && (
              <div className="d-flex gap-2 mt-2 overflow-auto">
                {images.map((img, i) => (
                  <img key={img.id} src={img.image} alt="" onClick={() => setActiveImg(i)}
                    className={`rounded cursor-pointer border ${i === activeImg ? 'border-primary border-2' : ''}`}
                    style={{ height: 70, width: 100, objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }} />
                ))}
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <h3 className="fw-bold mb-1">{property.title}</h3>
              <p className="text-muted d-flex align-items-center gap-1 mb-0">
                <FaMapMarkerAlt /> {property.address}, {property.locality}, {property.city} - {property.pincode}
              </p>
            </div>
            <div className="text-end">
              <div className="fs-3 fw-bold text-primary">{formatPrice(property.price)}</div>
              {property.is_negotiable && <small className="text-success">Negotiable</small>}
              <div><span className={`badge ${property.category === 'sale' ? 'bg-primary' : property.category === 'rent' ? 'bg-success' : 'bg-warning text-dark'}`}>For {property.category}</span></div>
            </div>
          </div>

          {/* Key Details */}
          <div className="row g-3 mb-4">
            {[
              { icon: <FaBed />, label: 'Bedrooms', value: property.bedrooms || 'N/A' },
              { icon: <FaBath />, label: 'Bathrooms', value: property.bathrooms || 'N/A' },
              { icon: <FaRuler />, label: 'Area', value: property.area_sqft ? `${property.area_sqft} sqft` : 'N/A' },
              { icon: <FaCar />, label: 'Parking', value: property.parking ? 'Yes' : 'No' },
              { icon: <FaCouch />, label: 'Furnished', value: property.furnished_status },
            ].map((item) => (
              <div key={item.label} className="col-6 col-md-4 col-lg">
                <div className="card border-0 bg-light text-center p-2">
                  <div className="text-primary mb-1">{item.icon}</div>
                  <div className="small text-muted">{item.label}</div>
                  <div className="fw-semibold small">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-semibold mb-3">Description</h5>
            <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-semibold mb-3">Amenities</h5>
              <div className="d-flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a.id} className="badge bg-light text-dark border px-3 py-2">{a.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-semibold mb-3">Location</h5>
            <MapComponent lat={property.latitude} lng={property.longitude} title={property.title} />
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-4">
          {/* Owner Card */}
          <div className="card border-0 shadow-sm p-4 mb-3">
            <h6 className="fw-semibold mb-3">Property Owner</h6>
            <div className="d-flex align-items-center gap-3 mb-3">
              {property.owner?.profile_photo
                ? <img src={property.owner.profile_photo} alt="" className="rounded-circle" width={48} height={48} style={{ objectFit: 'cover' }} />
                : <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" style={{ width: 48, height: 48 }}><FaUser /></div>}
              <div>
                <div className="fw-semibold">{property.owner?.full_name}</div>
                <small className="text-muted text-capitalize">{property.owner?.user_type}</small>
              </div>
            </div>
            {property.owner?.mobile && (
              <a href={`tel:${property.owner.mobile}`} className="btn btn-outline-primary w-100 mb-2 d-flex align-items-center justify-content-center gap-2">
                <FaPhone /> {property.owner.mobile}
              </a>
            )}
            {user && user.id !== property.owner?.id && (
              <button onClick={handleChat} className="btn btn-primary w-100 mb-2">💬 Chat with Owner</button>
            )}
            <button onClick={() => navigator.share?.({ title: property.title, url: window.location.href })}
              className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2">
              <FaShare /> Share
            </button>
          </div>

          {/* Inquiry Form */}
          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-semibold mb-3">Send Inquiry</h6>
            <form onSubmit={handleInquiry}>
              <div className="mb-3">
                <select className="form-select form-select-sm" value={inquiry.inquiry_type}
                  onChange={(e) => setInquiry({ ...inquiry, inquiry_type: e.target.value })}>
                  <option value="question">Ask a Question</option>
                  <option value="visit">Schedule Visit</option>
                  <option value="offer">Make an Offer</option>
                </select>
              </div>
              {inquiry.inquiry_type === 'visit' && (
                <div className="mb-3">
                  <input type="date" className="form-control form-control-sm" value={inquiry.visit_date}
                    onChange={(e) => setInquiry({ ...inquiry, visit_date: e.target.value })} />
                </div>
              )}
              <div className="mb-3">
                <textarea className="form-control" rows={4} placeholder="Your message..."
                  value={inquiry.message} onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })} required />
              </div>
              <button className="btn btn-success w-100" disabled={sending}>
                {sending ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Similar Properties */}
      {similar.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-bold mb-3">Similar Properties</h5>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {similar.map((p) => <div key={p.id} className="col"><PropertyCard property={p} /></div>)}
          </div>
        </div>
      )}
    </div>
  );
}
