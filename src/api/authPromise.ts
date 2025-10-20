import axios, { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mockAuthService, mockUsers } from './mockAuthService';

const axiosInstance = axios.create();
const mock = new MockAdapter(axiosInstance);


mock.onPost('/api/auth/login').reply(async (config) => {
  try {
    const credentials = JSON.parse(config.data);
    const result = await mockAuthService.login(credentials);
    return [200, result];
  } catch (error) {
    return [401, { message: (error as Error).message }];
  }
});

mock.onPost('/api/auth/complete-login').reply(async (config) => {
  try {
    const tempToken = JSON.parse(config.data).tempToken;
    const result = await mockAuthService.completeLogin(tempToken);
    return [200, result];
  } catch (error) {
    return [401, { message: (error as Error).message }];
  }
});

mock.onPost('/api/auth/validate').reply(async (config) => {
  try {
    const token = config.headers?.Authorization?.replace('Bearer ', '') || '';
    const user = await mockAuthService.validateToken(token);
    return [200, user];
  } catch (error) {
    return [401, { message: (error as Error).message }];
  }
});

mock.onGet('/api/auth/validate').reply(async (config) => {
  try {
    const token = config.headers?.Authorization?.replace('Bearer ', '') || '';
    const user = await mockAuthService.validateToken(token);
    return [200, user];
  } catch (error) {
    return [401, { message: (error as Error).message }];
  }
});

mock.onPost('/api/auth/logout').reply(async (config) => {
  return Promise.resolve({
    data: { message: 'Logged out successfully' },
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'application/json' },
    config,
  });
});

mock.onPost('/api/user/profile').reply(async (config) => {
  try {
    const token = config.headers?.Authorization?.replace('Bearer ', '') || '';
    const user = await mockAuthService.validateToken(token);
    const updatedUser = { ...user, ...config.data };
    return [200, updatedUser];
  } catch (error) {
    return [401, { message: (error as Error).message }];
  }
});

mock.onPut('/api/user/preferences').reply(async (config) => {
  try {
    const token = config.headers?.Authorization?.replace('Bearer ', '') || '';
    console.log(token);
    const user = await mockAuthService.updatePreferences(token, config.data);
    const updatedUser = { ...user, ...config.data };
    return [200, updatedUser];
  } catch (error) {
    return [401, { message: (error as Error).message }];
  }
});

mock.onGet('/api/users').reply(async () => {
  try {
    const user = mockAuthService.getDemoCredentials();
    return [200, user];
  } catch (error) {
    return [401, { message: (error as Error).message }];
  }
});

export const authService = mockAuthService;

// Export the mocked Axios instance
export default axiosInstance;