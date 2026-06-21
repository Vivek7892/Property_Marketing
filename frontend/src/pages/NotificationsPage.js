import { useEffect, useState } from 'react';
import { notificationAPI } from '../api';
import { FiBell, FiCheckCircle, FiHome, FiMail, FiStar, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

function groupByDate(notifications) {
  const groups = {};
  notifications.forEach((n) => {
    const d = new Date(n.created_at);
    const today     = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    let label;
    if (d.toDateString() === today.toDateString())     label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function notifIcon(n) {
  const t = n.title?.toLowerCase() || '';
  if (t.includes('approv') || t.includes('verif'))
    return { icon: <FiCheckCircle size={15} />, bg: 'bg-emerald-100', color: 'text-emerald-600' };
  if (t.includes('inquiry') || t.includes('message'))
    return { icon: <FiMail size={15} />,         bg: 'bg-blue-100',    color: 'text-blue-600' };
  if (t.includes('reject') || t.includes('expired'))
    return { icon: <FiAlertCircle size={15} />,  bg: 'bg-red-100',     color: 'text-red-500' };
  if (t.includes('save') || t.includes('favour'))
    return { icon: <FiStar size={15} />,          bg: 'bg-amber-100',   color: 'text-amber-600' };
  if (t.includes('propert'))
    return { icon: <FiHome size={15} />,          bg: 'bg-violet-100',  color: 'text-violet-600' };
  return { icon: <FiBell size={15} />,             bg: 'bg-slate-100',   color: 'text-slate-500' };
}

function SkeletonItem() {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <div className="w-10 h-10 skeleton rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 skeleton rounded w-1/3" />
        <div className="h-3 skeleton rounded w-3/4" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

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

  const markOne = (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const grouped     = groupByDate(notifications);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-400 mt-1">
                <span className="font-bold text-blue-600">{unreadCount}</span> unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3.5 py-2 rounded-xl transition-all"
            >
              <FiCheckCircle size={13} /> Mark all read
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="lph-card divide-y divide-slate-50 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div className="lph-card flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
                <FiBell size={32} className="text-slate-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                <FiCheckCircle size={13} className="text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">You're all caught up!</h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              No notifications yet. We'll notify you about inquiries, property approvals, and saved property updates.
            </p>
          </div>
        )}

        {/* Grouped Notifications */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-5">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{date}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="lph-card divide-y divide-slate-50 overflow-hidden">
                  {items.map((n) => {
                    const { icon, bg, color } = notifIcon(n);
                    return (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && markOne(n.id)}
                        className={`flex items-start gap-4 px-5 py-4 transition-colors cursor-default ${
                          !n.is_read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Icon */}
                        <div className={`w-10 h-10 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                          {icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!n.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">{timeAgo(n.created_at)}</span>
                          {!n.is_read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
