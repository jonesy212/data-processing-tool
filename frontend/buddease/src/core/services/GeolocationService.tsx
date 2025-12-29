// GeolocationService.tsx
// Define the GeolocationService class
class GeolocationService {
    watchId: any;
    // Method to get the user's current geolocation
    getCurrentLocation(): Promise<GeolocationCoordinates> {
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve(position.coords);
            },
            (error) => {
              reject(error);
            }
          );
        } else {
          reject(new Error("Geolocation is not supported by this browser."));
        }
      });
    }
  
    // Method to watch the user's current geolocation
    watchLocation(
      successCallback: (coords: GeolocationCoordinates) => void,
      errorCallback?: (error: GeolocationPositionError) => void
    ): number {
      if (navigator.geolocation) {
        return navigator.geolocation.watchPosition(
          (position) => {
            successCallback(position.coords);
          },
          errorCallback
        );
      } else {
        throw new Error("Geolocation is not supported by this browser.");
      }
    }

    dispose() {
      if(this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = undefined;
      }
    }
  
    // Method to clear the geolocation watch
    clearWatch(watchId: number): void {
      navigator.geolocation.clearWatch(watchId);
    }
  }
  
  export default GeolocationService;
  