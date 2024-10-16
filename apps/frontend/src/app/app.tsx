import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Content, Layout } from './components/Layout';

function App() {
  const { authStatus } = useAuthenticator((context) => [context.user]);

  return (
    <Layout>
      <Header />
      <Content>
        <Routes>
          <Route path="/" element={<div>Game</div>} />
          <Route
            path="/auth"
            element={
              authStatus === 'authenticated' ? (
                <Navigate to="/" replace />
              ) : (
                <Authenticator />
              )
            }
          />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
