import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI, inquiryAPI, notificationAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiHeart, FiMail, FiBell, FiPlus, FiEye, FiArrowRight,
  FiCheckCircle, FiClock, FiXCircle, FiTrendingUp, FiEdit, FiExternalLink
} from 'react-icons/fi';

const STATUS_STYLES = {
  approved: { cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100', icon: <FiCheckCircle size={10} /> },
  pending:  { cls: 'bg-amber-50 text-amber-700 border border-amber-100',       icon: <FiClock size={10} /> },
  rejected: { cls: 'bg-red-50 text-red-600 border border-red-100',             icon: <FiXCircle size={10} /> },
  sold:     { cls: 'bg-slate-100 text-slate-600',                               icon: <FiCheckCircle size={10} /> },
};

function StatCard({ icon, label, value, change, accent, iconBg }) {
  return (
    <div className="lph-card p-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${iconBg} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            <FiTrendingUp size={10} /> {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 leading-tight mb-1">{value}</div>
      <div className="text-sm text-slate-400 font-medium">{label}</div>
    </div>
  );
}

function formatPrice(price) {
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [myProps, setMyProps]         = useState([]);
  const [inquiries, setInquiries]     = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites]     = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const isSeller = ['seller', 'agent'].includes(user?.user_type);
    Promise.all([
      propertyAPI.myProperties(),
      propertyAPI.getFavorites(),
      isSeller ? inquiryAPI.getReceived() : inquiryAPI.getSent(),
      notificationAPI.getAll(),
    ]).then(([propRes, favRes, inqRes, notifRes]) => {
      setMyProps(propRes.data.results || propRes.data);
      setFavorites(favRes.data.results || favRes.data);
      setInquiries(inqRes.data.results || inqRes.data);
      setNotifications((notifRes.data.results || notifRes.data).slice(0, 5));
    }).finally(() => setLoading(false));
  }, [user]);

  const approved    = myProps.filter((p) => p.status === 'approved').length;
  const totalViews  = myProps.reduce((acc, p) => acc + (p.views_count || 0), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-full opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">{greeting},</p>
              <h1 className="text-2xl font-bold text-white">
                {user?.full_name?.split(' ')[0]} 👋
              </h1>
              <p className="text-blue-200 text-sm mt-1 capitalize">{user?.user_type} Dashboard · Local Property Hub</p>
            </div>
            <Link to="/properties/add" className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg self-start sm:self-auto text-sm flex-shrink-0">
              <FiPlus size={15} /> List New Property
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FiHome size={18} className="text-blue-600" />}
            iconBg="bg-blue-50"
            label="My Properties" value={myProps.length}
          />
          <StatCard
            icon={<FiEye size={18} className="text-violet-600" />}
            iconBg="bg-violet-50"
            label="Total Views" value={totalViews.toLocaleString()}
            change={12}
          />
          <StatCard
            icon={<FiMail size={18} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="Inquiries" value={inquiries.length}
            change={inquiries.length > 0 ? 8 : 0}
          />
          <StatCard
            icon={<FiHeart size={18} className="text-rose-500" />}
            iconBg="bg-rose-50"
            label="Saved Properties" value={favorites.length}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* My Properties Table */}
          <div className="lg:col-span-2 lph-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900">My Properties</h2>
                <p className="text-xs text-slate-400 mt-0.5">{approved} approved · {myProps.length - approved} pending</p>
              </div>
              <Link to="/my-properties" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                View all <FiArrowRight size={12} />
              </Link>
            </div>

            {myProps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <FiHome size={24} className="text-blue-400" />
                </div>
                <p className="text-sm font-bold text-slate-700 mb-1">No properties yet</p>
                <p className="text-xs text-slate-400 mb-5">List your first property and start getting inquiries</p>
                <Link to="/properties/add" className="btn-primary text-xs">
                  <FiPlus size={13} /> List Property Free
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/60">
                      <th className="text-left px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Price</th>
                      <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {myProps.slice(0, 7).map((p) => {
                      const s = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900 truncate max-w-[200px] text-sm">{p.title}</p>
                            <p className="text-xs text-slate-400 capitalize mt-0.5">{p.category} · {p.property_type}</p>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-900 hidden sm:table-cell">
                            {formatPrice(p.price)}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`lph-badge text-[11px] ${s.cls}`}>
                              {s.icon} {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Link to={`/properties/${p.id}`} title="View" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <FiExternalLink size={13} />
                              </Link>
                              <Link to={`/properties/${p.id}/edit`} title="Edit" className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                                <FiEdit size={13} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="lph-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Recent Activity</h2>
              <Link to="/notifications" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                See all <FiArrowRight size={12} />
              </Link>
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                  <FiBell size={18} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">All caught up!</p>
                <p className="text-xs text-slate-400 mt-0.5">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-5 py-3.5 transition-colors ${!n.is_read ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.is_read ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        <FiBell size={13} className={!n.is_read ? 'text-blue-600' : 'text-slate-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-snug ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-300 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        {inquiries.length > 0 && (
          <div className="lph-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Recent Inquiries</h2>
              <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-lg">{inquiries.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/60">
                    <th className="text-left px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Message</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {inquiries.slice(0, 5).map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-slate-900 truncate max-w-[180px]">{inq.property_title || 'Property'}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="tag-chip capitalize">{inq.inquiry_type}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 truncate max-w-[200px] hidden sm:table-cell">
                        {inq.message}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">{timeAgo(inq.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
