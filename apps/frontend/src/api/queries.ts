import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { fetchData } from './api-client';
import {
  PlayerQuery,
  CurrentBetQuery,
  PlaceBetMutation,
  PlaceBetMutationVariables,
} from './graphql-dto';

type OmitOptions<T> = Omit<T, 'queryKey' | 'queryFn'>;

export * from './graphql-dto';

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

export const usePlayerQuery = (
  options?: OmitOptions<UseQueryOptions<PlayerQuery>>
) =>
  useQuery<PlayerQuery>({
    ...options,
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

export const useCurrentBetQuery = (
  options?: OmitOptions<UseQueryOptions<CurrentBetQuery>>
) =>
  useQuery<CurrentBetQuery>({
    ...options,
    queryKey: ['currentBet'],
    queryFn: () => fetchData<CurrentBetQuery>(CURRENT_BET_QUERY),
  });

// Place Bet Mutation
const PLACE_BET_MUTATION = `
  mutation PlaceBet($guess: Guess!, $waitTime: Int) {
    placeBet(input: { guess: $guess, waitTime: $waitTime })
  }
`;

export const usePlaceBetMutation = (
  options?: UseMutationOptions<
    PlaceBetMutation,
    Error,
    PlaceBetMutationVariables
  >
) =>
  useMutation<PlaceBetMutation, Error, PlaceBetMutationVariables>({
    ...options,
    mutationFn: (variables) =>
      fetchData<PlaceBetMutation, PlaceBetMutationVariables>(
        PLACE_BET_MUTATION,
        variables
      ),
  });
