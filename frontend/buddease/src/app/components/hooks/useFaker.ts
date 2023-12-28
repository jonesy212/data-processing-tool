// src/app/hooks/useFaker.ts
import faker from 'faker';

const useFaker = () => {
  // Implement your logic to generate fake data using faker
  // Customize according to your requirements
  const generateFakeData = () => {
    // Example: Generating fake name and email
    const fakeName = faker.name.findName();
    const fakeEmail = faker.internet.email();

    return { fakeName, fakeEmail };
  };

  return { generateFakeData };
};

export default useFaker;
