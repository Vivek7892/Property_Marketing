import { useState } from 'react';
import { FiPhone, FiX, FiMessageCircle } from 'react-icons/fi';

const PHONE = '+917892409872';
const WHATSAPP_MSG = encodeURIComponent('Hi! I found your listing on Local Property Hub and would like to know more.');

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="float-widget">
      {/* Expanded panel */}
      {open && (
        <div className="lph-card p-4 w-64 fade-up shadow-[0_8px_32px_rgba(15,23,42,0.15)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[#0F172A]">Contact Us</p>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <FiX size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-3">Available Mon–Sat, 9am–7pm</p>
          <a
            href={`tel:${PHONE}`}
            className="btn-primary w-full justify-center py-2.5 text-sm mb-2"
          >
            <FiPhone size={14} /> Call Now
          </a>
          <a
            href={`https://wa.me/${PHONE.replace('+', '')}?text=${WHATSAPP_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-success w-full justify-center py-2.5 text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.843L.057 23.272a.75.75 0 00.916.916l5.43-1.472A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.67-.502-5.198-1.38l-.374-.214-3.868 1.048 1.048-3.868-.214-.374A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(15,23,42,0.20)] transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
          open
            ? 'bg-slate-700 text-white'
            : 'bg-[#D4AF37] text-[#111827]'
        }`}
        title="Contact us"
      >
        {open
          ? <FiX size={22} />
          : <FiMessageCircle size={22} />
        }
      </button>
    </div>
  );
}
