import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { LogIn, LogOut } from 'lucide-react';

import { Button } from './shadcn-ui';

export function Header() {
  const { user, authStatus, signOut } = useAuthenticator((context) => [
    context.user,
  ]);
  const isAuthenticated = authStatus === 'authenticated';
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="bg-gray-900 text-gray-100 p-4 flex justify-between items-center border-b border-gray-800">
      <h1 className="text-2xl font-bold">BTC Price Predictor</h1>
      <div className="flex items-center space-x-4">
        {isAuthenticated && (
          <span className="text-sm font-medium">
            {user?.signInDetails?.loginId}
          </span>
        )}
        {isAuthenticated ? (
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="bg-gray-800 text-gray-100 hover:bg-gray-700 border-gray-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        ) : (
          <Button
            onClick={() => navigate('/auth')}
            variant="outline"
            className="bg-gray-800 text-gray-100 hover:bg-gray-700 border-gray-700"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
