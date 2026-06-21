import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, propertyAPI } from '../api';
import toast from 'react-hot-toast';
import {
  FiCamera, FiUser, FiPhone, FiMapPin, FiSave, FiCheckCircle,
  FiMail, FiShield, FiEdit2
} from 'react-icons/fi';

function ProfileCompletion({ form, user }) {
  const fields = [
    form.full_name,
    form.mobile,
    form.city,
    form.state,
    form.bio,
    user?.profile_photo,
  ];
  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);

  return (
    <div className="lph-card p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-slate-900">Profile Completion</span>
        <span className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{pct}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct < 100 && (
        <p className="text-xs text-slate-400">
          {pct >= 80 ? 'Almost there!' : 'Complete your profile to build trust with buyers & sellers.'}
          {' '}Fill in all fields to reach 100%.
        </p>
      )}
      {pct === 100 && (
        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
          <FiCheckCircle size={12} /> Your profile is complete!
        </p>
      )}
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="lph-label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function SectionCard({ icon, title, children }) {
  return (
    <div className="lph-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
          <span className="text-blue-600">{icon}</span>
        </div>
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loadUser } = useAuth();
  const [form, setForm]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (user) setForm({
      full_name: user.full_name || '',
      mobile:    user.mobile    || '',
      city:      user.city      || '',
      state:     user.state     || '',
      locality:  user.locality  || '',
      bio:       user.bio       || '',
    });
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
      if (fileRef.current?.files[0]) {
        toast.loading('Uploading photo...', { id: 'photo' });
        const { data: imgData } = await propertyAPI.uploadImage(fileRef.current.files[0], 'property_hub/profiles');
        toast.dismiss('photo');
        fd.append('profile_photo_url', imgData.url);
      }
      await authAPI.updateProfile(fd);
      await loadUser();
      toast.success('Profile updated successfully!');
    } catch {
      toast.dismiss('photo');
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (!form) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const avatarSrc = preview
    || user?.profile_photo
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=2563EB&color=fff&size=96&bold=true`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account and build trust with other users</p>
        </div>

        {/* Completion Progress */}
        <ProfileCompletion form={form} user={user} />

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Avatar + Identity Card */}
          <div className="lph-card p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden cursor-pointer ring-4 ring-blue-100 hover:ring-blue-200 transition-all shadow-lg"
                  onClick={() => fileRef.current?.click()}
                >
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-colors"
                >
                  <FiCamera size={14} />
                </button>
                <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>

              {/* Identity info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-bold text-slate-900">{user?.full_name}</h2>
                <p className="text-sm text-slate-400 capitalize mt-0.5">{user?.user_type}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                  <span className="trust-badge">
                    <FiCheckCircle size={11} /> Registered User
                  </span>
                  {user?.mobile && (
                    <span className="trust-badge">
                      <FiPhone size={11} /> Phone Verified
                    </span>
                  )}
                  {user?.is_verified && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                      <FiShield size={11} /> Identity Verified
                    </span>
                  )}
                </div>
              </div>

              <button type="button" onClick={() => fileRef.current?.click()}
                className="btn-ghost text-xs hidden sm:flex">
                <FiEdit2 size={13} /> Change Photo
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <SectionCard icon={<FiUser size={15} />} title="Personal Information">
            <FormField label="Full Name" required>
              <input className="lph-input" value={form.full_name} onChange={set('full_name')} required placeholder="Your full name" />
            </FormField>
            <FormField label="Bio">
              <textarea
                className="lph-input resize-none"
                rows={3}
                value={form.bio}
                onChange={set('bio')}
                placeholder="Tell buyers & sellers about yourself..."
              />
            </FormField>
          </SectionCard>

          {/* Contact */}
          <SectionCard icon={<FiPhone size={15} />} title="Contact Details">
            <FormField label="Mobile Number">
              <input className="lph-input" value={form.mobile} onChange={set('mobile')} placeholder="+91 XXXXX XXXXX" />
            </FormField>
            <FormField label="Email Address">
              <div className="relative">
                <input className="lph-input pr-10 bg-slate-50 cursor-not-allowed" value={user?.email || ''} disabled />
                <FiMail size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Email cannot be changed</p>
            </FormField>
          </SectionCard>

          {/* Location */}
          <SectionCard icon={<FiMapPin size={15} />} title="Location">
            <FormField label="City">
              <input className="lph-input" value={form.city} onChange={set('city')} placeholder="e.g. Mysuru" />
            </FormField>
            <FormField label="State">
              <input className="lph-input" value={form.state} onChange={set('state')} placeholder="e.g. Karnataka" />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Locality / Area">
                <input className="lph-input" value={form.locality} onChange={set('locality')} placeholder="e.g. Vijayanagar, Nanjangud" />
              </FormField>
            </div>
          </SectionCard>

          {/* Save */}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm justify-center">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <FiSave size={15} />
            }
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
