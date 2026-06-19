import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI, inquiryAPI, notificationAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaHeart, FaEnvelope, FaBell, FaPlus, FaEye } from 'react-icons/fa';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card border-0 shadow-sm p-4 h-100">
      <div className="d-flex align-items-center gap-3">
        <div className={`rounded-3 p-3 bg-${color} bg-opacity-10 text-${color}`}>{icon}</div>
        <div>
          <div className="fs-3 fw-bold">{value}</div>
          <div className="text-muted small">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [myProps, setMyProps] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    propertyAPI.myProperties().then(({ data }) => setMyProps(data.results || data));
    propertyAPI.getFavorites().then(({ data }) => setFavorites(data.results || data));
    if (['seller', 'agent'].includes(user?.user_type)) {
      inquiryAPI.getReceived().then(({ data }) => setInquiries(data.results || data));
    } else {
      inquiryAPI.getSent().then(({ data }) => setInquiries(data.results || data));
    }
    notificationAPI.getAll().then(({ data }) => setNotifications((data.results || data).slice(0, 5)));
  }, [user]);

  const approved = myProps.filter((p) => p.status === 'approved').length;
  const pending = myProps.filter((p) => p.status === 'pending').length;

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Welcome, {user?.full_name?.split(' ')[0]}!</h4>
          <p className="text-muted mb-0 small text-capitalize">{user?.user_type} Dashboard</p>
        </div>
        <Link to="/properties/add" className="btn btn-primary d-flex align-items-center gap-2">
          <FaPlus /> List Property
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-4">
        <div className="col-6 col-md-3">
          <StatCard icon={<FaHome size={22} />} label="My Properties" value={myProps.length} color="primary" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon={<FaEye size={22} />} label="Approved" value={approved} color="success" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon={<FaEnvelope size={22} />} label="Inquiries" value={inquiries.length} color="warning" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon={<FaHeart size={22} />} label="Saved" value={favorites.length} color="danger" />
        </div>
      </div>

      <div className="row g-4">
        {/* My Properties */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0">My Properties</h6>
                <Link to="/my-properties" className="small text-primary">View All</Link>
              </div>
              {myProps.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <FaHome size={32} className="mb-2 opacity-25" />
                  <p>No properties listed yet.</p>
                  <Link to="/properties/add" className="btn btn-primary btn-sm">List Now</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr><th>Property</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr>
                    </thead>
                    <tbody>
                      {myProps.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td className="fw-medium text-truncate" style={{ maxWidth: 200 }}>{p.title}</td>
                          <td className="text-capitalize">{p.category}</td>
                          <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                          <td><span className={`badge ${p.status === 'approved' ? 'bg-success' : p.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>{p.status}</span></td>
                          <td><Link to={`/properties/${p.id}`} className="btn btn-link btn-sm p-0">View</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0 d-flex align-items-center gap-2"><FaBell /> Notifications</h6>
                <Link to="/notifications" className="small text-primary">See All</Link>
              </div>
              {notifications.length === 0 ? (
                <p className="text-muted small text-center py-3">No notifications</p>
              ) : notifications.map((n) => (
                <div key={n.id} className={`border-bottom pb-2 mb-2 ${!n.is_read ? 'bg-light rounded p-2' : ''}`}>
                  <div className="small fw-medium">{n.title}</div>
                  <div className="small text-muted">{n.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
