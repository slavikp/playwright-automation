import { faker } from '@faker-js/faker';

/**
 * TestDataGenerator — factory for test data.
 * Uses @faker-js/faker for realistic, randomised values.
 */
export class TestDataGenerator {
  static user() {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email({ provider: 'test.example.com' }).toLowerCase(),
      password: `Test${faker.internet.password({ length: 10, memorable: false })}1!`,
      phone: faker.phone.number({ style: 'national' }),
    };
  }
}
