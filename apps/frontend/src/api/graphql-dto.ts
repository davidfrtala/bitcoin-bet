// Enums
export enum Guess {
  UP = 'UP',
  DOWN = 'DOWN',
}

// Types
export type Player = {
  email: string;
  score: number;
  userId: string;
};

export type CurrentBet = {
  betTimestamp: string;
  endPrice: number | null;
  guess: Guess;
  priceDiff: number | null;
  result: boolean | null;
  startPrice: number;
};

// Queries
export type PlayerQuery = {
  player: Player;
};

export type CurrentBetQuery = {
  currentBet: CurrentBet;
};

// Mutations
export type PlaceBetMutationVariables = {
  guess: Guess;
  waitTime?: number | null;
};

export type PlaceBetMutation = {
  placeBet: boolean;
};
