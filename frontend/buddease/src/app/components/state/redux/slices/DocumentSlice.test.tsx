// DocumentSlice.test.tsx
import { AnyAction, configureStore, EnhancedStore, UnknownAction } from '@reduxjs/toolkit';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { RootState } from './RootSlice';

// Mock API functions or any external dependencies used in the async thunks
jest.mock('path/to/your/api', () => ({
  fetchDocumentByIdAPI: jest.fn(),
}));

// Mock NotificationContext and other dependencies as needed
jest.mock('@/app/components/support/NotificationContext', () => ({
  useNotification: jest.fn(() => ({
    notify: jest.fn(),
  })),
}));

describe('Async Thunk Tests', () => {
  let store: EnhancedStore;
  let dispatch: ThunkDispatch<RootState, undefined, UnknownAction>;

  beforeEach(() => {
    store = configureStore({
      reducer: YourRootReducer, // Provide your root reducer here
      middleware: [thunk],
    });

    dispatch = store.dispatch;
  });

  test('fetchDocumentByIdAsync thunk', async () => {
    const documentId = 123;
    const mockData = { id: documentId, title: 'Test Document' };

    // Mock the API response
    (fetchDocumentByIdAPI as jest.Mock).mockResolvedValueOnce(mockData);

    // Dispatch the thunk
    await dispatch(fetchDocumentById(documentId));

    // Get the updated state
    const state = store.getState();

    // Assert that the document was fetched and stored in the state
    expect(state.documents.selectedDocument).toEqual(mockData);
  });

  // Similar tests for other async thunks can be written here
});

describe('Utility Function Tests', () => {
  test('fetchDocumentsByIds utility function', async () => {
    const documentIds = [1, 2, 3];
    const mockData = [{ id: 1, title: 'Document 1' }, { id: 2, title: 'Document 2' }, { id: 3, title: 'Document 3' }];

    // Mock the API response
    (fetch as jest.Mock).mockResolvedValueOnce(mockData[0]);
    (fetch as jest.Mock).mockResolvedValueOnce(mockData[1]);
    (fetch as jest.Mock).mockResolvedValueOnce(mockData[2]);

    // Call the utility function
    const result = await fetchDocumentsByIds(documentIds);

    // Assert that the documents were fetched successfully
    expect(result).toEqual(mockData);
  });

  // Similar tests for other utility functions can be written here
});
