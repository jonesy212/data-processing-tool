// FakeDataGenerator.ts
// src/app/generators/GenerateFakeData.ts
import { Data } from '@/core/models/data/Data';
import { faker } from '@faker-js/faker';


interface FakeDataPartial {
  id?: string;
}

interface FakeData extends Partial<Data>  {
  id?: number | string
  firstName?: string;
  lastName?: string;
  email?: string;
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
export type { FakeData, FakeDataPartial };
export default generateFakeData;
