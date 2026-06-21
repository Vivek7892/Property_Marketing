import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import {
  FiBell, FiHeart, FiUser, FiMenu, FiX, FiPlus, FiLogOut,
  FiSettings, FiGrid, FiHome, FiMessageSquare, FiSearch, FiList
} from 'react-icons/fi';

const NAV_LINKS = [
  { label: 'Buy',        to: '/properties?category=sale' },
  { label: 'Rent',       to: '/properties?category=rent' },
  { label: 'Lease',      to: '/properties?category=lease' },
  { label: 'Commercial', to: '/properties?property_type=shop' },
  { label: 'Plots',      to: '/properties?property_type=site' },
];

const MOBILE_NAV = [
  { icon: FiHome,         label: 'Home',       to: '/' },
  { icon: FiSearch,       label: 'Search',     to: '/properties' },
  { icon: FiHeart,        label: 'Saved',      to: '/favorites' },
  { icon: FiMessageSquare,label: 'Chat',       to: '/chat' },
  { icon: FiUser,         label: 'Profile',    to: '/profile' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { unreadCount } = useNotifications();
  const dropdownRef = useRef(null);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (to) => {
    const path = to.split('?')[0];
    const search = to.includes('?') ? to.split('?')[1] : '';
    return location.pathname === path && (!search || location.search.includes(search));
  };

  return (
    <>
      {/* ── Desktop Navbar ─────────────────────────────── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_20px_rgba(0,0,0,0.08)] border-b border-slate-100'
          : 'bg-white border-b border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-9 h-9 bg-[#0F172A] rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.30)] group-hover:shadow-[0_4px_16px_rgba(15,23,42,0.40)] transition-shadow">
                <FiHome size={16} className="text-[#D4AF37]" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0F172A] tracking-tight">Local Property Hub</span>
                <span className="block text-[9px] text-slate-400 font-medium -mt-0.5 tracking-wider uppercase">Nanjangud · Mysuru</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(to)
                      ? 'text-[#D4AF37] bg-[#D4AF37]/8 font-semibold'
                      : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    to="/favorites"
                    className="relative p-2.5 text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-all duration-200"
                    title="Saved"
                  >
                    <FiHeart size={18} />
                  </Link>

                  <Link
                    to="/notifications"
                    className="relative p-2.5 text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-all duration-200"
                    title="Notifications"
                  >
                    <FiBell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#D4AF37] text-[#111827] text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link to="/properties/add" className="btn-primary ml-1 h-9 px-4 text-sm">
                    <FiPlus size={14} /> List Property Free
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative ml-1" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2.5 px-2 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                    >
                      {user.profile_photo
                        ? <img src={user.profile_photo} alt="" className="w-7 h-7 rounded-lg object-cover" />
                        : (
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{user.full_name?.[0]?.toUpperCase()}</span>
                          </div>
                        )
                      }
                      <span className="text-sm font-medium text-slate-700">{user.full_name?.split(' ')[0]}</span>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 lph-card py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
                          <p className="text-xs text-slate-400 capitalize mt-0.5">{user.user_type} · {user.email?.split('@')[0]}</p>
                        </div>
                        <div className="py-1">
                          {[
                            { to: '/dashboard',      icon: <FiGrid size={14} />,        label: 'Dashboard' },
                            { to: '/profile',         icon: <FiSettings size={14} />,    label: 'Profile Settings' },
                            { to: '/my-properties',   icon: <FiList size={14} />,        label: 'My Properties' },
                            { to: '/chat',            icon: <FiMessageSquare size={14} />, label: 'Messages' },
                            ...(user.user_type === 'admin' ? [{ to: '/admin', icon: <FiSettings size={14} />, label: 'Admin Panel' }] : []),
                          ].map(({ to, icon, label }) => (
                            <Link key={to} to={to} onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors rounded-lg mx-1">
                              <span className="text-slate-400">{icon}</span>{label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-slate-100 py-1">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-lg mx-1 text-left">
                            <FiLogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost">Log In</Link>
                  <Link to="/register" className="btn-primary h-9 px-5 text-sm">Get Started Free</Link>
                </>
              )}
            </div>

            {/* Mobile burger */}
            <button
              className="md:hidden p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {NAV_LINKS.map(({ label, to }) => (
              <Link key={label} to={to} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                {label}
              </Link>
            ))}
            {user ? (
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <Link to="/properties/add" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center">
                  <FiPlus size={14} /> List Property Free
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 flex gap-2 border-t border-slate-100">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-secondary justify-center">Log In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary justify-center">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ── Mobile Bottom Navigation ───────────────────────── */}
      {user && (
        <div className="mobile-nav pb-safe">
          {MOBILE_NAV.map(({ icon: Icon, label, to }) => {
            const active = location.pathname === to.split('?')[0];
            return (
              <Link key={to} to={to}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                  active ? 'text-[#D4AF37]' : 'text-slate-400'
                }`}>
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
                {label === 'Chat' && unreadCount > 0 && (
                  <span className="absolute top-2 mt-0.5 ml-4 w-3.5 h-3.5 bg-blue-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
