import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchData } from './api-client';
import {
  PlayerQuery,
  CurrentBetQuery,
  PlaceBetMutation,
  PlaceBetMutationVariables,
} from './graphql-dto';

// Player Query
const PLAYER_QUERY = `
  query Player {
    player {
      email
      score
      userId
    }
  }
`;

export const usePlayerQuery = () =>
  useQuery<PlayerQuery>({
    queryKey: ['player'],
    queryFn: () => fetchData<PlayerQuery>(PLAYER_QUERY),
  });

// Current Bet Query
const CURRENT_BET_QUERY = `
  query CurrentBet {
    currentBet {
      betTimestamp
      endPrice
      guess
      priceDiff
      result
      startPrice
    }
  }
`;

export const useCurrentBetQuery = () =>
  useQuery<CurrentBetQuery>({
    queryKey: ['currentBet'],
    queryFn: () => fetchData<CurrentBetQuery>(CURRENT_BET_QUERY),
  });

// Place Bet Mutation
const PLACE_BET_MUTATION = `
  mutation PlaceBet($guess: Guess!, $waitTime: Int) {
    placeBet(input: { guess: $guess, waitTime: $waitTime })
  }
`;

export const usePlaceBetMutation = () =>
  useMutation<PlaceBetMutation, Error, PlaceBetMutationVariables>({
    mutationFn: (variables) =>
      fetchData<PlaceBetMutation, PlaceBetMutationVariables>(
        PLACE_BET_MUTATION,
        variables
      ),
  });
