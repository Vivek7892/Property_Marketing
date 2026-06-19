import { useState } from 'react';
import { authAPI } from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp: '', new_password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success('OTP sent to your email');
      setStep(2);
    } catch { toast.error('Email not found'); }
    finally { setLoading(false); }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, ...form });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-1">{step === 1 ? 'Forgot Password' : 'Reset Password'}</h5>
              <p className="text-muted small mb-4">{step === 1 ? 'Enter your email to receive OTP' : `Enter OTP sent to ${email}`}</p>
              {step === 1 ? (
                <form onSubmit={sendOtp}>
                  <input type="email" className="form-control mb-3" placeholder="Email address" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button className="btn btn-primary w-100" disabled={loading}>
                    {loading && <span className="spinner-border spinner-border-sm me-2" />} Send OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={resetPassword}>
                  <input className="form-control mb-3" placeholder="Enter OTP" maxLength={6} required value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} />
                  <input type="password" className="form-control mb-3" placeholder="New Password" required value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
                  <button className="btn btn-primary w-100" disabled={loading}>
                    {loading && <span className="spinner-border spinner-border-sm me-2" />} Reset Password
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
