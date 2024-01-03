// src/app/generators/GenerateFakeData.ts
import { faker } from '@faker-js/faker';

interface FakeData {
  // Define the structure of your fake data
  firstName: string;
  lastName: string;
  email: string;
  // Add more fields as needed
}

const generateFakeData = (count: number): FakeData[] => {
  const fakeData: FakeData[] = [];

  for (let i = 0; i < count; i++) {
    fakeData.push({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      // Add more fields and faker methods as needed
    });
  }

  return fakeData;
};

export default generateFakeData;
