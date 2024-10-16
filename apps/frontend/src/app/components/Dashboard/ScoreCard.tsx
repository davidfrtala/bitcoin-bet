import { Card, CardContent } from '../shadcn-ui';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { usePlayerQuery } from '../../../api/queries';

export function ScoreCard() {
  const { authStatus } = useAuthenticator((context) => [context.user]);
  const isAuthenticated = authStatus === 'authenticated';

  const { data: playerData } = usePlayerQuery({ enabled: isAuthenticated });
  const score = playerData?.player?.score ?? 0;

  const getScoreColor = (score: number) => {
    if (score > 0) return 'text-green-400';
    if (score < 0) return 'text-red-400';
    return 'text-gray-300';
  };

  const getCardStyle = (score: number) => {
    if (score > 0) return 'bg-green-900/30 border-green-500';
    if (score < 0) return 'bg-red-900/30 border-red-500';
    return 'bg-gray-800/50 border-gray-700';
  };

  return (
    <Card className={`${getCardStyle(score)} border-2`}>
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-300">Your Score</p>
          <p className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {isAuthenticated ? score : 'N/A'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
