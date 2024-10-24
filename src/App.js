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
  const [mapCenter, setMapCenter] = useState({ lat: 4.710989, lng: -74.072090 }); // Default location (Bogotá)
  const [selectedPosition, setSelectedPosition] = useState(null); // To store selected lat/lng
  const [locationDetails, setLocationDetails] = useState({}); // To store city and other details
  const [origin, setOrigin] = useState({}); // To store city and other details
  const [destination, setDestination] = useState({}); // To store city and other details
  const [response, setResponse] = useState({}); // To store city and other details


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

  const mockResponse = () => {
    setResponse({
      id: "Mock",
      from: "2024-10-22T16:00:00.701Z",
      to: "2024-10-22T17:00:00.701Z",
      store: {
        id: "101",
        name: "FS"
      },
      description: "Mock",
      operational_model: "FULL_SERVICE",
      expires_at: "2024-10-22T24:00:00.701Z"
    });
  }

  const fetchAvailability = async () => {
    const options = {
      method: 'POST',
      url: 'https://api.xandar.instaleap.io/jobs/availability/v2',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': credentials.apiKey
      },
      body: {
      "currency_code": "COP",
      "start": "2024-10-22T00:00:00.701Z",
      "end": "2024-10-26T23:59:59.701Z",
      "slot_size": 60,
      "minimum_slot_size": 15,
      "operational_models_priority": ["FULL_SERVICE"],
      "fallback": true,
      "store_reference": "101_FS",
      "origin": {
        "name": "string",
        "address": "string",
        "address_two": "string",
        "description": "string",
        "country": "string",
        "city": "string",
        "state": "string",
        "zip_code": "string",
        "latitude": 4.687640380464154,
        "longitude": -74.07428741455078
      },
      "destination": {
        "name": "string",
        "address": "string",
        "address_two": "string",
        "description": "string",
        "country": "string",
        "city": "string",
        "state": "string",
        "zip_code": "string",
        "latitude": 4.687640380464154,
        "longitude": -74.07428741455078
      },
      "job_items": [
        {
          "id": "string",
          "name": "string",
          "unit": "string",
          "sub_unit": "string",
          "quantity": 0,
          "sub_quantity": 0,
          "quantity_found_limits": {
            "max": 5,
            "min": 2
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
      })
      .catch(function (error) {
        console.error(error);
      });
  };
  

  const fetchAvailableTimes = (selectedDate) => {
    const selectedDayAvailability = availability.find((item) =>
      new Date(item.date).toDateString() === new Date(selectedDate).toDateString()
    );

    if (selectedDayAvailability) {
      setTimeSlots(selectedDayAvailability.times || []);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
    }
  }, [selectedDate]);

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

      {/* Display time slots once a date is selected */}
      {selectedDate && (
        <div style={{ marginTop: '20px' }}>
          <h3>Select a time for {new Date(selectedDate).toLocaleDateString()}:</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {timeSlots.length > 0 ? (
              timeSlots.map((time, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTime(time)}
                  style={{
                    margin: '5px',
                    padding: '10px',
                    backgroundColor: selectedTime === time ? 'lightblue' : 'white',
                    border: '1px solid gray',
                    borderRadius: '5px',
                  }}>
                  {time}
                </button>
              ))
            ) : (
              <p>No available times for this date</p>
            )}
          </div>

          {selectedTime && (
            <div style={{ marginTop: '20px' }}>
              <h4>You selected {selectedTime}</h4>
            </div>
          )}
        </div>
        )}
        <button onClick={fetchAvailability} style={{ marginRight: '10px' }}>
          fetch times
        </button>

        {response && (
        <div style={{ marginTop: '20px' }}>
          {response && (
            <div style={{ marginTop: '20px' }}>
              <h4>mocked response {JSON.stringify(response)}</h4>
            </div>
          )}
        </div>
        )}
      </div>

    </div>
  );
}

export default App;
