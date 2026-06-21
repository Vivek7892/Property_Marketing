import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FiHeart, FiMaximize, FiMapPin, FiCheckCircle, FiShare2, FiPhone, FiUsers, FiMinusCircle } from 'react-icons/fi';
import { propertyAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { optimizeCloudinaryUrl } from '../../utils/cloudinary';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&q=70';

const CATEGORY_LABEL = { sale: 'For Sale', rent: 'For Rent', lease: 'For Lease' };
const CATEGORY_COLOR = {
  sale:  'bg-[#0F172A] text-white',
  rent:  'bg-emerald-500 text-white',
  lease: 'bg-[#D4AF37] text-[#111827]',
};

function formatPrice(price) {
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function emiEstimate(price) {
  const p = Number(price);
  if (p < 500000) return null;
  const r = 8.5 / 12 / 100;
  const n = 240;
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  if (emi >= 100000) return `₹${(emi / 100000).toFixed(1)}L/mo`;
  return `₹${Math.round(emi / 1000)}K/mo`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30)  return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export default function PropertyCard({ property, onFavoriteToggle }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(property.is_favorited);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error('Please login to save properties'); return; }
    setFavLoading(true);
    try {
      const { data } = await propertyAPI.toggleFavorite(property.id);
      setFavorited(data.status === 'added');
      toast.success(data.status === 'added' ? 'Saved!' : 'Removed');
      onFavoriteToggle?.();
    } catch { toast.error('Something went wrong'); }
    finally { setFavLoading(false); }
  };

  const handleShare = (e) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/properties/${property.id}`;
    if (navigator.share) { navigator.share({ title: property.title, url }); }
    else { navigator.clipboard?.writeText(url); toast.success('Link copied!'); }
  };

  const emi    = property.category === 'sale' ? emiEstimate(property.price) : null;
  const imgSrc = optimizeCloudinaryUrl(property.primary_image || PLACEHOLDER, { width: 600, height: 400 });

  return (
    <div className="property-card group flex flex-col">

      {/* ── Image ── */}
      <Link to={`/properties/${property.id}`} className="block relative flex-shrink-0">
        <div className="overflow-hidden" style={{ borderRadius: '16px 16px 0 0', height: '200px' }}>
          <img
            src={imgSrc}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`lph-badge text-[11px] ${CATEGORY_COLOR[property.category] || 'bg-slate-700 text-white'}`}>
            {CATEGORY_LABEL[property.category] || property.category}
          </span>
          {property.is_featured && (
            <span className="lph-badge badge-gold text-[11px]">★ Featured</span>
          )}
        </div>

        {/* Action buttons — bigger touch targets on mobile */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          <button
            onClick={handleShare}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-500 hover:text-[#0F172A] hover:bg-white transition-all shadow-sm active:scale-90"
          >
            <FiShare2 size={14} />
          </button>
          <button
            onClick={handleFavorite}
            disabled={favLoading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 ${
              favorited ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-slate-500 hover:text-red-500 hover:bg-white'
            }`}
          >
            <FiHeart size={14} className={favorited ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Posted time */}
        <span className="absolute bottom-2.5 left-2.5 text-[10px] text-white/80 font-medium bg-black/35 backdrop-blur-sm px-2 py-0.5 rounded-md">
          {timeAgo(property.created_at)}
        </span>
      </Link>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-slate-400 mb-1.5 font-medium truncate">
          <FiMapPin size={11} className="flex-shrink-0 text-[#D4AF37]" />
          <span className="truncate">{property.locality}, {property.city}</span>
        </p>

        {/* Title */}
        <Link
          to={`/properties/${property.id}`}
          className="block text-sm font-bold text-[#111827] hover:text-[#D4AF37] transition-colors line-clamp-2 mb-2.5 leading-snug"
        >
          {property.title}
        </Link>

        {/* Specs */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <FiUsers size={11} className="text-slate-400" /> {property.bedrooms} Bed
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <FiMinusCircle size={11} className="text-slate-400" /> {property.bathrooms} Bath
            </span>
          )}
          {property.area_sqft && (
            <span className="flex items-center gap-1 whitespace-nowrap">
              <FiMaximize size={11} className="text-slate-400" />
              {Number(property.area_sqft).toLocaleString()} sqft
            </span>
          )}
        </div>

        {/* Spacer pushes price to bottom */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="flex items-end justify-between pt-3 border-t border-slate-50">
          <div>
            <div className="text-base font-bold text-[#0F172A] leading-tight">
              {formatPrice(property.price)}
            </div>
            {emi && (
              <div className="text-[10px] text-slate-400 mt-0.5">
                EMI ~<span className="font-semibold text-[#0F172A]">{emi}</span>
              </div>
            )}
            {property.is_negotiable && (
              <span className="text-[10px] text-emerald-600 font-semibold">Negotiable</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {property.is_verified && (
              <span className="trust-badge text-[10px] py-0.5">
                <FiCheckCircle size={9} /> Verified
              </span>
            )}
            <span className="tag-chip capitalize text-[10px] py-0.5">{property.property_type}</span>
          </div>
        </div>

        {/* Owner + contact */}
        {property.owner_name && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 bg-[#0F172A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#0F172A] text-[10px] font-bold">{property.owner_name[0]}</span>
              </div>
              <span className="text-xs text-slate-500 truncate">{property.owner_name}</span>
            </div>
            <Link
              to={`/properties/${property.id}`}
              className="flex items-center gap-1 text-xs font-bold text-[#0F172A] hover:text-[#D4AF37] transition-colors flex-shrink-0 ml-2"
            >
              <FiPhone size={11} /> Contact
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
