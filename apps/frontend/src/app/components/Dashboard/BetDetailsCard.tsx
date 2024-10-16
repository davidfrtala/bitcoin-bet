import { Card, CardContent, CardHeader, CardTitle } from '../shadcn-ui';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useCurrentBetQuery } from '../../../api/queries';

export function BetDetailsCard() {
  const { authStatus } = useAuthenticator((context) => [context.user]);
  const isAuthenticated = authStatus === 'authenticated';

  const { data: currentBetData } = useCurrentBetQuery({
    enabled: isAuthenticated,
  });
  const currentBet = currentBetData?.currentBet;

  if (!currentBet) return null;

  const { startPrice, endPrice, priceDiff, result, guess, betTimestamp } =
    currentBet;

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold text-gray-100">
          Last Bet Details
        </CardTitle>
        {betTimestamp && (
          <p className="text-center text-xs text-gray-400">
            From:{' '}
            <span className="font-semibold text-orange-400">
              {new Date(betTimestamp).toLocaleString()}
            </span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-center text-gray-400">
          Your bet:{' '}
          <span
            className={`font-bold  ${
              guess === 'UP' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {guess === 'UP' ? 'Up  ▲' : 'Down  ▼'}
          </span>
        </p>
        {priceDiff && priceDiff !== null && (
          <p className="text-center text-gray-400">
            Price Difference:{' '}
            <span
              className={`font-bold ${
                priceDiff > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              ${priceDiff.toLocaleString()}
              {priceDiff > 0 ? ' ▲' : ' ▼'}
            </span>
          </p>
        )}
        {startPrice && (
          <p className="text-center text-gray-400">
            Starting Price:{' '}
            <span className="font-bold text-orange-400">
              ${startPrice.toLocaleString()}
            </span>
          </p>
        )}
        {endPrice && (
          <p className="text-center text-gray-400">
            Final Price:{' '}
            <span className="font-bold text-orange-400">
              ${endPrice?.toLocaleString()}
            </span>
          </p>
        )}
        {result && (
          <p className="text-center text-3xl font-bold text-gray-100">
            You{' '}
            {result === 'WIN' ? (
              <span className="text-green-400">Won 🎉</span>
            ) : (
              <span className="text-red-400">Lost</span>
            )}{' '}
            the bet!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
