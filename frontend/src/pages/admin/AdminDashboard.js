import { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { FaUsers, FaBuilding, FaCheckCircle, FaClock, FaEnvelope, FaChartBar } from 'react-icons/fa';
import toast from 'react-hot-toast';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card border-0 shadow-sm p-3 h-100">
      <div className="d-flex align-items-center gap-3">
        <div className={`rounded-3 p-2 bg-${color} bg-opacity-10 text-${color}`}>{icon}</div>
        <div><div className="fs-4 fw-bold">{value}</div><div className="text-muted small">{label}</div></div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getProperties({ status: 'pending' }), adminAPI.getUsers()])
      .then(([s, p, u]) => {
        setStats(s.data);
        setProperties(p.data.results || p.data);
        setUsers(u.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const approveProperty = async (id) => {
    await adminAPI.approveProperty(id);
    toast.success('Property approved');
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setStats((s) => ({ ...s, pending_properties: s.pending_properties - 1, approved_properties: s.approved_properties + 1 }));
  };

  const rejectProperty = async (id) => {
    await adminAPI.rejectProperty(id);
    toast.success('Property rejected');
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setStats((s) => ({ ...s, pending_properties: s.pending_properties - 1 }));
  };

  const toggleUser = async (u) => {
    await adminAPI.updateUser(u.id, { is_active: !u.is_active });
    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, is_active: !x.is_active } : x));
    toast.success('User updated');
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="container-fluid my-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Admin Dashboard</h4>
        <span className="badge bg-primary">Admin Panel</span>
      </div>

      {/* Stats */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-2"><StatCard icon={<FaUsers />} label="Total Users" value={stats.total_users} color="primary" /></div>
          <div className="col-6 col-md-2"><StatCard icon={<FaBuilding />} label="Properties" value={stats.total_properties} color="info" /></div>
          <div className="col-6 col-md-2"><StatCard icon={<FaCheckCircle />} label="Approved" value={stats.approved_properties} color="success" /></div>
          <div className="col-6 col-md-2"><StatCard icon={<FaClock />} label="Pending" value={stats.pending_properties} color="warning" /></div>
          <div className="col-6 col-md-2"><StatCard icon={<FaEnvelope />} label="Inquiries" value={stats.total_inquiries} color="danger" /></div>
          <div className="col-6 col-md-2"><StatCard icon={<FaChartBar />} label="Messages" value={stats.total_messages} color="secondary" /></div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {['overview', 'pending', 'users'].map((t) => (
          <li key={t} className="nav-item">
            <button className={`nav-link text-capitalize ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          </li>
        ))}
      </ul>

      {/* Pending Properties */}
      {tab === 'pending' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h6 className="fw-semibold mb-3">Pending Property Approvals ({properties.length})</h6>
            {properties.length === 0 ? (
              <p className="text-muted">No pending properties.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr><th>Title</th><th>Owner</th><th>Type</th><th>Category</th><th>City</th><th>Price</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-medium">{p.title}</td>
                        <td>{p.owner?.full_name}<br /><small className="text-muted">{p.owner?.email}</small></td>
                        <td className="text-capitalize">{p.property_type}</td>
                        <td className="text-capitalize">{p.category}</td>
                        <td>{p.city}</td>
                        <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                        <td>
                          <button className="btn btn-success btn-sm me-2" onClick={() => approveProperty(p.id)}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => rejectProperty(p.id)}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h6 className="fw-semibold mb-3">All Users ({users.length})</h6>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr><th>Name</th><th>Email</th><th>Type</th><th>Verified</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-medium">{u.full_name}</td>
                      <td>{u.email}</td>
                      <td className="text-capitalize">{u.user_type}</td>
                      <td>{u.is_verified ? <span className="badge bg-success">Yes</span> : <span className="badge bg-secondary">No</span>}</td>
                      <td>{u.is_active ? <span className="badge bg-success">Active</span> : <span className="badge bg-danger">Inactive</span>}</td>
                      <td>
                        <button className={`btn btn-sm ${u.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => toggleUser(u)}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-4">
              <h6 className="fw-semibold mb-3">Listings Breakdown</h6>
              <div className="d-flex flex-column gap-2">
                {[
                  { label: 'Sale Listings', value: stats.sale_listings, color: 'primary' },
                  { label: 'Rent Listings', value: stats.rent_listings, color: 'success' },
                  { label: 'Lease Listings', value: stats.lease_listings, color: 'warning' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="d-flex justify-content-between small mb-1"><span>{item.label}</span><span>{item.value}</span></div>
                    <div className="progress" style={{ height: 8 }}>
                      <div className={`progress-bar bg-${item.color}`} style={{ width: `${stats.approved_properties ? (item.value / stats.approved_properties) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-4">
              <h6 className="fw-semibold mb-3">User Breakdown</h6>
              <div className="d-flex flex-column gap-2">
                {[
                  { label: 'Buyers', value: stats.buyers, color: 'info' },
                  { label: 'Sellers', value: stats.sellers, color: 'success' },
                  { label: 'Agents', value: stats.agents, color: 'warning' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="d-flex justify-content-between small mb-1"><span>{item.label}</span><span>{item.value}</span></div>
                    <div className="progress" style={{ height: 8 }}>
                      <div className={`progress-bar bg-${item.color}`} style={{ width: `${stats.total_users ? (item.value / stats.total_users) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
