import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { Content, Layout } from './components/Layout';
import { Auth } from './components/Auth';
import '@aws-amplify/ui-react/styles.css';

export function App() {
  const { authStatus } = useAuthenticator((context) => [context.user]);

  return (
    <Layout>
      <Header />
      <Content>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/auth"
            element={
              authStatus === 'unauthenticated' ? (
                <Auth />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Content>
    </Layout>
  );
}
