import ChatSettings from "../components/communications/chat/ChatSettingsPanel";
import GeolocationService from "../services/GeolocationService";



let geolocationService: GeolocationService | undefined;
let settingsPanel: ChatSettings | undefined;

// Function to initialize geolocation service
export const initializeGeolocationService = () => {
  // Use the getCurrentLocation method of the GeolocationService instance
  geolocationService = new GeolocationService(); // Instantiate geolocationService
  geolocationService.getCurrentLocation()
    .then((position) => {
      console.log('Geolocation service initialized');
      console.log('Latitude:', position.latitude);
      console.log('Longitude:', position.longitude);
      // You can further handle the geolocation data here
    })
    .catch((error) => {
      console.error('Error initializing geolocation service:', error.message);
      // Handle geolocation initialization error
    });
};
