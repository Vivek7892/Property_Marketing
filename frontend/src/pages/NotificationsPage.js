import { useEffect, useState } from 'react';
import { notificationAPI } from '../api';
import { FaBell } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.getAll()
      .then(({ data }) => setNotifications(data.results || data))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('All marked as read');
  };

  return (
    <div className="container my-4" style={{ maxWidth: 700 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0 d-flex align-items-center gap-2"><FaBell /> Notifications</h4>
        {notifications.some((n) => !n.is_read) && (
          <button className="btn btn-outline-primary btn-sm" onClick={markAllRead}>Mark All Read</button>
        )}
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaBell size={40} className="mb-3 opacity-25" />
          <h5>No notifications yet</h5>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          {notifications.map((n, i) => (
            <div key={n.id} className={`p-3 ${i < notifications.length - 1 ? 'border-bottom' : ''} ${!n.is_read ? 'bg-light' : ''}`}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-semibold small">{n.title}</div>
                  <div className="text-muted small">{n.message}</div>
                </div>
                <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0">
                  {!n.is_read && <span className="badge bg-primary rounded-pill" style={{ width: 8, height: 8, padding: 0 }}>&nbsp;</span>}
                  <small className="text-muted">{new Date(n.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
