import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { FiHome, FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi';
import GoogleAuthButton from '../components/common/GoogleAuthButton';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', full_name: '', mobile: '', user_type: 'buyer', password: '', password2: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      const errors = err.response?.data;
      toast.error(errors ? Object.values(errors).flat().join(' ') : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyEmail({ email: form.email, otp });
      toast.success('Email verified! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
            <FiHome size={18} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">Local Property Hub</span>
        </div>

        <div className="lph-card p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-7">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  step >= s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                }`}>{s}</div>
                {s === 1 && <div className={`flex-1 h-px w-12 ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`} />}
              </div>
            ))}
            <span className="text-xs text-gray-400 ml-1">{step === 1 ? 'Create account' : 'Verify email'}</span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {step === 1 ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="text-sm text-gray-400 mb-7">
            {step === 1 ? 'Join Local Property Hub today' : `Enter the OTP sent to ${form.email}`}
          </p>

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="lph-label">Full Name</label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="lph-input pl-10" required placeholder="Your full name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="lph-label">Email</label>
                  <div className="relative">
                    <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" className="lph-input pl-10" required placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="lph-label">Mobile</label>
                  <div className="relative">
                    <FiPhone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="lph-input pl-10" placeholder="+91 XXXXX XXXXX" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <label className="lph-label">I am a</label>
                <select className="lph-select" value={form.user_type} onChange={(e) => set('user_type', e.target.value)}>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="agent">Property Agent</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="lph-label">Password</label>
                  <div className="relative">
                    <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" className="lph-input pl-10" required placeholder="Min 8 chars" value={form.password} onChange={(e) => set('password', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="lph-label">Confirm Password</label>
                  <div className="relative">
                    <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" className="lph-input pl-10" required placeholder="Repeat password" value={form.password2} onChange={(e) => set('password2', e.target.value)} />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center mt-2">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <GoogleAuthButton label="Sign up with Google" />
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="lph-label">6-Digit OTP</label>
                <input
                  className="lph-input text-center text-2xl font-bold tracking-[0.5em]"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary w-full py-3 justify-center">
                Back
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-900 font-semibold hover:text-blue-600 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
