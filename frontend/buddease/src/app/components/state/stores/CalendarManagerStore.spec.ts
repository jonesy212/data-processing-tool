 
describe('CalendarManagerStore', () => {
  let calendarManagerStore;

  beforeEach(() => {
    calendarManagerStore = new CalendarManagerStoreClass();
  });

  test('addEvent should add a new event', () => {
    const initialEventsCount = Object.keys(calendarManagerStore.events).length;
    calendarManagerStore.updateEventTitle('Test Event');
    calendarManagerStore.addEvent();
    const updatedEventsCount = Object.keys(calendarManagerStore.events).length;
    
    expect(updatedEventsCount).toBe(initialEventsCount + 1);
  });

  test('removeEvent should remove an existing event', () => {
    calendarManagerStore.updateEventTitle('Test Event');
    calendarManagerStore.addEvent();
    const eventId = Object.keys(calendarManagerStore.events)[0];
    calendarManagerStore.removeEvent(eventId);
    
    expect(calendarManagerStore.events[eventId]).toBeUndefined();
  });

  // Add more test cases for other methods and functionalities as needed

  test('fetchEventsRequest should fetch events successfully', async () => {
    const mockResponse = {
      data: [{ id: '1', title: 'Mock Event' }],
    };
    jest.spyOn(axiosInstance, 'get').mockResolvedValue(mockResponse);

    await calendarManagerStore.fetchEventsRequest();

    expect(calendarManagerStore.events['1']).toBeDefined();
  });

  test('fetchEventsFailure should handle fetch failure', async () => {
    jest.spyOn(axiosInstance, 'get').mockRejectedValue(new Error('Fetch error'));

    await calendarManagerStore.fetchEventsRequest();

    expect(console.error).toHaveBeenCalledWith('Fetch Events Failure:', 'Fetch error');
  });
});
