# Managing State in JavaScript Applications: Examples and Scenarios

## MobX Store for a Feature

```javascript
// Example MobX Store for a Feature
import { makeAutoObservable } from "mobx"

class FeatureStore {
  // Define observable properties
  featureData = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Define actions to modify state
  updateFeatureData(newData) {
    this.featureData = newData;
  }
}

// Export instance of FeatureStore
const featureStore = new FeatureStore();
export default featureStore;
When to use:
Use MobX Store for managing local state within a feature when you need simple and efficient state management without the overhead of Redux.
Ideal for smaller-scale applications or individual feature-level state management.
Scenario Example:
In a chat application, use MobX Store to manage the state of a chat window component, including messages, user status, and typing indicators.

useStore Hook
javascript
Copy code
// Example useStore Hook
import { useContext } from "react"
import FeatureStore from "./FeatureStore"

const useStore = () => {
  return useContext(FeatureStoreContext);
};

export default useStore;
When to use:
Use useStore Hook to access MobX stores within React components when you need to interact with MobX store data and actions.
Scenario Example:
In a user profile page component, use useStore Hook to access and update user profile data stored in the MobX Store.

Redux Slice for a Feature
javascript
Copy code
// Example Redux Slice for a Feature
import { createSlice } from "@reduxjs/toolkit"

const featureSlice = createSlice({
  name: "feature",
  initialState: {
    featureData: null,
  },
  reducers: {
    updateFeatureData(state, action) {
      state.featureData = action.payload;
    },
  },
});

export const { updateFeatureData } = featureSlice.actions;
export default featureSlice.reducer;
When to use:
Use Redux Slice for managing global state across features when you need centralized and predictable state management with actions and reducers.
Scenario Example:
In an e-commerce application, use Redux Slice to manage the state of the shopping cart, including items, quantities, and total price.

Redux Saga for a Feature
javascript
Copy code
// Example Redux Saga for a Feature
import { call, put, takeLatest } from "redux-saga/effects"
import { fetchFeatureData } from "./api"
import { fetchFeatureDataFailure, fetchFeatureDataSuccess } from "./featureSlice"

function* handleFetchFeatureData(action) {
  try {
    const featureData = yield call(fetchFeatureData, action.payload);
    yield put(fetchFeatureDataSuccess(featureData));
  } catch (error) {
    yield put(fetchFeatureDataFailure(error.message));
  }
}

function* featureSaga() {
  yield takeLatest("feature/fetchData", handleFetchFeatureData);
}

export default featureSaga;
When to use:
Use Redux Saga for handling complex asynchronous actions and side effects, such as API calls, when using Redux for global state management.
Scenario Example:
In a weather application, use Redux Saga to fetch weather data from an external API asynchronously and update the Redux store with the fetched data.
 The saga would watch for a "FETCH_WEATHER"
By understanding when to use each example and applying them in relevant scenarios, you can effectively manage state and side effects in your application while adhering to best practices and architectural patterns.