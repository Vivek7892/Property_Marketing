import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      navigate(user.user_type === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-sm p-4">
              <h4 className="fw-bold text-center mb-1">Welcome Back</h4>
              <p className="text-muted text-center small mb-4">Sign in to Local Property Hub</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium">Email</label>
                  <input type="email" className="form-control" required
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Password</label>
                  <input type="password" className="form-control" required
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="d-flex justify-content-end mb-3">
                  <Link to="/forgot-password" className="small text-primary">Forgot Password?</Link>
                </div>
                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  Sign In
                </button>
              </form>
              <p className="text-center mt-3 small">
                Don't have an account? <Link to="/register" className="text-primary fw-medium">Register</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
