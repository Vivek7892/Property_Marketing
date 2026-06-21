import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { useState, useCallback, useRef } from 'react';
import { FiMapPin, FiMaximize2 } from 'react-icons/fi';

const LIBRARIES = ['places'];

// Minimal Apple-inspired map style
const MAP_STYLES = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e8edf2' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#f3f4f6' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e5e7eb' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e8f5e9' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f3f4f6' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#e5e7eb' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
];

const MAP_OPTIONS = {
  styles: MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: 'cooperative',
};

export default function MapComponent({ lat, lng, title, zoom = 15, height = 360 }) {
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
    libraries: LIBRARIES,
  });

  const onLoad = useCallback((map) => { mapRef.current = map; }, []);

  const mapHeight = isFullscreen ? '100vh' : `${height}px`;

  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100" style={{ height }}>
        <div className="text-center">
          <FiMapPin size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Map unavailable</p>
        </div>
      </div>
    );
  }

  if (!lat || !lng) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100" style={{ height }}>
        <div className="text-center">
          <FiMapPin size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Location not available</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 animate-pulse" style={{ height }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  const center = { lat: parseFloat(lat), lng: parseFloat(lng) };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      style={{ height: mapHeight }}
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        <Marker
          position={center}
          onClick={() => setShowInfo(true)}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#111827',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.6,
            anchor: typeof window !== 'undefined' && window.google
              ? new window.google.maps.Point(12, 22)
              : undefined,
          }}
        >
          {showInfo && (
            <InfoWindow
              position={center}
              onCloseClick={() => setShowInfo(false)}
              options={{ pixelOffset: typeof window !== 'undefined' && window.google ? new window.google.maps.Size(0, -40) : undefined }}
            >
              <div className="px-1 py-0.5 max-w-[200px]">
                <p className="text-xs font-semibold text-gray-900 leading-snug">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">View on map</p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      </GoogleMap>

      {/* Fullscreen toggle */}
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-3 right-3 w-8 h-8 bg-white rounded-xl shadow-card flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors border border-gray-100"
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        <FiMaximize2 size={14} />
      </button>

      {/* Address pill */}
      {title && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl px-3 py-1.5 shadow-card flex items-center gap-1.5 pointer-events-none">
          <FiMapPin size={11} className="text-blue-600 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">{title}</span>
        </div>
      )}
    </div>
  );
}
