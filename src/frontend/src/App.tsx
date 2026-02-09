import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useActor } from './hooks/useActor';
import { useBootstrapTimeout } from './hooks/useBootstrapTimeout';
import { AppShell } from './components/shell/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { AlignerTrackingPage } from './pages/AlignerTrackingPage';
import { ImplantTrackingPage } from './pages/ImplantTrackingPage';
import { PatientFeedbackPage } from './pages/PatientFeedbackPage';
import { ZonalAnalyticsPage } from './pages/ZonalAnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { BootstrapRecoveryScreen } from './components/bootstrap/BootstrapRecoveryScreen';
import { RouterRecoveryBoundary } from './components/bootstrap/RouterRecoveryBoundary';
import { useQueryClient } from '@tanstack/react-query';
import { clearActorCache } from './utils/bootstrapReset';

function RootComponent() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);

  // Compute overall loading state - actor must be available for bootstrap to complete
  const isBootstrapping = !actor || actorFetching;
  
  // Check for timeout with bootstrap attempt key to reset timer on retry
  const hasTimedOut = useBootstrapTimeout(isBootstrapping, 15000, bootstrapAttempt);

  // Show recovery screen if timed out
  if (hasTimedOut) {
    return (
      <BootstrapRecoveryScreen
        error={new Error('Loading timed out. Please try again.')}
        onRetry={() => {
          // Increment bootstrap attempt to reset timeout timer
          setBootstrapAttempt(prev => prev + 1);
          // Clear actor cache to force fresh actor creation
          clearActorCache(queryClient);
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

  // Show loading spinner while bootstrapping
  if (isBootstrapping) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <AppShell />;
}

const rootRoute = createRootRoute({
  component: RootComponent,
  errorComponent: RouterRecoveryBoundary,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const patientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patients',
  component: PatientsPage,
});

const alignerTrackingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aligner-tracking',
  component: AlignerTrackingPage,
});

const implantTrackingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/implant-tracking',
  component: ImplantTrackingPage,
});

const patientFeedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patient-feedback',
  component: PatientFeedbackPage,
});

const zonalAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/zonal-analytics',
  component: ZonalAnalyticsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  patientsRoute,
  alignerTrackingRoute,
  implantTrackingRoute,
  patientFeedbackRoute,
  zonalAnalyticsRoute,
  settingsRoute,
]);

const router = createRouter({ 
  routeTree,
  defaultErrorComponent: RouterRecoveryBoundary,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
