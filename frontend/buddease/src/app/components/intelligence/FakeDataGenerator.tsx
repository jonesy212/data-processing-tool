// src/app/generators/GenerateFakeData.ts
import { faker } from '@faker-js/faker';
import { Data } from '../models/data/Data';


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
