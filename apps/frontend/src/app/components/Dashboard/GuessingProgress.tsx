import { Progress } from '../shadcn-ui';
import { Guess } from '../../../api/queries';

interface GuessingProgressProps {
  countdown: number;
  waitingPeriod: number;
  guess?: Guess | null;
}

export function GuessingProgress({
  guess,
  countdown,
  waitingPeriod,
}: GuessingProgressProps) {
  return (
    <div className="text-center p-4 bg-gray-700/50 rounded-lg">
      <p className="text-lg font-semibold text-gray-200">
        Your guess:{' '}
        {guess === Guess.UP ? 'Price will go up' : 'Price will go down'}
      </p>
      <p className="text-sm text-gray-400 mb-2">Waiting for result...</p>
      <Progress
        value={(countdown / waitingPeriod) * 100}
        className="h-2 bg-blue-900 transition-all duration-1000 ease-linear"
      />
      <p className="text-xs text-gray-400 mt-1">
        {countdown} seconds remaining
      </p>
    </div>
  );
}
