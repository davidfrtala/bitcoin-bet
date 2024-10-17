import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PostHogProvider } from 'posthog-js/react';
import { Amplify } from 'aws-amplify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './app/app';
import { config } from './config';
import { Authenticator } from '@aws-amplify/ui-react';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.cognito.UserPoolId,
      userPoolClientId: config.cognito.ClientId,
      loginWith: {
        email: true,
      },
      userAttributes: {
        email: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 6,
      },
    },
  },
});

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <PostHogProvider
      apiKey={config.posthog.key}
      options={{
        api_host: config.posthog.host,
        person_profiles: 'always',
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Authenticator.Provider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Authenticator.Provider>
      </QueryClientProvider>
    </PostHogProvider>
  </StrictMode>
);
