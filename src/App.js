import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import credentials from './config/credentials';

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 4.710989, lng: -74.072090 });
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [locationDetails, setLocationDetails] = useState({});
  const [destination, setDestination] = useState({});  
  const [response, setResponse] = useState({});
  const [selectedItem, setSelectedItem] = useState({});
  const [facturacion, setFacturacion] = useState('');

  const handlePickItems = () => {
    alert('Pick Items button clicked');
  };

  const handleCheckout = () => {
    alert('Checkout button clicked');
  };

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
  };

  function formatInitSelectedDate(date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    return startDate.toISOString();
  }

  function formatEndSelectedDate(date) {
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    return endDate.toISOString();
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
      data: {
        "currency_code": "COP",
        "start": formatInitSelectedDate(selectedDate),
        "end": formatEndSelectedDate(selectedDate),
        "slot_size": 60,
        "minimum_slot_size": 15,
        "operational_models_priority": ["FULL_SERVICE"],
        "fallback": true,
        "store_reference": "101_FS",
        "destination": {
          "name": "Destino",
          "address": destination.address,
          "description": "testDest",
          "country": destination.country,
          "city": destination.city,
          "state": destination.state,
          "zip_code": destination.zip_code,
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
        console.log(response.data);
        setResponse(response.data);
      })
      .catch(function (error) {
        console.error(error);
        setResponse(error);
      });
  };

  const mapContainerStyle = {
    width: '30%', // Set width to 100% for responsiveness
    height: '300px', // Set a fixed height for the map
    marginTop: '20px',
  };

  const defaultMapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
  };

  const fetchLocationDetails = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=` + credentials.mapskey
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

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedPosition({ lat, lng });
    await fetchLocationDetails(lat, lng);
  };

  function handleDateChange(date) {
    setSelectedDate(date);
    fetchAvailability(date);
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
  };

  const handleInputChange = (e) => {
    setFacturacion(e.target.value);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Instaleap App</h1>
      <button onClick={handlePickItems} style={{ marginRight: '10px' }}>
        Pick Items
      </button>
      <button onClick={handleCheckout}>Checkout</button>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <LoadScript googleMapsApiKey={credentials.mapskey}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={12}
            options={defaultMapOptions}
            onClick={handleMapClick}
          >
            {selectedPosition && <Marker position={selectedPosition} />}
          </GoogleMap>
        </LoadScript>
      </div>

      <div>
        <button onClick={createDestination} style={{ marginRight: '10px' }}>
          Set Destination
        </button>
      </div>

      <div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 'fit-content' }}>
            <h3>Select a delivery date:</h3>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
            />
          </div>
        </div>
      </div>

      {Array.isArray(response) && response.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Availability:</h4>
          <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '8px' }}>From</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>To</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Store Name</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Description</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Expires At</th>
              </tr>
            </thead>
            <tbody>
              {response.map((item, index) => (
                <tr key={index} onClick={() => handleItemClick(item)} style={{ cursor: 'pointer', border: '1px solid black' }}>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{new Date(item.from).toLocaleString()}</td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{new Date(item.to).toLocaleString()}</td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{item.store.name}</td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{item.description}</td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{new Date(item.expires_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>)}

        {/* Display selected item details at the bottom */}
        {selectedItem && (
          <div style={{ marginTop: '20px', borderTop: '1px solid black', paddingTop: '10px' }}>
            <h4>Selected Item Details:</h4>
            <p><strong>From:</strong> {new Date(selectedItem.from).toLocaleString()}</p>
            <p><strong>To:</strong> {new Date(selectedItem.to).toLocaleString()}</p>
            <p><strong>Expires At:</strong> {new Date(selectedItem.expires_at).toLocaleString()}</p>
          </div>
        )}

    <div>
      <input
        type="text"
        placeholder="Facturación"
        value={facturacion}
        onChange={handleInputChange}
      />
      <button disabled={!facturacion}>Submit</button>
    </div>
    </div>
  );
}

export default App;
