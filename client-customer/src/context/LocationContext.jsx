import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

const DEFAULT_LOCATION = {
  title: 'Block B, Connaught Place, New Delhi',
  gali: 'Block B, Inner Circle',
  area: 'Connaught Place',
  gaon: '',
  city: 'New Delhi',
  district: 'New Delhi',
  state: 'Delhi',
  pincode: '110001',
  landmark: 'Near Central Park',
  fullAddress: 'Block B, Inner Circle, Connaught Place, New Delhi, Delhi - 110001',
  coordinates: [77.2090, 28.6139], // [lng, lat]
  deliveryTime: '10-12 MINS',
  isManual: false,
  isGps: false,
};

// Multi-provider reverse geocoding engine for exact gali, area, gaon, city, pincode
export async function fetchExactLocation(lat, lng) {
  let gali = '';
  let area = '';
  let gaon = '';
  let city = '';
  let district = '';
  let state = '';
  let pincode = '';
  let fullAddress = '';

  // 1. Google Maps Geocoding API (if key configured)
  const googleKey =
    (typeof window !== 'undefined' && window.GOOGLE_MAPS_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('bharat_google_maps_key'));

  if (googleKey) {
    try {
      const gRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleKey}`
      );
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.results && gData.results.length > 0) {
          const res = gData.results[0];
          fullAddress = res.formatted_address;

          res.address_components.forEach((c) => {
            if (c.types.includes('route')) {
              gali = gali ? `${c.long_name}, ${gali}` : c.long_name;
            }
            if (c.types.includes('street_number')) {
              gali = gali ? `${c.long_name} ${gali}` : `House ${c.long_name}`;
            }
            if (c.types.includes('sublocality_level_2') || c.types.includes('sublocality_level_3')) {
              gali = gali ? `${gali}, ${c.long_name}` : c.long_name;
            }
            if (c.types.includes('sublocality_level_1') || c.types.includes('neighborhood')) {
              area = c.long_name;
            }
            if (c.types.includes('locality')) {
              city = c.long_name;
            }
            if (c.types.includes('administrative_area_level_2')) {
              district = c.long_name;
            }
            if (c.types.includes('administrative_area_level_1')) {
              state = c.long_name;
            }
            if (c.types.includes('postal_code')) {
              pincode = c.long_name;
            }
          });
        }
      }
    } catch (e) {
      console.warn('Google Maps reverse geocode error:', e);
    }
  }

  // 2. OpenStreetMap High-Precision Nominatim with zoom=18 & addressdetails=1
  if (!gali || !area || !city) {
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (nomRes.ok) {
        const data = await nomRes.json();
        if (data && data.address) {
          const a = data.address;

          // Exact Gali / Road / Street
          const streetParts = [
            a.house_number ? `House/Plot ${a.house_number}` : '',
            a.road || a.pedestrian || a.path || a.footway || a.lane || a.street || '',
          ].filter(Boolean);
          if (!gali) gali = streetParts.join(', ');

          // Area / Mohalla / Colony
          if (!area) {
            area = a.neighbourhood || a.suburb || a.residential || a.commercial || a.quarter || a.subdistrict || '';
          }

          // Gaon / Village / Town
          if (!gaon) {
            gaon = a.village || a.hamlet || a.isolated_dwelling || '';
          }

          // City / District
          if (!city) {
            city = a.city || a.town || a.city_district || '';
          }
          if (!district) {
            district = a.state_district || a.county || city;
          }

          // State & Pincode
          if (!state) state = a.state || '';
          if (!pincode) pincode = a.postcode || '';

          if (!fullAddress) fullAddress = data.display_name;
        }
      }
    } catch (err) {
      console.warn('Nominatim reverse geocode error:', err);
    }
  }

  // 3. BigDataCloud Fallback for administrative locality
  if (!city || !state || !area) {
    try {
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (bdcRes.ok) {
        const bdc = await bdcRes.json();
        if (!city) city = bdc.city || bdc.locality || '';
        if (!state) state = bdc.principalSubdivision || '';
        if (!pincode) pincode = bdc.postcode || '';
        if (!area) area = bdc.locality || '';
      }
    } catch (e) {
      console.warn('BigDataCloud geocode error:', e);
    }
  }

  // Normalize final strings
  const finalGali = gali || 'Main Street / Road';
  const finalArea = area || gaon || city || 'Neighborhood Area';
  const finalGaon = gaon || '';
  const finalCity = city || district || 'New Delhi';
  const finalDistrict = district || finalCity;
  const finalState = state || 'Delhi';
  const finalPincode = pincode || '110001';

  // Build clean display title & formatted address
  const titleParts = [finalGali, finalArea, finalCity].filter(Boolean);
  const displayTitle = titleParts.slice(0, 2).join(', ') || `${finalArea}, ${finalCity}`;

  const cleanFullAddress =
    fullAddress ||
    [
      finalGali,
      finalArea,
      finalGaon ? `Gaon: ${finalGaon}` : '',
      finalCity,
      `${finalState} - ${finalPincode}`,
    ]
      .filter(Boolean)
      .join(', ');

  return {
    gali: finalGali,
    area: finalArea,
    gaon: finalGaon,
    city: finalCity,
    district: finalDistrict,
    state: finalState,
    pincode: finalPincode,
    title: displayTitle,
    fullAddress: cleanFullAddress,
  };
}

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
      title: 'Block B, Connaught Place',
      gali: 'Block B, Inner Circle',
      area: 'Connaught Place',
      gaon: '',
      city: 'New Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      landmark: 'Near Central Park',
      fullAddress: 'Block B, Inner Circle, Connaught Place, New Delhi - 110001',
      coordinates: [77.2090, 28.6139],
      time: '10-12 MINS',
      note: 'Verified Dark Store (< 1 km)',
    },
    {
      title: 'Tolstoy Marg, Barakhamba',
      gali: 'Tolstoy Marg, Gali 2',
      area: 'Barakhamba Road',
      gaon: '',
      city: 'Central Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      landmark: 'Near Metro Station',
      fullAddress: 'Tolstoy Marg, Gali 2, Barakhamba Road, Central Delhi - 110001',
      coordinates: [77.2250, 28.6290],
      time: '12-15 MINS',
      note: 'Verified Dark Store (~1.2 km)',
    },
    {
      title: 'Hauz Khas Village',
      gali: 'Main Deer Park Road',
      area: 'Hauz Khas',
      gaon: 'Hauz Khas Gaon',
      city: 'South Delhi',
      district: 'South Delhi',
      state: 'Delhi',
      pincode: '110016',
      landmark: 'Near Hauz Khas Fort',
      fullAddress: 'Main Deer Park Road, Hauz Khas Gaon, South Delhi - 110016',
      coordinates: [77.2060, 28.5494],
      time: '12-15 MINS',
      note: 'South Delhi Hub',
    },
    {
      title: 'Atta Market, Sector 18',
      gali: 'Gali 4, Commercial Belt',
      area: 'Sector 18',
      gaon: 'Atta Gaon',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
      pincode: '201301',
      landmark: 'Near Wave Mall',
      fullAddress: 'Gali 4, Commercial Belt, Atta Gaon, Sector 18, Noida - 201301',
      coordinates: [77.3240, 28.5708],
      time: '14-16 MINS',
      note: 'Outer Zone (> 2km test)',
    },
    {
      title: 'DLF Phase 2, Cyber City',
      gali: 'Lane 12, Sikanderpur Road',
      area: 'Cyber City',
      gaon: 'Sikanderpur Gaon',
      city: 'Gurugram',
      district: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      landmark: 'Near Rapid Metro',
      fullAddress: 'Lane 12, Sikanderpur Road, Cyber City, Gurugram - 122002',
      coordinates: [77.0878, 28.4950],
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

  // Method 1: Automatic GPS Detection with Granular Breakdown
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

          try {
            const exactDetails = await fetchExactLocation(lat, lng);

            const newLoc = {
              title: exactDetails.title,
              gali: exactDetails.gali,
              area: exactDetails.area,
              gaon: exactDetails.gaon,
              city: exactDetails.city,
              district: exactDetails.district,
              state: exactDetails.state,
              pincode: exactDetails.pincode,
              landmark: '',
              fullAddress: exactDetails.fullAddress,
              coordinates: [lng, lat],
              deliveryTime: '10-15 MINS',
              isManual: false,
              isGps: true,
            };

            setLocation(newLoc);
            setDetectingGps(false);
            resolve(newLoc);
          } catch (err) {
            console.error('Failed to resolve exact location:', err);
            setGpsError('Failed to fetch street details. Please verify manually.');
            setDetectingGps(false);
            resolve(false);
          }
        },
        (error) => {
          let msg = 'Unable to retrieve your location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission denied. Please enable GPS in your device/browser or enter address manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'GPS signal is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'GPS request timed out. Please try again.';
          }
          setGpsError(msg);
          setDetectingGps(false);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    });
  };

  // Method 2: Manual Address Entry with Exact Fields & Forward Geocoding
  const setManualLocation = async ({ gali, area, gaon, city, pincode, landmark }) => {
    let coords = DEFAULT_LOCATION.coordinates;

    // Search query prioritizing area, gaon, city, pincode
    try {
      const query = [area || gaon || gali, city, pincode, 'India'].filter(Boolean).join(', ');
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

    const cleanGali = gali || 'Main Road';
    const cleanArea = area || gaon || city || 'Locality';
    const cleanCity = city || 'New Delhi';
    const cleanPincode = pincode || '110001';

    const fullAddr = [
      cleanGali,
      landmark ? `Landmark: ${landmark}` : '',
      cleanArea,
      gaon ? `Gaon: ${gaon}` : '',
      cleanCity,
      `Pincode: ${cleanPincode}`,
    ]
      .filter(Boolean)
      .join(', ');

    const newLoc = {
      title: `${cleanGali}, ${cleanArea}`,
      gali: cleanGali,
      area: cleanArea,
      gaon: gaon || '',
      city: cleanCity,
      district: cleanCity,
      state: 'Delhi',
      pincode: cleanPincode,
      landmark: landmark || '',
      fullAddress: fullAddr,
      coordinates: coords,
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
      gali: loc.gali || loc.street || loc.title,
      area: loc.area || loc.title,
      gaon: loc.gaon || '',
      city: loc.city || 'New Delhi',
      district: loc.district || loc.city,
      state: loc.state || 'Delhi',
      pincode: loc.pincode || '110001',
      landmark: loc.landmark || '',
      fullAddress: loc.fullAddress || `${loc.title}, ${loc.city} - ${loc.pincode}`,
      coordinates: loc.coordinates,
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
