import { ErrorComponentProps } from '@tanstack/react-router';
import { BootstrapRecoveryScreen } from './BootstrapRecoveryScreen';
import { useQueryClient } from '@tanstack/react-query';
import { clearActorCache } from '@/utils/bootstrapReset';

/**
 * Router-level error boundary that catches route rendering errors during initialization
 * and presents the BootstrapRecoveryScreen with full state reset capabilities.
 */
export function RouterRecoveryBoundary({ error, reset }: ErrorComponentProps) {
  const queryClient = useQueryClient();

  return (
    <BootstrapRecoveryScreen
      error={error instanceof Error ? error : new Error('An unexpected error occurred')}
      onRetry={() => {
        // Clear actor cache to force fresh actor creation
        clearActorCache(queryClient);
        // Reset router error boundary
        reset();
        // Invalidate and refetch all queries
        queryClient.invalidateQueries();
        queryClient.refetchQueries();
      }}
      onResetSession={() => {
        // Clear React Query caches and relevant sessionStorage keys
        queryClient.clear();
        sessionStorage.removeItem('dashboardAccessVerified');
        sessionStorage.removeItem('dashboardAccessTimestamp');
        // Reload the page
        window.location.reload();
      }}
      onReload={() => {
        // Hard reload the page
        window.location.reload();
      }}
    />
  );
}
