import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../api';
import PropertyCard from '../components/property/PropertyCard';
import SearchBar from '../components/property/SearchBar';
import {
  FiArrowRight, FiHome, FiShoppingBag, FiMap, FiShoppingCart,
  FiTrendingUp, FiCheckCircle, FiShield, FiUsers, FiStar,
  FiChevronRight
} from 'react-icons/fi';

/* ─── Static data ─────────────────────────────────────────────── */

const TRUST = [
  { icon: <FiCheckCircle size={14} />, label: 'Verified Listings' },
  { icon: <FiShield size={14} />,      label: 'Verified Owners' },
  { icon: <FiStar size={14} />,        label: 'No Brokerage Options' },
  { icon: <FiUsers size={14} />,       label: 'Local Experts' },
];

const STATS = [
  { value: '500+',   label: 'Active Listings',   color: 'text-blue-600' },
  { value: '1,200+', label: 'Happy Customers',   color: 'text-emerald-600' },
  { value: '2',      label: 'Cities Covered',    color: 'text-amber-600' },
  { value: '₹50Cr+', label: 'Transactions Done', color: 'text-blue-600' },
];

const CATEGORIES = [
  {
    label: 'Buy',      value: 'sale',                          icon: <FiShoppingCart size={22} />,
    desc: 'Own your dream property',    color: 'from-blue-500 to-blue-600',   bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  {
    label: 'Rent',     value: 'rent',                          icon: <FiHome size={22} />,
    desc: 'Find a rental home',         color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  {
    label: 'Lease',    value: 'lease',                         icon: <FiTrendingUp size={22} />,
    desc: 'Long-term leasing options',  color: 'from-amber-500 to-amber-600',  bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  {
    label: 'Plots',    value: 'sale&property_type=site',       icon: <FiMap size={22} />,
    desc: 'Land & open plots',          color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50',
    text: 'text-violet-600',
  },
  {
    label: 'Commercial', value: 'rent&property_type=shop',    icon: <FiShoppingBag size={22} />,
    desc: 'Shops & commercial spaces',  color: 'from-rose-500 to-rose-600',   bg: 'bg-rose-50',
    text: 'text-rose-600',
  },
];

const LOCALITIES = [
  {
    name: 'Nanjangud Town',   city: 'Nanjangud',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=70',
    count: '120+ Properties', avgPrice: '₹35L avg', trending: true,
  },
  {
    name: 'Mysuru City',      city: 'Mysuru',
    image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=70',
    count: '340+ Properties', avgPrice: '₹65L avg', trending: true,
  },
  {
    name: 'Hebbal, Mysuru',   city: 'Mysuru',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f28f27cb?w=400&q=70',
    count: '80+ Properties',  avgPrice: '₹55L avg', trending: false,
  },
  {
    name: 'V.V. Mohalla',     city: 'Mysuru',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70',
    count: '60+ Properties',  avgPrice: '₹75L avg', trending: true,
  },
];

const TESTIMONIALS = [
  {
    name: 'Rajesh Kumar', role: 'Home Buyer',
    text: 'Found my dream house in Nanjangud within 2 weeks. The verified listings saved me so much time.',
    rating: 5, city: 'Nanjangud',
  },
  {
    name: 'Priya Murthy', role: 'Seller',
    text: 'Listed my property and received genuine inquiries immediately. No brokerage fees!',
    rating: 5, city: 'Mysuru',
  },
  {
    name: 'Venkatesh S.', role: 'Tenant',
    text: 'Found a perfect shop space for my business. The location map feature is incredibly helpful.',
    rating: 5, city: 'Mysuru',
  },
];

/* ─── Skeleton ────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="lph-card overflow-hidden">
      <div className="h-52 skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded w-1/2" />
        <div className="h-4 skeleton rounded w-4/5" />
        <div className="h-3 skeleton rounded w-2/3" />
        <div className="h-6 skeleton rounded w-1/3 mt-4" />
      </div>
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHead({ label, title, sub, cta, ctaTo }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
      <div>
        {label && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
            <span className="w-5 h-0.5 bg-blue-600 rounded" /> {label}
          </span>
        )}
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {sub && <p className="text-slate-500 text-sm mt-1">{sub}</p>}
      </div>
      {cta && (
        <Link to={ctaTo} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap group">
          {cta} <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyAPI.featured()
      .then(({ data }) => setFeatured(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#F8FAFC] pb-20 md:pb-0">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden hero-gradient">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        {/* Gradient blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">

          {/* Location pill */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-4 py-2 rounded-full border border-white/15 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Serving Nanjangud &amp; Mysuru — Karnataka's Trusted Platform
            </span>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8 fade-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5">
              Find Verified Properties
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Near You
              </span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
              Buy, Rent &amp; Lease Homes, Plots and Commercial Properties Directly From Trusted Owners
            </p>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 fade-up-1">
            {TRUST.map((t) => (
              <span key={t.label} className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs font-medium px-3.5 py-1.5 rounded-full">
                <span className="text-emerald-400">{t.icon}</span> {t.label}
              </span>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-5xl mx-auto fade-up-2">
            <SearchBar />
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 fade-up-3">
            <span className="text-white/40 text-xs self-center">Popular:</span>
            {['Houses in Nanjangud', 'Shops in Mysuru', 'Plots near Mysuru', '2BHK for Rent'].map((q) => (
              <Link
                key={q}
                to={`/properties?search=${encodeURIComponent(q)}`}
                className="text-xs text-white/60 hover:text-white border border-white/15 hover:border-white/30 px-3 py-1 rounded-full transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, color }) => (
              <div key={label} className="text-center">
                <div className={`text-2xl font-bold ${color} leading-tight`}>{value}</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHead
          label="Explore"
          title="What are you looking for?"
          sub="Choose from a wide range of property options"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={`/properties?category=${cat.value}`}
              className="lph-card-hover p-5 group text-center flex flex-col items-center"
            >
              <div className={`w-14 h-14 ${cat.bg} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <span className={cat.text}>{cat.icon}</span>
              </div>
              <div className="font-bold text-sm text-slate-900 mb-0.5">{cat.label}</div>
              <div className="text-xs text-slate-400">{cat.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SectionHead
          label="Featured"
          title="Premium Properties"
          sub="Handpicked verified listings just for you"
          cta="View All Properties"
          ctaTo="/properties"
        />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FiHome size={32} className="mx-auto mb-3 text-slate-200" />
            <p>No featured properties yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>

      {/* ── POPULAR LOCALITIES ────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead
            label="Localities"
            title="Popular Areas to Explore"
            sub="Discover properties in the most sought-after neighbourhoods"
            cta="Explore All"
            ctaTo="/properties"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {LOCALITIES.map((loc) => (
              <Link
                key={loc.name}
                to={`/properties?search=${encodeURIComponent(loc.name)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] lph-card-hover"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Trending badge */}
                {loc.trending && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <FiTrendingUp size={9} /> Trending
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-sm leading-tight">{loc.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/70 text-[11px]">{loc.count}</span>
                    <span className="text-white/70 text-[11px]">{loc.avgPrice}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="absolute top-3 right-3 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiChevronRight size={14} className="text-white" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHead
          label="Process"
          title="How It Works"
          sub="Find and secure your ideal property in 3 simple steps"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Search & Filter', desc: 'Browse hundreds of verified properties across Nanjangud and Mysuru with smart filters.', icon: '🔍', color: 'bg-blue-50 text-blue-600' },
            { step: '02', title: 'Connect Directly', desc: 'Contact verified property owners directly — no middlemen, no hidden brokerage fees.', icon: '📞', color: 'bg-emerald-50 text-emerald-600' },
            { step: '03', title: 'Close the Deal',  desc: 'Schedule a visit, negotiate, and finalise your property with confidence and trust.', icon: '🏠', color: 'bg-amber-50 text-amber-600' },
          ].map((s) => (
            <div key={s.step} className="lph-card p-7 relative overflow-hidden group hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="absolute -top-4 -right-4 text-8xl font-black text-slate-50 select-none">{s.step}</div>
              <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-2xl mb-5`}>
                {s.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-2xl font-bold text-white mt-2">Trusted by Local Families</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FiStar key={i} size={13} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.role} · {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-10 lg:p-14 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Have a Property to Sell or Rent?
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              List your property for free and reach thousands of verified buyers &amp; renters in Nanjangud and Mysuru.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/properties/add" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                <FiPlus size={16} /> List Property Free
              </Link>
              <Link to="/properties" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors">
                Browse Properties <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

// eslint-disable-next-line
function FiPlus({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
