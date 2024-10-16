import { useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';
import { useQueryClient } from '@tanstack/react-query';

export function Auth() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const listener = Hub.listen('auth', ({ payload }) => {
      // Invalidate all react-query cache after we sign in
      if (payload.event === 'signedIn') {
        queryClient.invalidateQueries();
      }
    });

    return () => {
      listener();
    };
  }, [queryClient]);

  return <Authenticator />;
}
