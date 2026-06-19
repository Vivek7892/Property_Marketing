import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loadUser } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name, mobile: user.mobile || '', city: user.city || '', state: user.state || '', locality: user.locality || '', bio: user.bio || '' });
  }, [user]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (fileRef.current?.files[0]) fd.append('profile_photo', fileRef.current.files[0]);
      await authAPI.updateProfile(fd);
      await loadUser();
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card border-0 shadow-sm p-4">
            <h4 className="fw-bold mb-4">Edit Profile</h4>
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
                <img
                  src={preview || user?.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=0d6efd&color=fff&size=96`}
                  alt="Profile"
                  className="rounded-circle border border-3 border-primary"
                  width={96} height={96}
                  style={{ objectFit: 'cover' }}
                />
                <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1">
                  <small className="text-white">✏️</small>
                </div>
              </div>
              <input type="file" ref={fileRef} accept="image/*" className="d-none" onChange={handlePhoto} />
              <p className="small text-muted mt-1">Click to change photo</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Full Name</label>
                  <input className="form-control" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Mobile</label>
                  <input className="form-control" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">City</label>
                  <input className="form-control" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">State</label>
                  <input className="form-control" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Locality</label>
                  <input className="form-control" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Bio</label>
                  <textarea className="form-control" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
              </div>
              <button className="btn btn-primary mt-4 w-100" disabled={loading}>
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
