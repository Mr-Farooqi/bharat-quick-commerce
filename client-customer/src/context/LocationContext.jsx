import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({
    title: 'Connaught Place, New Delhi',
    coordinates: [77.2090, 28.6139],
    pincode: '110001',
    deliveryTime: '12-15 MINS',
  });
  const [showLocationModal, setShowLocationModal] = useState(false);

  const presetLocations = [
    { title: 'Connaught Place, New Delhi', coordinates: [77.2090, 28.6139], pincode: '110001', time: '10-12 MINS' },
    { title: 'Hauz Khas, South Delhi', coordinates: [77.2060, 28.5494], pincode: '110016', time: '12-15 MINS' },
    { title: 'Sector 18, Noida', coordinates: [77.3240, 28.5708], pincode: '201301', time: '14-16 MINS' },
    { title: 'Cyber City, Gurugram', coordinates: [77.0878, 28.4950], pincode: '122002', time: '15-18 MINS' },
  ];

  const updateLocation = (loc) => {
    setLocation({
      title: loc.title,
      coordinates: loc.coordinates,
      pincode: loc.pincode,
      deliveryTime: loc.time || '10-15 MINS',
    });
    setShowLocationModal(false);
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, showLocationModal, setShowLocationModal, presetLocations, updateLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
