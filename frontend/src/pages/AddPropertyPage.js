import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../api';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = ['house','apartment','villa','plot','shop','office','commercial','warehouse'];
const AMENITIES_LIST = ['Power Backup','Lift','Security','CCTV','Garden','Gym','Swimming Pool','Club House','Children Play Area','Visitor Parking','Gated Community','24x7 Water Supply'];

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', property_type: 'house', category: 'sale',
    price: '', is_negotiable: false, area_sqft: '', bedrooms: 0, bathrooms: 0,
    balconies: 0, parking: false, furnished_status: 'unfurnished',
    address: '', locality: '', city: '', state: '', pincode: '',
    latitude: '', longitude: '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const toggleAmenity = (name) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('uploaded_images', img));
      selectedAmenities.forEach((a) => fd.append('amenity_list', a));
      const { data } = await propertyAPI.create(fd);
      toast.success('Property listed! Pending approval.');
      navigate(`/properties/${data.id}`);
    } catch (err) {
      const errors = err.response?.data;
      toast.error(errors ? Object.values(errors).flat().join(' ') : 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm p-4">
            <h4 className="fw-bold mb-4">List Your Property</h4>
            <form onSubmit={handleSubmit}>
              {/* Basic Info */}
              <h6 className="text-primary fw-semibold mb-3 border-bottom pb-2">Basic Information</h6>
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <label className="form-label fw-medium">Property Title *</label>
                  <input className="form-control" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. 3BHK Apartment in Indiranagar" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Property Type *</label>
                  <select className="form-select" required value={form.property_type} onChange={(e) => set('property_type', e.target.value)}>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Category *</label>
                  <select className="form-select" required value={form.category} onChange={(e) => set('category', e.target.value)}>
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Description *</label>
                  <textarea className="form-control" rows={4} required value={form.description} onChange={(e) => set('description', e.target.value)} />
                </div>
              </div>

              {/* Price & Area */}
              <h6 className="text-primary fw-semibold mb-3 border-bottom pb-2">Price & Area</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Price (₹) *</label>
                  <input type="number" className="form-control" required value={form.price} onChange={(e) => set('price', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Area (sq ft)</label>
                  <input type="number" className="form-control" value={form.area_sqft} onChange={(e) => set('area_sqft', e.target.value)} />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="negotiable" checked={form.is_negotiable}
                      onChange={(e) => set('is_negotiable', e.target.checked)} />
                    <label className="form-check-label" htmlFor="negotiable">Price is Negotiable</label>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <h6 className="text-primary fw-semibold mb-3 border-bottom pb-2">Property Details</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label fw-medium">Bedrooms</label>
                  <input type="number" className="form-control" min={0} value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">Bathrooms</label>
                  <input type="number" className="form-control" min={0} value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">Balconies</label>
                  <input type="number" className="form-control" min={0} value={form.balconies} onChange={(e) => set('balconies', e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">Furnished Status</label>
                  <select className="form-select" value={form.furnished_status} onChange={(e) => set('furnished_status', e.target.value)}>
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi">Semi-Furnished</option>
                    <option value="furnished">Furnished</option>
                  </select>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="parking" checked={form.parking}
                      onChange={(e) => set('parking', e.target.checked)} />
                    <label className="form-check-label" htmlFor="parking">Parking Available</label>
                  </div>
                </div>
              </div>

              {/* Location */}
              <h6 className="text-primary fw-semibold mb-3 border-bottom pb-2">Location</h6>
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <label className="form-label fw-medium">Full Address *</label>
                  <textarea className="form-control" rows={2} required value={form.address} onChange={(e) => set('address', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Locality *</label>
                  <input className="form-control" required value={form.locality} onChange={(e) => set('locality', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">City *</label>
                  <input className="form-control" required value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">State *</label>
                  <input className="form-control" required value={form.state} onChange={(e) => set('state', e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">Pincode</label>
                  <input className="form-control" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">Latitude</label>
                  <input type="number" step="any" className="form-control" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-medium">Longitude</label>
                  <input type="number" step="any" className="form-control" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} />
                </div>
              </div>

              {/* Amenities */}
              <h6 className="text-primary fw-semibold mb-3 border-bottom pb-2">Amenities</h6>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {AMENITIES_LIST.map((a) => (
                  <button key={a} type="button"
                    className={`btn btn-sm ${selectedAmenities.includes(a) ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => toggleAmenity(a)}>{a}</button>
                ))}
              </div>

              {/* Images */}
              <h6 className="text-primary fw-semibold mb-3 border-bottom pb-2">Property Images</h6>
              <div className="mb-4">
                <input type="file" className="form-control mb-2" multiple accept="image/*" onChange={handleImages} />
                <small className="text-muted">First image will be set as primary. Max 10 images.</small>
                {previews.length > 0 && (
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {previews.map((src, i) => (
                      <img key={i} src={src} alt="" className="rounded border" style={{ width: 90, height: 70, objectFit: 'cover' }} />
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-primary btn-lg w-100" type="submit" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                Submit Property for Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
