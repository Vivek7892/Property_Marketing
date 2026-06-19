import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', full_name: '', mobile: '', user_type: 'buyer', password: '', password2: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

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
      const msg = errors ? Object.values(errors).flat().join(' ') : 'Registration failed';
      toast.error(msg);
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

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-4">
              <h4 className="fw-bold text-center mb-1">{step === 1 ? 'Create Account' : 'Verify Email'}</h4>
              <p className="text-muted text-center small mb-4">
                {step === 1 ? 'Join Local Property Hub' : `Enter OTP sent to ${form.email}`}
              </p>

              {step === 1 ? (
                <form onSubmit={handleRegister}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-medium">Full Name</label>
                      <input className="form-control" required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Email</label>
                      <input type="email" className="form-control" required value={form.email} onChange={(e) => set('email', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Mobile</label>
                      <input className="form-control" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">I am a</label>
                      <select className="form-select" value={form.user_type} onChange={(e) => set('user_type', e.target.value)}>
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="agent">Property Agent</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Password</label>
                      <input type="password" className="form-control" required value={form.password} onChange={(e) => set('password', e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Confirm Password</label>
                      <input type="password" className="form-control" required value={form.password2} onChange={(e) => set('password2', e.target.value)} />
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary w-100" disabled={loading}>
                        {loading && <span className="spinner-border spinner-border-sm me-2" />}
                        Create Account
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerify}>
                  <div className="mb-3">
                    <label className="form-label fw-medium">Enter 6-digit OTP</label>
                    <input className="form-control form-control-lg text-center letter-spacing-3" maxLength={6}
                      value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  </div>
                  <button className="btn btn-primary w-100" disabled={loading}>
                    {loading && <span className="spinner-border spinner-border-sm me-2" />}
                    Verify & Continue
                  </button>
                </form>
              )}

              <p className="text-center mt-3 small">
                Already have an account? <Link to="/login" className="text-primary fw-medium">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
