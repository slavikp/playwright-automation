export const TEST_USERS = {
  admin: {
    email: process.env.ADMIN_EMAIL ?? '',
    password: process.env.ADMIN_PASSWORD ?? '',
    role: 'admin',
  },
  standard: {
    email: process.env.TEST_USER_EMAIL ?? '',
    password: process.env.TEST_USER_PASSWORD ?? '',
    role: 'user',
  },
} as const;
