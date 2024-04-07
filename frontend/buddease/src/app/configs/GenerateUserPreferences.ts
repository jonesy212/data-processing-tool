// generators/userPreferences.ts

export function* GenerateUserPreferences(): Generator<any, void, any> {
  const userPreferences = {
      modules: "modules",
      actions: [],
      reducers: [],
      // ... other userPreferences content
  };
  // Yield the userPreferences object
  yield userPreferences;
}
