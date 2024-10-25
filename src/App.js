import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import credentials from './config/credentials';

function App() {
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 4.710989, lng: -74.072090 });
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [locationDetails, setLocationDetails] = useState({}); 
  const [origin, setOrigin] = useState({});  
  const [destination, setDestination] = useState({});  
  const [response, setResponse] = useState({});  


  const handlePickItems = () => {
    alert('Pick Items button clicked');
  };

  const handleCheckout = () => {
    alert('Checkout button clicked');
  };

  const createOrigin = () => {
    setOrigin({
      address: locationDetails.address,
      latitude: locationDetails.latitude,
      longitude: locationDetails.longitude,
      city: locationDetails.city,
      state: locationDetails.state,
      country: locationDetails.country,
      zip_code: locationDetails.zip_code,
    });
  }

  const createDestination = () => {
    setDestination({
      address: locationDetails.address,
      latitude: locationDetails.latitude,
      longitude: locationDetails.longitude,
      city: locationDetails.city,
      state: locationDetails.state,
      country: locationDetails.country,
      zip_code: locationDetails.zip_code,
    });
  }

  const fetchAvailability = async () => {
    console.log("fetching")
    const options = {
      method: 'POST',
      url: 'https://api.xandar.instaleap.io/jobs/availability/v2',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': credentials.apiKey
      },
      data: {
      "currency_code": "COP",
      "start": "2024-10-25T00:00:00.701Z",
      "end": "2024-10-25T23:59:59.701Z",
      "slot_size": 60,
      "minimum_slot_size": 15,
      "operational_models_priority": ["FULL_SERVICE"],
      "fallback": true,
      "store_reference": "101_FS",
      "origin": {
        "name": "origin.name",
        "address": "origin.address",
        "address_two": "origin.address",
        "description": "Test",
        "country": "origin.country",
        "city": "origin.city",
        "state": "origin.state",
        "zip_code": "origin.zip_code",
        "latitude": origin.latitude,
        "longitude": origin.longitude
      },
      "destination": {
        "name": "destination.name",
        "address": "destination.address",
        "address_two": "destination.address",
        "description": "testDest",
        "country": "destination.country",
        "city": "destination.city",
        "state": "destination.state",
        "zip_code": "destination.zip_code",
        "latitude": destination.latitude,
        "longitude": destination.longitude
      },
      "job_items": [
        {
          "id": "string",
          "name": "string",
          "unit": "string",
          "sub_unit": "string",
          "quantity": 1,
          "sub_quantity": 1,
          "quantity_found_limits": {
            "max": 1,
            "min": 1
          },
          "weight": 1,
          "volume": 1,
          "price": 1,
          "comment": "string",
          "attributes": {
            "category": "string",
            "plu": "string",
            "ean": "string",
            "location": "string",
            "picking_index": "string"
          }
        }
      ]
      }
    };
    axios
      .request(options)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        setResponse(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.error(error);
        setResponse(JSON.stringify(error));
      });
  };

  // Map settings
  const mapContainerStyle = {
    width: '800px',
    height: '400px',
    marginTop: '20px',
  };

  const defaultMapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
  };

  // Function to fetch location details (city, country, etc.) using Geocoding API
  const fetchLocationDetails = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=`+credentials.mapskey
      );
      const addressComponents = response.data.results[0].address_components;
      const formattedAddress = response.data.results[0].formatted_address;

      setLocationDetails({
        address: formattedAddress,
        latitude: lat,
        longitude: lng,
        city: addressComponents.find((c) => c.types.includes('locality'))?.long_name || '',
        state: addressComponents.find((c) => c.types.includes('administrative_area_level_1'))?.long_name || '',
        country: addressComponents.find((c) => c.types.includes('country'))?.long_name || '',
        zip_code: addressComponents.find((c) => c.types.includes('postal_code'))?.long_name || '',
      });

    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  // Handle map clicks to select location and update data in real-time
  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedPosition({ lat, lng });
    await fetchLocationDetails(lat, lng); // Fetch city and country for the selected lat/lng
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Instaleap App</h1>
      <button onClick={handlePickItems} style={{ marginRight: '10px' }}>
        Pick Items
      </button>
      <button onClick={handleCheckout}>Checkout</button>

      {/* Display selected location details */}
      {selectedPosition && (
        <div style={{ marginTop: '20px' }}>
          <h2>Selected position:</h2>
          <p>Address: {locationDetails.address}</p>
          <p>Latitude: {locationDetails.latitude}</p>
          <p>Longitude: {locationDetails.longitude}</p>
          <p>City: {locationDetails.city}</p>
          <p>State: {locationDetails.state}</p>
          <p>Country: {locationDetails.country}</p>
          <p>ZIP Code: {locationDetails.zip_code}</p>
        </div>
      )}

      {/* Google Maps */}
      <LoadScript googleMapsApiKey={credentials.mapskey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={12}
          options={defaultMapOptions}
          onClick={handleMapClick} // Handle click events on the map
        >
          {/* Display marker at the selected position */}
          {selectedPosition && <Marker position={selectedPosition} />}
        </GoogleMap>
      </LoadScript>

    
      <div>
        <button onClick={createOrigin} style={{ marginRight: '10px' }}>
          Set origin
        </button>

        <button onClick={createDestination} style={{ marginRight: '10px' }}>
          Set Destination
        </button>
      </div>

      <div>
        {/* Calendar for selecting a delivery date */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 'fit-content' }}>
            <h3>Select a delivery date:</h3>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
            />
          </div>
        </div>
        <div>
          <button onClick={fetchAvailability} style={{ marginRight: '10px' }}>
            Fetch Availability
          </button>
        </div>

        {response && (
        <div style={{ marginTop: '20px' }}>
          {response && (
            <div style={{ marginTop: '20px' }}>
              <h4>Response {JSON.stringify(response)}</h4>
            </div>
          )}
        </div>
        )}
      </div>

    </div>
  );
}

export default App;
