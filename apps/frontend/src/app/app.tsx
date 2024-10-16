import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { usePlayerQuery } from '../api/queries';
import { Header } from './components/Header';
import { Content, Layout } from './components/Layout';
import { Auth } from './components/Auth';
import '@aws-amplify/ui-react/styles.css';

export function App() {
  const { authStatus } = useAuthenticator((context) => [context.user]);
  const { data } = usePlayerQuery();

  return (
    <Layout>
      <Header />
      <Content>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Score: {data?.player.score}
                </h1>
              </div>
            }
          />
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
