export const config = {
  cognito: {
    UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  },
  appsync: {
    URL: import.meta.env.VITE_APPSYNC_URL,
  },
};
