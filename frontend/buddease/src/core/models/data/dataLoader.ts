// dataLoader.ts

export const dataLoader = {
  onLoad: (response: Response): void => {
    if (response.status >= 200 && response.status < 300) {
      response.json().then((data) => {
        console.log("API Response data:", data);
        // Process the response data here
      }).catch((error: Error) => {
        console.error("Error parsing response:", error);
      });
    } else {
      console.error("Request failed with status:", response.status);
      const errorMessage = `Request failed with status: ${response.status}`;
      // You can use your notification system here
      // notify("Request Failed", errorMessage, "error");
    }
  }
};

export default dataLoader;