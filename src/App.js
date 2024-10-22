import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

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
    try {
      const response = {
        method: 'POST',
        url: 'https://api.xandar.instaleap.io/jobs/availability/v2',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-api-key': 'yoJYongi4V4m0S4LClubdyiu5nq6VIpxazcFaghi'
        },
        data: {
          currency_code: 'COP',
          start: '2024-10-21T00:00:00.701Z',
          end: '2024-10-22T23:59:59.701Z',
          slot_size: 60,
          minimum_slot_size: 0,
          operational_models_priority: ['FULL_SERVICE'],
          fallback: true,
          store_reference: '101_FS',
          origin: {
            name: 'string',
            address: 'string',
            address_two: 'string',
            description: 'string',
            country: 'string',
            city: 'string',
            state: 'string',
            zip_code: 'string',
            latitude: origin.latitude,
            longitude: origin.longitude
          },
          destination: {
            name: 'string',
            address: 'string',
            address_two: 'string',
            description: 'string',
            country: 'string',
            city: 'string',
            state: 'string',
            zip_code: 'string',
            latitude: destination.latitude,
            longitude: destination.longitude
          },
          job_items: [
            {
              id: 'string',
              name: 'string',
              photo_url: 'string',
              unit: 'string',
              sub_unit: 'string',
              quantity: 0,
              sub_quantity: 0,
              quantity_found_limits: {max: 0, min: 0},
              weight: 0,
              volume: 0,
              price: 0,
              comment: 'string',
              attributes: {
                category: 'string',
                plu: 'string',
                ean: 'string',
                location: 'string',
                picking_index: 'string'
              }
            }
          ]
        }
      };      
  
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching availability:', error.message);
    }
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
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCgmf6MnqMcNX3y6mlKE3EEb8tdgwFM7KY`
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
      <LoadScript googleMapsApiKey="AIzaSyCgmf6MnqMcNX3y6mlKE3EEb8tdgwFM7KY">
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
            /*tileDisabled={({ date }) =>
              !availability.some(
                (item) => new Date(item.date).toDateString() === date.toDateString()
              )
            }*/
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
                  }}
                >
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
      </div>

    </div>
  );
}

export default App;
