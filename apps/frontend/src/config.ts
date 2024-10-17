export const config = {
  cognito: {
    UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  },
  appsync: {
    URL: import.meta.env.VITE_APPSYNC_URL,
  },
  posthog: {
    key: import.meta.env.VITE_POSTHOG_KEY,
    host: import.meta.env.VITE_POSTHOG_HOST,
  },
};
