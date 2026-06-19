import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyAPI } from '../api';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = ['house', 'apartment', 'villa', 'plot', 'shop', 'office', 'commercial', 'warehouse'];
const AMENITIES_LIST = ['Power Backup', 'Lift', 'Security', 'CCTV', 'Garden', 'Gym', 'Swimming Pool', 'Club House', 'Children Play Area', 'Visitor Parking', 'Gated Community', '24x7 Water Supply'];

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => {
    propertyAPI.get(id).then(({ data }) => {
      setForm({
        title: data.title, description: data.description,
        property_type: data.property_type, category: data.category,
        price: data.price, is_negotiable: data.is_negotiable,
        area_sqft: data.area_sqft || '', bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0, balconies: data.balconies || 0,
        parking: data.parking, furnished_status: data.furnished_status,
        address: data.address, locality: data.locality, city: data.city,
        state: data.state, pincode: data.pincode || '',
        latitude: data.latitude || '', longitude: data.longitude || '',
      });
      setExistingImages(data.images || []);
      setSelectedAmenities(data.amenities?.map((a) => a.name) || []);
    }).catch(() => toast.error('Property not found'))
      .finally(() => setFetching(false));
  }, [id]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const deleteExistingImage = async (imgId) => {
    try {
      await propertyAPI.deleteImage(imgId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imgId));
      toast.success('Image removed');
    } catch { toast.error('Failed to remove image'); }
  };

  const toggleAmenity = (name) =>
    setSelectedAmenities((prev) => prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      newImages.forEach((img) => fd.append('uploaded_images', img));
      selectedAmenities.forEach((a) => fd.append('amenity_list', a));
      await propertyAPI.update(id, fd);
      toast.success('Property updated!');
      navigate(`/properties/${id}`);
    } catch (err) {
      const errors = err.response?.data;
      toast.error(errors ? Object.values(errors).flat().join(' ') : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>;
  if (!form) return <div className="container py-5 text-center"><h4>Property not found</h4></div>;

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm p-4">
            <h4 className="fw-bold mb-4">Edit Property</h4>
            <form onSubmit={handleSubmit}>

              <h6 className="text-primary fw-semibold mb-3 border-bottom pb-2">Basic Information</h6>
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <label className="form-label fw-medium">Property Title *</label>
                  <input className="form-control" required value={form.title} onChange={(e) => set('title', e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Property Type *</label>
                  <select className="form-select" value={form.property_type} onChange={(e) => set('property_type', e.target.value)}>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Category *</label>
                  <select className="form-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
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
                    <input type="checkbox" className="form-check-input" id="negotiable" checked={form.is_negotiable} onChange={(e) => set('is_negotiable', e.target.checked)} />
                    <label className="form-check-label" htmlFor="negotiable">Price is Negotiable</label>
                  </div>
                </div>
              </div>

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
                    <input type="checkbox" className="form-check-input" id="parking" checked={form.parking} onChange={(e) => set('parking', e.target.checked)} />
                    <label className="form-check-label" htmlFor="parking">Parking Available</label>
                  </div>
                </div>
              </div>

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
                <div className="col-md-2">
                  <label className="form-label fw-medium">Pincode</label>
                  <input className="form-control" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-medium">Latitude</label>
                  <input type="number" step="any" className="form-control" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-medium">Longitude</label>
                  <input type="number" step="any" className="form-control" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} />
                </div>
              </div>

              <h6 className="text-primary fw-semibold mb-3 border-bottom pb-2">Amenities</h6>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {AMENITIES_LIST.map((a) => (
                  <button key={a} type="button"
                    className={`btn btn-sm ${selectedAmenities.includes(a) ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => toggleAmenity(a)}>{a}</button>
                ))}
              </div>

              <h6 className="text-primary fw-semibold mb-3 border-bottom pb-2">Property Images</h6>
              {existingImages.length > 0 && (
                <div className="d-flex gap-2 flex-wrap mb-3">
                  {existingImages.map((img) => (
                    <div key={img.id} className="position-relative">
                      <img src={img.image} alt="" className="rounded border" style={{ width: 90, height: 70, objectFit: 'cover' }} />
                      <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 lh-1"
                        style={{ width: 20, height: 20, fontSize: 10 }}
                        onClick={() => deleteExistingImage(img.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mb-4">
                <input type="file" className="form-control mb-1" multiple accept="image/*" onChange={handleImages} />
                <small className="text-muted">Add more images</small>
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
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
