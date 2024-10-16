import { Button } from '../shadcn-ui';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Guess } from '../../../api/queries';

interface BettingControlsProps {
  waitingPeriod: number;
  onWaitingPeriodChange: (period: number) => void;
  onMakeGuess: (direction: Guess) => void;
}

export function BettingControls({
  waitingPeriod,
  onWaitingPeriodChange,
  onMakeGuess,
}: BettingControlsProps) {
  return (
    <>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-400 mb-2">Waiting Period</p>
        <div className="flex justify-center space-x-2">
          {[5, 15, 30, 60].map((seconds) => (
            <Button
              key={seconds}
              variant={waitingPeriod === seconds ? 'default' : 'outline'}
              onClick={() => onWaitingPeriodChange(seconds)}
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
          onClick={() => onMakeGuess(Guess.UP)}
          variant="outline"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none"
        >
          <TrendingUp className="mr-2 h-5 w-5" />
          Guess Up
        </Button>
        <Button
          onClick={() => onMakeGuess(Guess.DOWN)}
          variant="outline"
          className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
        >
          <TrendingDown className="mr-2 h-5 w-5" />
          Guess Down
        </Button>
      </div>
    </>
  );
}
