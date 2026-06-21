import { useRef, useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { FiMapPin } from 'react-icons/fi';

const LIBRARIES = ['places'];
const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: 'cooperative',
};

/**
 * LocationPicker
 * Props:
 *   address, locality, city, state, pincode  — current form values
 *   latitude, longitude
 *   onChange(fields)  — called with { address?, locality?, city?, state?, pincode?, latitude, longitude }
 */
export default function LocationPicker({ address, locality, city, state, pincode, latitude, longitude, onChange }) {
  const autocompleteRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(
    latitude && longitude
      ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
      : { lat: 12.9716, lng: 77.5946 } // Bangalore default
  );

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
    libraries: LIBRARIES,
  });

  const extractComponent = (components, type) =>
    components.find((c) => c.types.includes(type))?.long_name || '';

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const components = place.address_components || [];

    const newLocality =
      extractComponent(components, 'sublocality_level_1') ||
      extractComponent(components, 'sublocality') ||
      extractComponent(components, 'neighborhood') ||
      locality;

    const newCity =
      extractComponent(components, 'locality') ||
      extractComponent(components, 'administrative_area_level_2') ||
      city;

    const newState =
      extractComponent(components, 'administrative_area_level_1') || state;

    const newPincode =
      extractComponent(components, 'postal_code') || pincode;

    setMapCenter({ lat, lng });
    onChange({
      address: place.formatted_address || address,
      locality: newLocality,
      city: newCity,
      state: newState,
      pincode: newPincode,
      latitude: lat,
      longitude: lng,
    });
  }, [address, locality, city, state, pincode, onChange]);

  const onMarkerDragEnd = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMapCenter({ lat, lng });
    onChange({ latitude: lat, longitude: lng });
  }, [onChange]);

  if (loadError) return <p className="text-xs text-red-400">Map failed to load</p>;
  if (!isLoaded) return <div className="h-48 bg-gray-50 rounded-2xl animate-pulse" />;

  const markerPos = latitude && longitude
    ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
    : null;

  return (
    <div className="space-y-3">
      {/* Address autocomplete */}
      <Autocomplete
        onLoad={(ref) => { autocompleteRef.current = ref; }}
        onPlaceChanged={onPlaceChanged}
        options={{ componentRestrictions: { country: 'in' } }}
      >
        <input
          className="lph-input"
          placeholder="Search address on Google Maps..."
          defaultValue={address}
          onChange={(e) => onChange({ address: e.target.value })}
        />
      </Autocomplete>

      {/* Auto-filled fields */}
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Locality', 'locality', locality],
          ['City', 'city', city],
          ['State', 'state', state],
          ['Pincode', 'pincode', pincode],
        ].map(([label, key, val]) => (
          <div key={key}>
            <label className="lph-label">{label}</label>
            <input
              className="lph-input"
              value={val || ''}
              onChange={(e) => onChange({ [key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      {/* Map preview with draggable pin */}
      <div className="rounded-2xl overflow-hidden border border-gray-100" style={{ height: 220 }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={markerPos || mapCenter}
          zoom={markerPos ? 15 : 12}
          options={MAP_OPTIONS}
        >
          {markerPos && (
            <Marker
              position={markerPos}
              draggable
              onDragEnd={onMarkerDragEnd}
              title="Drag to adjust location"
            />
          )}
        </GoogleMap>
      </div>

      {markerPos && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <FiMapPin size={11} />
          {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)} — drag the pin to adjust
        </p>
      )}
    </div>
  );
}
