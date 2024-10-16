import axios from 'axios';
import { config } from '../config';
import { cognitoUserPoolsTokenProvider } from '@aws-amplify/auth/cognito';

const apiClient = axios.create({
  baseURL: config.appsync.URL,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await cognitoUserPoolsTokenProvider.getTokens();
    if (token) {
      config.headers.Authorization = `Bearer ${token.idToken}`;
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
  return config;
});

export const fetchData = async <TData, TVariables = unknown>(
  query: string,
  variables?: TVariables
): Promise<TData> => {
  const response = await apiClient.post('', {
    query,
    variables,
  });

  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }

  return response.data.data;
};

export { apiClient };
