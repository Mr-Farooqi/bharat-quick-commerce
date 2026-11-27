import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

const DEFAULT_LOCATION = {
  title: 'Connaught Place, New Delhi',
  street: 'Block B, Inner Circle',
  city: 'New Delhi',
  coordinates: [77.2090, 28.6139], // [lng, lat]
  pincode: '110001',
  deliveryTime: '10-15 MINS',
  isManual: false,
  isGps: false,
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('bharat_customer_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const presetLocations = [
    {
      title: 'Connaught Place, New Delhi',
      street: 'Block B, Connaught Place',
      city: 'New Delhi',
      coordinates: [77.2090, 28.6139],
      pincode: '110001',
      time: '10-12 MINS',
      note: 'Verified Dark Store (< 1 km)',
    },
    {
      title: 'Barakhamba Road, Central Delhi',
      street: 'Tolstoy Marg',
      city: 'New Delhi',
      coordinates: [77.2250, 28.6290],
      pincode: '110001',
      time: '12-15 MINS',
      note: 'Verified Dark Store (~1.2 km)',
    },
    {
      title: 'Hauz Khas, South Delhi',
      street: 'Aurobindo Marg',
      city: 'New Delhi',
      coordinates: [77.2060, 28.5494],
      pincode: '110016',
      time: '12-15 MINS',
      note: 'South Delhi Hub',
    },
    {
      title: 'Sector 18, Noida',
      street: 'Atta Market, Sector 18',
      city: 'Noida',
      coordinates: [77.3240, 28.5708],
      pincode: '201301',
      time: '14-16 MINS',
      note: 'Outer Zone (> 2km test)',
    },
    {
      title: 'Cyber City, Gurugram',
      street: 'DLF Phase 2',
      city: 'Gurugram',
      coordinates: [77.0878, 28.4950],
      pincode: '122002',
      time: '15-18 MINS',
      note: 'Outer Zone (> 2km test)',
    },
  ];

  // Save location to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bharat_customer_location', JSON.stringify(location));
    } catch (e) {
      console.error('Failed to save location', e);
    }
  }, [location]);

  // Method 1: Automatic GPS Detection with Reverse Geocoding
  const detectCurrentLocation = async () => {
    setDetectingGps(true);
    setGpsError('');

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setDetectingGps(false);
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          let displayTitle = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          let pincode = '';
          let city = 'Delhi';

          // Try reverse geocoding via OpenStreetMap Nominatim
          try {
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            if (resp.ok) {
              const data = await resp.json();
              if (data && data.address) {
                const addr = data.address;
                const road = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
                city = addr.city || addr.town || addr.state_district || 'Delhi';
                pincode = addr.postcode || '';
                displayTitle = [road, city].filter(Boolean).join(', ') || data.display_name.split(',').slice(0, 2).join(',');
              }
            }
          } catch (err) {
            console.warn('Reverse geocode failed, using coordinates title:', err);
          }

          const newLoc = {
            title: displayTitle || 'My Current Location',
            street: 'Current GPS Location',
            city,
            coordinates: [lng, lat],
            pincode: pincode || '110001',
            deliveryTime: '10-15 MINS',
            isManual: false,
            isGps: true,
          };

          setLocation(newLoc);
          setDetectingGps(false);
          setShowLocationModal(false);
          resolve(newLoc);
        },
        (error) => {
          let msg = 'Unable to retrieve your location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission denied. Please enable GPS or enter location manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location position is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out.';
          }
          setGpsError(msg);
          setDetectingGps(false);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  // Method 2: Manual Address Entry
  const setManualLocation = async ({ street, area, city, pincode }) => {
    let title = [street, area, city].filter(Boolean).join(', ');
    let coords = DEFAULT_LOCATION.coordinates;

    // Try forward geocoding query to get real coordinates
    try {
      const query = [area || street, city, pincode, 'India'].filter(Boolean).join(', ');
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.length > 0) {
          coords = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        }
      }
    } catch (e) {
      console.warn('Forward geocoding error:', e);
    }

    const newLoc = {
      title: title || `${area || city || 'Manual Address'} (${pincode})`,
      street: street || area,
      city: city || 'Delhi',
      coordinates: coords,
      pincode: pincode || '110001',
      deliveryTime: '10-15 MINS',
      isManual: true,
      isGps: false,
    };

    setLocation(newLoc);
    setShowLocationModal(false);
    return newLoc;
  };

  const updateLocation = (loc) => {
    setLocation({
      title: loc.title,
      street: loc.street || loc.title,
      city: loc.city || 'Delhi',
      coordinates: loc.coordinates,
      pincode: loc.pincode,
      deliveryTime: loc.time || '10-15 MINS',
      isManual: false,
      isGps: false,
    });
    setShowLocationModal(false);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        showLocationModal,
        setShowLocationModal,
        presetLocations,
        updateLocation,
        detectCurrentLocation,
        setManualLocation,
        detectingGps,
        gpsError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
