import { Promise } from 'es6-promise';

// CustomFetchEvent.ts
// Logic for FetchEvent interface

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

interface CustomFetchEventInit extends EventInit {
  request: Request;
}

class CustomFetchEvent extends Event implements FetchEvent {
  readonly request: Request;
  readonly clientId: string | null;
  readonly isReload: boolean;
  private _respondWith: Response | Promise<Response> | null;

  constructor(type: string, eventInitDict: CustomFetchEventInit) {
    super(type, eventInitDict);
    this.request = eventInitDict.request;
    this.clientId = null; // You can set clientId here or provide it as an argument
    this.isReload = false; // You can set isReload here or provide it as an argument
    this._respondWith = null;
  }

  // Method to respond to the fetch event with a given response
  respondWith(response: Response | Promise<Response>): void {
    if (this._respondWith === null) {
      if (response instanceof Promise) {
        (response as Promise<Response>)
          .then((res) => (this._respondWith = res))
          .catch((error) => {
            // Handle any errors from the promise
            console.error("Error occurred while processing promise:", error);
            // Optionally, you can set a default response here or rethrow the error
            // this._respondWith = new Response("Error occurred", { status: 500 });
            // throw error;
          });
      } else {
        this._respondWith = response;
      }
    }
  }

  // Method to get the response associated with the fetch event
  getResponse(): Promise<Response> {
    return this._respondWith as Promise<Response>;
  }

  // Static method to handle fetch events
  static handleFetchEvent(event: CustomFetchEvent): void {
    fetch(event.request)
      .then(response => {
        event.respondWith(response); // Pass the response directly to respondWith
      })
      .catch(error => {
        // Handle errors here
        console.error("Error occurred while processing fetch request:", error);
        // Optionally, provide a default response or rethrow the error
        event.respondWith(new Response("Error occurred", { status: 500 }));
        throw error;
      });
  }

}

// Example usage:
const fetchRequest = new Request("/api/data");
const fetchEvent = new CustomFetchEvent("customFetchEventType", { request: fetchRequest });

// Add an event listener for fetch events
self.addEventListener("fetch", (event: FetchEvent) => {
  const customEvent = event as CustomFetchEvent;
  CustomFetchEvent.handleFetchEvent(customEvent);
});
