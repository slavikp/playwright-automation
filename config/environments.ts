function getEnvVar(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export interface EnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  testUserEmail: string;
  testUserPassword: string;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    baseUrl: getEnvVar('BASE_URL', 'https://playonkansas.com'),
    apiBaseUrl: getEnvVar('API_BASE_URL', 'https://playonkansas.com/api'),
    testUserEmail: getEnvVar('TEST_USER_EMAIL'),
    testUserPassword: getEnvVar('TEST_USER_PASSWORD'),
  };
}

export const ENV_CONFIG = getEnvironmentConfig();
