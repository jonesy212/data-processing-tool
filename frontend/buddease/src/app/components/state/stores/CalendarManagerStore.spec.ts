import { NotificationType } from '@/app/components/support/NotificationContext';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import generateFakeData, { FakeDataPartial } from "../../Inteigents/FakeDataGenerator";
import { Data } from "../../models/data/Data";
import { Member } from '../../models/teams/TeamMembers';
import CalendarManagerStoreClass, {
  CalendarEvent,
  useCalendarManagerStore,
} from "./CalendarEvent";
import SnapshotStore, { Snapshot, SnapshotStoreConfig } from "./SnapshotStore";

const eventIds: string[] = [];
const events: Record<string, CalendarEvent[]> = {};
interface PartialFakeDataEvent extends FakeDataPartial, CalendarEvent {
  id: string 
  // Add other properties from CalendarEvent as needed
}
const convertToPartialFakeDataEvent = (fakeData: FakeDataPartial): PartialFakeDataEvent => ({
  ...fakeData,
  id: "fakeId",
  title: "", // Provide default values or leave them empty
  date: new Date, // Provide default values or leave them empty
  metadata: {}, // Provide default values or leave them empty
  status: "scheduled", // Provide default values or leave them empty
  rsvpStatus: "notResponded", // Provide default values or leave them empty
  host: {} as Member, // Provide default values or leave them empty
  color: "blue", // Provide default values or leave them empty

  // Add other properties as needed
});
describe("CalendarManagerStoreClass", () => {
  let calendarManagerStore = useCalendarManagerStore();

  beforeEach(() => {
    calendarManagerStore = new CalendarManagerStoreClass();
  });

  it("should add a new event", () => {
    const event: CalendarEvent = {
      id: "1",
      title: "Test Event",
      date: new Date(),
      status: "scheduled",
      metadata: {},
      rsvpStatus: 'yes',
      host: {} as Member,
      color: ''
    };

    calendarManagerStore.addEvent(event);

    expect(calendarManagerStore.events.scheduled).toContain(event);
  });

  it("should remove an event", () => {
    const eventId = "1";
    const event: CalendarEvent = {
      id: eventId,
      title: "Test Event",
      date: new Date(),
      status: "scheduled",
      metadata: {} as StructuredMetadata,
      rsvpStatus: 'yes',
      host: {} as Member,
      color: ''
    };

    calendarManagerStore.addEvent(event);
    calendarManagerStore.removeEvent(eventId);

    expect(calendarManagerStore.events.scheduled).not.toBe(
      expect.arrayContaining([event])
    );
  });

  it("should update the event status", () => {
    const event: CalendarEvent = {
      id: "1",
      title: "Test Event",
      date: new Date(),
      status: "scheduled",
      metadata: {} as StructuredMetadata,
      rsvpStatus: 'yes',
      host: {} as Member,
      color: ''
    };

    calendarManagerStore.addEvent(event);
    calendarManagerStore.updateEventStatus("1", "inProgress");

    expect(calendarManagerStore.events.scheduled[0].status).toBe("inProgress");
  });

  // Test Case 2: Fetch Events Request Failure
  it("should handle fetch events request failure gracefully", async () => {
    // Mock axiosInstance get method to throw an error
    const mockGet = jest.fn(() => Promise.reject(new Error("API Error")));
    jest.mock("../../security/csrfToken", () => ({
      default: { get: mockGet },
    }));

    await calendarManagerStore.fetchEventsRequest(eventIds, events);

    expect(calendarManagerStore.NOTIFICATION_MESSAGE).toBe(
      "Error fetching data"
    );
  });

  it("should fetch events from the API successfully", async () => {
    // Define mock eventIds and events

    // Mock axiosInstance get method
    const mockGet = jest.fn(() =>
      Promise.resolve({ data: [{ id: "1", title: "Mock Event" }] })
    );
    jest.mock("../../security/csrfToken", () => ({
      default: { get: mockGet },
    }));

    await calendarManagerStore.fetchEventsRequest(eventIds, events);

    expect(calendarManagerStore.events.scheduled.length).toBeGreaterThan(0);
  });

  // Test Case 5: Remove Event
  it("should remove an event from the store successfully", () => {
    const eventIdToRemove = "1"; // Assuming an event with this ID exists
    calendarManagerStore.removeEvent(eventIdToRemove);

    expect(calendarManagerStore.events.scheduled.length).toBe(0);
  });

  // Test Case 6: Remove Events
  it("should remove multiple events from the store successfully", () => {
    const eventIdsToRemove = ["1", "2"]; // Assuming events with these IDs exist
    calendarManagerStore.removeEvents(eventIdsToRemove);

    expect(Object.keys(calendarManagerStore.events).length).toBe(0);
  });

  // Test Case 7: Update Event Status
  it("should update the status of an event in the store successfully", () => {
    const eventIdToUpdate = "1"; // Assuming an event with this ID exists
    calendarManagerStore.updateEventStatus(eventIdToUpdate, "completed");

    expect(calendarManagerStore.events.completed.length).toBeGreaterThan(0);
  });

  // Test Case 8: Reassign Event
  it("should reassign an event to a new user successfully", () => {
    const eventIdToReassign = "1"; // Assuming an event with this ID exists
    const oldUserId = "user1";
    const newUserId = "user2";
    calendarManagerStore.reassignEvent(eventIdToReassign, oldUserId, newUserId);

    // Check if the event has been reassigned in the store
    // Additional assertions or mock implementations may be required depending on implementation details
  });

  // Test Case 9: Complete All Events
  it("should mark all events as completed successfully", () => {
    calendarManagerStore.completeAllEvents();

    // Check if all events are marked as completed in the store
    // Additional assertions or mock implementations may be required depending on implementation details
  });

  const mockConfig: SnapshotStoreConfig<Snapshot<Data>> = {
    key: "mockKey",
    initialState: {} as Snapshot<Data>,
    onSnapshot: {} as (snapshot: Snapshot<Data>) => void,
    clearSnapshots: {},
    snapshots: {} as (
      subscribers: (data: Data) => void,
      snapshot: Snapshot<Snapshot<Data>>[]
    ) => void,
    initSnapshot: {} as () => void,
    updateSnapshot: {} as (snapshot: Snapshot<Data>) => void,
    takeSnapshot: {} as (snapshot: Snapshot<Data>) => void,
    getSnapshot: {} as (snapshot: string) => Promise<Snapshot<Data>>,
    getSnapshots: {} as () => Snapshot<Snapshot<Data>>[],
    getAllSnapshots: {} as (
      data: (data: Data) => void,
      snapshot: Snapshot<Snapshot<Data>>[]
    ) => Snapshot<Snapshot<Data>>[],
    clearSnapshot: {} as () => void,
    configureSnapshotStore: {} as (snapshot: Snapshot<Data>) => void,
    takeSnapshotSuccess: {} as (snapshot: Snapshot<Data>) => void,
    updateSnapshotFailure: {} as (payload: { error: string }) => void,
    takeSnapshotsSuccess: {} as (snapshots: Snapshot<Data>[]) => void,
    fetchSnapshot: {} as (snapshotId: Snapshot<Data>) => void,
    updateSnapshotSuccess: {} as (snapshot: Snapshot<Data>[]) => void,
    updateSnapshotsSuccess: {} as (snapshots: Snapshot<Data>[]) => void,
    fetchSnapshotSuccess: {} as (snapshot: Snapshot<Data>[]) => void,
    createSnapshotSuccess: {} as (snapshot: Snapshot<Data>[]) => void,
    createSnapshotFailure: {} as (error: string) => void,
    batchUpdateSnapshotsSuccess: {} as (snapshotData: Snapshot<Data>[]) => void,
    batchFetchSnapshotsRequest: {} as (snapshotData: Snapshot<Data>[]) => void,
    batchFetchSnapshotsSuccess: {} as (snapshotData: Snapshot<Data>[]) => void,
    batchFetchSnapshotsFailure: {} as (payload: { error: string }) => void,
    batchUpdateSnapshotsFailure: {} as (payload: { error: string }) => void,
    notifySubscribers: {} as (subscribers: (data: Data) => void) => void,
    [Symbol.iterator]: {} as () => IterableIterator<Snapshot<Snapshot<Data>>>,

  };
  describe("Concurrent Operations in CalendarManagerStoreClass", () => {
    it.concurrent("should handle concurrent adding of events", async () => {
      // Generate fake data for concurrent adding of events
      const fakeEvents = generateFakeData(5); // Generate 5 fake events
  
      // Execute concurrent operations to add events
      await Promise.all(
        fakeEvents.map(async (fakeData) => {
          // Transform FakeData to PartialFakeDataEvent and add event concurrently
          const event = convertToPartialFakeDataEvent(fakeData);
          calendarManagerStore.addEvent(event);
        })
      );
  
      // Assert the expected state after concurrent adding of events
      // Add assertions to check data consistency and correctness
    });
  
    it.concurrent(
      "should handle concurrent updating of event status",
      async () => {
        // Generate fake data for concurrent updating of event status
        const fakeEvents: PartialFakeDataEvent[] = generateFakeData(5).map((fakeData) => convertToPartialFakeDataEvent(fakeData));
        const eventIds = fakeEvents.map((event) => event.id);
  
        // Add fake events to CalendarManagerStoreClass before updating status
        fakeEvents.forEach((event) => calendarManagerStore.addEvent(event));
  
        // Execute concurrent operations to update event status
        await Promise.all(
          eventIds.map(async (eventId) => {
            // Update event status concurrently
            await calendarManagerStore.updateEventStatus(eventId, "completed");
          })
        );
      }
    );
  });



  // Test Case: Realtime Update
  it("should handle realtime updates to events and snapshot data correctly", () => {
    

    const notify = (message: string, content: any, date: Date, type: NotificationType) => {
      // Log the notification details
      console.log(`Notification: ${message}`);
      console.log(`Content: ${content}`);
      console.log(`Date: ${date}`);
      console.log(`Type: ${type}`);
      
      // You can add more actions here based on the notification type or content
    };
    
    const events: Record<string, CalendarEvent[]> = {}; // Mocked events data
    const snapshotData: SnapshotStore<Snapshot<Data>> = new SnapshotStore<Snapshot<Data>>(mockConfig, notify);
  ; // Mocked snapshot data
    calendarManagerStore.handleRealtimeUpdate(events, snapshotData);
    calendarManagerStore.handleRealtimeUpdate(events, snapshotData);

    // Check if the events and snapshot data are updated correctly in the store
    // Additional assertions or mock implementations may be required depending on implementation details
  });
});
