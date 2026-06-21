import { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { FiUsers, FiHome, FiCheckCircle, FiClock, FiMail, FiBarChart2, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="lph-card p-5">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${accent}`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

const TABS = ['overview', 'pending', 'users'];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiShield size={20} /> Admin Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Platform management & oversight</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard icon={<FiUsers size={18} className="text-blue-600" />} label="Total Users" value={stats.total_users} accent="bg-blue-50" />
            <StatCard icon={<FiHome size={18} className="text-gray-700" />} label="Properties" value={stats.total_properties} accent="bg-gray-100" />
            <StatCard icon={<FiCheckCircle size={18} className="text-emerald-600" />} label="Approved" value={stats.approved_properties} accent="bg-emerald-50" />
            <StatCard icon={<FiClock size={18} className="text-amber-600" />} label="Pending" value={stats.pending_properties} accent="bg-amber-50" />
            <StatCard icon={<FiMail size={18} className="text-purple-600" />} label="Inquiries" value={stats.total_inquiries} accent="bg-purple-50" />
            <StatCard icon={<FiBarChart2 size={18} className="text-rose-500" />} label="Messages" value={stats.total_messages} accent="bg-rose-50" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-2xl w-fit">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-medium rounded-xl capitalize transition-all duration-200 ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t}
              {t === 'pending' && properties.length > 0 && (
                <span className="ml-2 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full inline-flex items-center justify-center">
                  {properties.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Properties */}
        {tab === 'pending' && (
          <div className="lph-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="section-title">Pending Approvals ({properties.length})</h2>
            </div>
            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <FiCheckCircle size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">All caught up — no pending properties</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Property', 'Owner', 'Type', 'City', 'Price', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {properties.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900 max-w-[180px] truncate">{p.title}</p>
                          <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-gray-700">{p.owner?.full_name}</p>
                          <p className="text-xs text-gray-400">{p.owner?.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 capitalize">{p.property_type}</td>
                        <td className="px-5 py-3.5 text-gray-500">{p.city}</td>
                        <td className="px-5 py-3.5 font-medium text-gray-900">₹{Number(p.price).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-2">
                            <button onClick={() => approveProperty(p.id)} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => rejectProperty(p.id)} className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors">
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="lph-card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="section-title">All Users ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Name', 'Email', 'Type', 'Verified', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{u.full_name}</td>
                      <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                      <td className="px-5 py-3.5 text-gray-500 capitalize">{u.user_type}</td>
                      <td className="px-5 py-3.5">
                        <span className={`lph-badge ${u.is_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`lph-badge ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => toggleUser(u)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                            u.is_active
                              ? 'text-red-600 border-red-100 bg-red-50 hover:bg-red-100'
                              : 'text-emerald-700 border-emerald-100 bg-emerald-50 hover:bg-emerald-100'
                          }`}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="lph-card p-6">
              <h3 className="section-title mb-5">Listings Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Sale Listings', value: stats.sale_listings, total: stats.approved_properties, cls: 'bg-gray-900' },
                  { label: 'Rent Listings', value: stats.rent_listings, total: stats.approved_properties, cls: 'bg-blue-600' },
                  { label: 'Lease Listings', value: stats.lease_listings, total: stats.approved_properties, cls: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.cls}`}
                        style={{ width: `${item.total ? (item.value / item.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lph-card p-6">
              <h3 className="section-title mb-5">User Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Buyers', value: stats.buyers, total: stats.total_users, cls: 'bg-blue-600' },
                  { label: 'Sellers', value: stats.sellers, total: stats.total_users, cls: 'bg-emerald-600' },
                  { label: 'Agents', value: stats.agents, total: stats.total_users, cls: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.cls}`}
                        style={{ width: `${item.total ? (item.value / item.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
