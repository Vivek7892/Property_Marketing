import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyAPI } from '../api';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiMapPin, FiExternalLink } from 'react-icons/fi';
import { uploadMultipleToCloudinary } from '../utils/cloudinary';

const PROPERTY_TYPES = ['house', 'apartment', 'villa', 'plot', 'shop', 'office', 'commercial', 'warehouse'];
const AMENITIES_LIST = ['Power Backup', 'Lift', 'Security', 'CCTV', 'Garden', 'Gym', 'Swimming Pool', 'Club House', 'Children Play Area', 'Visitor Parking', 'Gated Community', '24x7 Water Supply'];

function SectionHeader({ title }) {
  return <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 mt-2 pb-2 border-b border-gray-100">{title}</div>;
}

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
        map_url: data.map_url || '',
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
      selectedAmenities.forEach((a) => fd.append('amenity_list', a));

      // Upload new images directly to Cloudinary
      if (newImages.length > 0) {
        toast.loading('Uploading images...', { id: 'img-upload' });
        const imageUrls = await uploadMultipleToCloudinary(newImages, 'properties');
        toast.dismiss('img-upload');
        imageUrls.forEach((url) => fd.append('uploaded_image_urls', url));
      }

      await propertyAPI.update(id, fd);
      toast.success('Property updated!');
      navigate(`/properties/${id}`);
    } catch (err) {
      toast.dismiss('img-upload');
      const errors = err.response?.data;
      toast.error(errors ? Object.values(errors).flat().join(' ') : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <p className="text-gray-500">Property not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-sm text-gray-400 mt-0.5">Update your property details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="lph-card p-6">
            <SectionHeader title="Basic Information" />
            <div className="space-y-4">
              <div>
                <label className="lph-label">Property Title *</label>
                <input className="lph-input" required value={form.title} onChange={(e) => set('title', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="lph-label">Property Type *</label>
                  <select className="lph-select" required value={form.property_type} onChange={(e) => set('property_type', e.target.value)}>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lph-label">Category *</label>
                  <select className="lph-select" required value={form.category} onChange={(e) => set('category', e.target.value)}>
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="lph-label">Description *</label>
                <textarea className="lph-input resize-none" rows={4} required value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="lph-card p-6">
            <SectionHeader title="Price & Area" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="lph-label">Price (₹) *</label>
                <input type="number" className="lph-input" required value={form.price} onChange={(e) => set('price', e.target.value)} />
              </div>
              <div>
                <label className="lph-label">Area (sq ft)</label>
                <input type="number" className="lph-input" value={form.area_sqft} onChange={(e) => set('area_sqft', e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                checked={form.is_negotiable} onChange={(e) => set('is_negotiable', e.target.checked)} />
              <span className="text-sm text-gray-600">Price is negotiable</span>
            </label>
          </div>

          <div className="lph-card p-6">
            <SectionHeader title="Property Details" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {[['Bedrooms', 'bedrooms'], ['Bathrooms', 'bathrooms'], ['Balconies', 'balconies']].map(([label, key]) => (
                <div key={key}>
                  <label className="lph-label">{label}</label>
                  <input type="number" className="lph-input" min={0} value={form[key]} onChange={(e) => set(key, e.target.value)} />
                </div>
              ))}
              <div>
                <label className="lph-label">Furnished</label>
                <select className="lph-select" value={form.furnished_status} onChange={(e) => set('furnished_status', e.target.value)}>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi">Semi-Furnished</option>
                  <option value="furnished">Furnished</option>
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                checked={form.parking} onChange={(e) => set('parking', e.target.checked)} />
              <span className="text-sm text-gray-600">Parking available</span>
            </label>
          </div>

          <div className="lph-card p-6">
            <SectionHeader title="Location" />
            <div className="space-y-3">
              <div>
                <label className="lph-label">Full Address *</label>
                <textarea className="lph-input resize-none" rows={2} required value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Door no., Street, Area..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['Locality *', 'locality', true], ['City *', 'city', true], ['State *', 'state', true], ['Pincode', 'pincode', false]].map(([label, key, req]) => (
                  <div key={key}>
                    <label className="lph-label">{label}</label>
                    <input className="lph-input" required={req} value={form[key]} onChange={(e) => set(key, e.target.value)} />
                  </div>
                ))}
              </div>

              {/* Google Maps URL */}
              <div className="pt-1">
                <label className="lph-label">Google Maps Location Link</label>
                <div className="relative">
                  <FiMapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    className="lph-input pl-10 pr-24"
                    value={form.map_url}
                    onChange={(e) => set('map_url', e.target.value)}
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
                  Open <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Maps</a>, search your location, click Share → Copy Link, then paste above.
                </p>
              </div>
            </div>
          </div>

          <div className="lph-card p-6">
            <SectionHeader title="Amenities" />
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map((a) => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 ${
                    selectedAmenities.includes(a) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="lph-card p-6">
            <SectionHeader title="Property Images" />
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="lph-label mb-2">Current Images</p>
                <div className="flex gap-3 flex-wrap">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img src={img.image} alt="" className="w-24 object-cover rounded-xl border border-gray-100" style={{ height: 72 }} />
                      <button type="button" onClick={() => deleteExistingImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FiX size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-gray-400 transition-colors">
              <FiUpload size={20} className="text-gray-400 mb-1.5" />
              <span className="text-sm font-medium text-gray-600">Add more images</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-24 object-cover rounded-xl border border-gray-100" style={{ height: 72 }} />
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 justify-center text-base">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
