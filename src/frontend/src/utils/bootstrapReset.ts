import { QueryClient } from '@tanstack/react-query';

/**
 * Shared utility to fully reset bootstrap state by clearing cached actor queries
 * and dependent queries in React Query, ensuring a fresh bootstrap attempt.
 * Also clears legacy access-code sessionStorage keys.
 */

const ACTOR_QUERY_KEY = 'actor';

/**
 * Removes all actor-related queries from the React Query cache.
 * This forces a fresh actor creation on the next bootstrap attempt.
 */
export function clearActorCache(queryClient: QueryClient): void {
  // Remove all queries with the actor key
  queryClient.removeQueries({
    predicate: (query) => {
      return query.queryKey.includes(ACTOR_QUERY_KEY);
    },
  });
}

/**
 * Removes all dependent queries (everything except actor queries).
 * This ensures no stale data persists after actor reset.
 */
export function clearDependentQueries(queryClient: QueryClient): void {
  queryClient.removeQueries({
    predicate: (query) => {
      return !query.queryKey.includes(ACTOR_QUERY_KEY);
    },
  });
}

/**
 * Fully resets bootstrap state by clearing both actor and dependent queries,
 * plus legacy access-code sessionStorage keys.
 */
export function resetBootstrapState(queryClient: QueryClient): void {
  clearActorCache(queryClient);
  clearDependentQueries(queryClient);
  
  // Clear legacy access-code keys from sessionStorage
  sessionStorage.removeItem('dashboardAccessVerified');
  sessionStorage.removeItem('dashboardAccessTimestamp');
}
