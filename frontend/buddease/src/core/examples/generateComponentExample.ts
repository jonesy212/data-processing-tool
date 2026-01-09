generateComponentExample.ts
import { CacheManager } from '@/core/libraries/cache/client/CacheManager';
// Example 1: Simple component
generateComponent('MyButton');

// Example 2: Category-based component
generateComponent(
  'DataChart',
  'DataVisualization',
  { chartType: 'bar', dataProperties: { /*...*/ } },
  myBrand,
  'DataVisualization'
);

// Example 3: With custom directory and prompting
generateComponent(
  'CustomForm',
  undefined,
  undefined,
  undefined,
  undefined,
  '@/src/app/custom-components',
  'Custom prompting content'
);


// In your components

// Write to cache (client-side by default, optionally to server)
await CacheManager.write('userPreferences', userPrefs, { persistToServer: true });

// Read from cache (tries client first, then server)
const cachedData = await CacheManager.read('userPreferences');

Force synchronization
await CacheManager.synchronize('userPreferences', latestData);