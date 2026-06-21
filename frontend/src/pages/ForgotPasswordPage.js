import { useState } from 'react';
import { authAPI } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiHome, FiMail, FiLock } from 'react-icons/fi';

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
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
            <FiHome size={18} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">Local Property Hub</span>
        </div>

        <div className="lph-card p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {step === 1 ? 'Forgot password?' : 'Reset password'}
          </h1>
          <p className="text-sm text-gray-400 mb-7">
            {step === 1 ? 'Enter your email and we\'ll send you an OTP' : `Enter the OTP sent to ${email}`}
          </p>

          {step === 1 ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="lph-label">Email Address</label>
                <div className="relative">
                  <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    className="lph-input pl-10"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="lph-label">OTP Code</label>
                <input
                  className="lph-input text-center text-xl font-bold tracking-[0.4em]"
                  placeholder="000000"
                  maxLength={6}
                  required
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                />
              </div>
              <div>
                <label className="lph-label">New Password</label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    className="lph-input pl-10"
                    placeholder="Min 8 characters"
                    required
                    value={form.new_password}
                    onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 justify-center">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-gray-900 font-semibold hover:text-blue-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
