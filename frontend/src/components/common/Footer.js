import { Link } from 'react-router-dom';
import { FiHome, FiPhone, FiMail, FiInstagram, FiTwitter, FiFacebook, FiMapPin } from 'react-icons/fi';

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      {/* Top bar */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.4)]">
              <FiHome size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Local Property Hub</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Nanjangud · Mysuru</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FiMapPin size={12} className="text-blue-400" />
            Serving Nanjangud &amp; Mysuru, Karnataka
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm leading-relaxed mb-5 text-slate-400">
              Your trusted local real estate platform for Nanjangud and Mysuru.
              Buy, sell, rent homes, plots, shops &amp; commercial properties directly from verified owners.
            </p>
            <div className="flex gap-2">
              {[
                { icon: FiFacebook, href: '#' },
                { icon: FiTwitter,  href: '#' },
                { icon: FiInstagram, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href}
                  className="w-9 h-9 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-600 rounded-xl flex items-center justify-center transition-all duration-200">
                  <Icon size={15} className="text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Properties */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Browse</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ['Buy Property',          '/properties?category=sale'],
                ['Rent Property',         '/properties?category=rent'],
                ['Lease Property',        '/properties?category=lease'],
                ['Plots & Land',          '/properties?property_type=site'],
                ['Commercial Spaces',     '/properties?property_type=shop'],
                ['Properties in Mysuru',  '/properties?city=Mysuru'],
                ['Properties in Nanjangud', '/properties?city=Nanjangud'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                ['List Property Free', '/properties/add'],
                ['Dashboard',          '/dashboard'],
                ['My Properties',      '/my-properties'],
                ['Saved Properties',   '/favorites'],
                ['Privacy Policy',     '/privacy'],
                ['Terms of Service',   '/terms'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Contact</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-2.5">
                <FiPhone size={13} className="text-blue-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FiMail size={13} className="text-blue-400 flex-shrink-0" />
                <span>hello@localpropertyhub.com</span>
              </li>
              <li className="flex items-start gap-2.5 mt-2">
                <FiMapPin size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400">Nanjangud &amp; Mysuru<br />Karnataka, India</span>
              </li>
            </ul>

            {/* CTA */}
            <Link to="/properties/add"
              className="inline-flex items-center gap-2 mt-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-[0_2px_8px_rgba(37,99,235,0.4)]">
              + List Property Free
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {YEAR} Local Property Hub. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span className="flex items-center gap-1">
  built by{" "}
  <a
    href="https://vivekv.me"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:underline"
  >
    vivekv.me
  </a>
</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
