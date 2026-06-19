import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

const LIBRARIES = ['places'];

export default function MapComponent({ lat, lng, title, zoom = 15 }) {
  const [showInfo, setShowInfo] = useState(false);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
    libraries: LIBRARIES,
  });

  if (!isLoaded) return <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: 350 }}>Loading map...</div>;
  if (!lat || !lng) return <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ height: 350 }}>No location set</div>;

  const center = { lat: parseFloat(lat), lng: parseFloat(lng) };

  return (
    <GoogleMap mapContainerStyle={{ width: '100%', height: 350, borderRadius: 8 }} center={center} zoom={zoom}>
      <Marker position={center} onClick={() => setShowInfo(true)}>
        {showInfo && (
          <InfoWindow onCloseClick={() => setShowInfo(false)}>
            <span className="fw-medium">{title}</span>
          </InfoWindow>
        )}
      </Marker>
    </GoogleMap>
  );
}
