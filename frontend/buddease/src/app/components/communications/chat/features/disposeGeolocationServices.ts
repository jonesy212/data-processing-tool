import GeolocationService from "@/app/services/GeolocationService";

const geolocationService = new GeolocationService();  
// Function to dispose of geolocation service
export const disposeGeolocationService = () => {
  if (geolocationService !== undefined && typeof geolocationService.dispose === 'function') {
    geolocationService.dispose();
  }
};