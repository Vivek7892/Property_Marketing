import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { FaBell, FaHeart, FaUser, FaHome, FaBars } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2" to="/">
          <FaHome size={24} /> Local Property Hub
        </Link>

        <button className="navbar-toggler border-0" onClick={() => setExpanded(!expanded)}>
          <FaBars />
        </button>

        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto gap-1">
            <li className="nav-item"><Link className="nav-link" to="/properties">Properties</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/properties?category=sale">Buy</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/properties?category=rent">Rent</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/properties?category=lease">Lease</Link></li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <Link to="/favorites" className="text-secondary"><FaHeart size={18} /></Link>
                <Link to="/notifications" className="text-secondary position-relative">
                  <FaBell size={18} />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 9 }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="dropdown">
                  <button className="btn btn-outline-primary btn-sm dropdown-toggle d-flex align-items-center gap-1" data-bs-toggle="dropdown">
                    {user.profile_photo
                      ? <img src={user.profile_photo} alt="" className="rounded-circle" width={24} height={24} style={{ objectFit: 'cover' }} />
                      : <FaUser />}
                    {user.full_name?.split(' ')[0]}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/dashboard">Dashboard</Link></li>
                    <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                    <li><Link className="dropdown-item" to="/my-properties">My Properties</Link></li>
                    <li><Link className="dropdown-item" to="/chat">Messages</Link></li>
                    {user.user_type === 'admin' && (
                      <li><Link className="dropdown-item" to="/admin">Admin Panel</Link></li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
            {user && (
              <Link to="/properties/add" className="btn btn-success btn-sm">+ List Property</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
