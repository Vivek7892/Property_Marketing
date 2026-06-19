import { Link } from 'react-router-dom';
import { FaHome, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-5 pt-5 pb-3">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <h5 className="fw-bold d-flex align-items-center gap-2 mb-3">
              <FaHome /> Local Property Hub
            </h5>
            <p className="text-white-50 small">
              Find your dream property in your locality. Buy, Sell, Rent Houses, Plots, Shops & Commercial Properties.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#!" className="text-white-50"><FaFacebook size={20} /></a>
              <a href="#!" className="text-white-50"><FaTwitter size={20} /></a>
              <a href="#!" className="text-white-50"><FaInstagram size={20} /></a>
            </div>
          </div>
          <div className="col-md-2">
            <h6 className="fw-semibold mb-3">Properties</h6>
            <ul className="list-unstyled small text-white-50">
              <li className="mb-1"><Link to="/properties?category=sale" className="text-white-50 text-decoration-none">Buy</Link></li>
              <li className="mb-1"><Link to="/properties?category=rent" className="text-white-50 text-decoration-none">Rent</Link></li>
              <li className="mb-1"><Link to="/properties?category=lease" className="text-white-50 text-decoration-none">Lease</Link></li>
              <li className="mb-1"><Link to="/properties?property_type=plot" className="text-white-50 text-decoration-none">Plots</Link></li>
            </ul>
          </div>
          <div className="col-md-2">
            <h6 className="fw-semibold mb-3">Company</h6>
            <ul className="list-unstyled small text-white-50">
              <li className="mb-1"><Link to="/about" className="text-white-50 text-decoration-none">About Us</Link></li>
              <li className="mb-1"><Link to="/contact" className="text-white-50 text-decoration-none">Contact</Link></li>
              <li className="mb-1"><Link to="/privacy" className="text-white-50 text-decoration-none">Privacy Policy</Link></li>
              <li className="mb-1"><Link to="/terms" className="text-white-50 text-decoration-none">Terms</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="fw-semibold mb-3">Contact</h6>
            <ul className="list-unstyled small text-white-50">
              <li className="mb-2 d-flex align-items-center gap-2"><FaPhone /> +91 98765 43210</li>
              <li className="mb-2 d-flex align-items-center gap-2"><FaEnvelope /> hello@localpropertyhub.com</li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary mt-4" />
        <p className="text-center text-white-50 small mb-0">
          © {new Date().getFullYear()} Local Property Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
