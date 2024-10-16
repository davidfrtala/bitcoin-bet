import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import App from './app/app';
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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <Authenticator.Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Authenticator.Provider>
  </StrictMode>
);
