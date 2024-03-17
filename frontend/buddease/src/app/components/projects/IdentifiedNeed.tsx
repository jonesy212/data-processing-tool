// IdentifiedNeed.tsx

export interface IdentifiedNeed {
  id: string;
  name: string;
  description: string;
  priority: number;
  // Add other properties as needed
}

const identifiedNeedData: IdentifiedNeed = {
  id: '1',
  name: 'Example Need',
  description: 'This is an example need description.',
  priority: 1,
  // Initialize other properties as needed
};

export default identifiedNeedData;
