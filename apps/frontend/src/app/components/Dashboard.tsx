import { ScoreCard } from './Dashboard/ScoreCard';
import { PricePredictorCard } from './Dashboard/PricePredictorCard';
import { BetDetailsCard } from './Dashboard/BetDetailsCard';
import { useAuthenticator } from '@aws-amplify/ui-react';

export function Dashboard() {
  const { authStatus } = useAuthenticator((context) => [context.user]);
  const isAuthenticated = authStatus === 'authenticated';

  return isAuthenticated ? (
    <>
      <ScoreCard />
      <PricePredictorCard />
      <BetDetailsCard />
    </>
  ) : (
    <PricePredictorCard />
  );
}
