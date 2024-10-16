import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from './shadcn-ui';
import { TrendingUp, TrendingDown, LogIn } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

// Simulated function to get the current BTC price
const getCurrentBTCPrice = () => {
  return Math.floor(Math.random() * (60000 - 50000) + 50000);
};

export function Dashboard() {
  const { authStatus } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(getCurrentBTCPrice());
  const [guess, setGuess] = useState<'up' | 'down' | null>(null);
  const [guessTime, setGuessTime] = useState<number | null>(null);
  const [isGuessing, setIsGuessing] = useState(false);
  const [betStartPrice, setBetStartPrice] = useState<number | null>(null);
  const [betEndPrice, setBetEndPrice] = useState<number | null>(null);
  const [betOutcome, setBetOutcome] = useState<'won' | 'lost' | null>(null);
  const [waitingPeriod, setWaitingPeriod] = useState(15);
  const [countdown, setCountdown] = useState(waitingPeriod);

  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = getCurrentBTCPrice();
      setCurrentPrice(newPrice);

      if (isGuessing && guessTime) {
        const elapsedTime = (Date.now() - guessTime) / 1000;
        if (elapsedTime >= waitingPeriod) {
          resolveGuess(newPrice);
        } else {
          setCountdown(Math.max(0, waitingPeriod - Math.floor(elapsedTime)));
        }
      }
    }, 1000); // Update every second for smoother countdown

    return () => clearInterval(interval);
  }, [isGuessing, guessTime, waitingPeriod]);

  useEffect(() => {
    if (betOutcome === 'won') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [betOutcome]);

  const makeGuess = (direction: 'up' | 'down') => {
    setGuess(direction);
    setGuessTime(Date.now());
    setIsGuessing(true);
    setBetStartPrice(currentPrice);
    setBetEndPrice(null);
    setBetOutcome(null);
    setCountdown(waitingPeriod);
  };

  const resolveGuess = (newPrice: number) => {
    setBetEndPrice(newPrice);
    if (guess === 'up' && newPrice > currentPrice) {
      setScore(score + 1);
      setBetOutcome('won');
    } else if (guess === 'down' && newPrice < currentPrice) {
      setScore(score + 1);
      setBetOutcome('won');
    } else {
      setScore(score - 1);
      setBetOutcome('lost');
    }
    setGuess(null);
    setGuessTime(null);
    setIsGuessing(false);
    setCountdown(waitingPeriod);
  };

  return (
    <>
      <Card
        className={`${
          score > 0
            ? 'bg-green-900/30 border-green-500'
            : score < 0
            ? 'bg-red-900/30 border-red-500'
            : 'bg-gray-800/50 border-gray-700'
        } border-2`}
      >
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-300">Your Score</p>
            <p
              className={`text-4xl font-bold ${
                score > 0
                  ? 'text-green-400'
                  : score < 0
                  ? 'text-red-400'
                  : 'text-gray-300'
              }`}
            >
              {isAuthenticated ? score : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-extrabold text-gray-100">
            Bitcoin Price Predictor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-400">Current BTC Price</p>
            <p className="text-4xl font-bold text-orange-400">
              ${currentPrice.toLocaleString()}
            </p>
          </div>
          {isAuthenticated ? (
            isGuessing ? (
              <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                <p className="text-lg font-semibold text-gray-200">
                  Your guess:{' '}
                  {guess === 'up' ? 'Price will go up' : 'Price will go down'}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  Waiting for result...
                </p>
                <Progress
                  value={(countdown / waitingPeriod) * 100}
                  className="h-2 bg-blue-900 transition-all duration-1000 ease-linear"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {countdown} seconds remaining
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-400 mb-2">
                    Waiting Period
                  </p>
                  <div className="flex justify-center space-x-2">
                    {[15, 30, 60].map((seconds) => (
                      <Button
                        key={seconds}
                        variant={
                          waitingPeriod === seconds ? 'default' : 'outline'
                        }
                        onClick={() => setWaitingPeriod(seconds)}
                        className={`w-16 h-8 text-xs ${
                          waitingPeriod === seconds
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
                        }`}
                      >
                        {seconds}s
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-row-reverse justify-between space-x-4 space-x-reverse">
                  <Button
                    onClick={() => makeGuess('up')}
                    variant="outline"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none"
                  >
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Guess Up
                  </Button>
                  <Button
                    onClick={() => makeGuess('down')}
                    variant="outline"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
                  >
                    <TrendingDown className="mr-2 h-5 w-5" />
                    Guess Down
                  </Button>
                </div>
              </>
            )
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              className="w-full bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In to Play
            </Button>
          )}
        </CardContent>
      </Card>

      {betStartPrice && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold text-gray-100">
              Bet Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-center text-gray-400">
              Starting Price:{' '}
              <span className="font-bold text-orange-400">
                ${betStartPrice.toLocaleString()}
              </span>
            </p>
            {betEndPrice && (
              <p className="text-center text-gray-400">
                Final Price:{' '}
                <span className="font-bold text-orange-400">
                  ${betEndPrice.toLocaleString()}
                </span>
              </p>
            )}
            {betOutcome && (
              <p className="text-center text-3xl font-bold text-gray-100">
                You{' '}
                {betOutcome === 'won' ? (
                  <span className="text-green-400">Won</span>
                ) : (
                  <span className="text-red-400">Lost</span>
                )}{' '}
                the bet!
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
