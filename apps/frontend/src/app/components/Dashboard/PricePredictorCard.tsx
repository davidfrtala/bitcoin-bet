import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { LogIn } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../shadcn-ui';
import {
  usePlaceBetMutation,
  useCurrentBetQuery,
  Guess,
} from '../../../api/queries';
import { GuessingProgress } from './GuessingProgress';
import { BettingControls } from './BettingControls';
import { CurrentBTCPrice } from './CurrentBTCPrice';
import { useCountdown } from '../../../hooks/useCountdown';

export function PricePredictorCard() {
  const queryClient = useQueryClient();
  const { authStatus } = useAuthenticator((context) => [context.user]);
  const isAuthenticated = authStatus === 'authenticated';

  const [localGuess, setLocalGuess] = useState<Guess | null>(null);
  const [localGuessTime, setLocalGuessTime] = useState<number | null>(null);
  const [localWaitingPeriod, setLocalWaitingPeriod] = useState<number>(5);

  const { data: currentBet } = useCurrentBetQuery({
    enabled: isAuthenticated,
    select: (data) => data.currentBet,
  });

  const isResolved = currentBet?.result !== null;
  const isCurrentlyGuessing = !isResolved || localGuess !== null;

  const { mutate: placeBet } = usePlaceBetMutation({
    onMutate: ({ guess }) => {
      setLocalGuess(guess);
      queryClient.setQueryData(['currentBet'], () => ({
        currentBet: {
          guess,
        },
      }));
    },
    onSuccess: () => {
      setLocalGuessTime(Date.now());
    },
  });

  const startTime =
    localGuessTime ||
    ((currentBet?.betTimestamp &&
      new Date(parseInt(currentBet.betTimestamp)).getTime()) as number);
  const waitTime = isCurrentlyGuessing
    ? !isResolved
      ? currentBet?.waitTime
      : localWaitingPeriod
    : localWaitingPeriod;

  const { countdown } = useCountdown({
    isGuessing: isCurrentlyGuessing,
    startTime,
    waitTime,
  });

  const handleMakeGuess = (guess: Guess) =>
    placeBet({
      guess,
      waitTime: localWaitingPeriod,
    });

  const resolveGuess = async () => {
    await queryClient.invalidateQueries();
    if (isResolved) {
      setLocalGuess(null);
      setLocalGuessTime(null);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-extrabold text-gray-100">
          Bitcoin Price Predictor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CurrentBTCPrice />

        {isAuthenticated ? (
          isCurrentlyGuessing || localGuess ? (
            countdown === 0 ? (
              <Button
                onClick={resolveGuess}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Check Result
              </Button>
            ) : (
              <GuessingProgress
                guess={localGuess || currentBet?.guess}
                countdown={countdown ?? 0}
                waitingPeriod={waitTime}
              />
            )
          ) : (
            <BettingControls
              waitingPeriod={localWaitingPeriod}
              onWaitingPeriodChange={setLocalWaitingPeriod}
              onMakeGuess={handleMakeGuess}
            />
          )
        ) : (
          <SignInButton />
        )}
      </CardContent>
    </Card>
  );
}

function SignInButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/auth')}
      variant="outline"
      className="w-full bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
    >
      <LogIn className="mr-2 h-4 w-4" />
      Sign In to Play
    </Button>
  );
}
