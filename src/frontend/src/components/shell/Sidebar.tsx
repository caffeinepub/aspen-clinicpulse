import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AppLogo } from '../branding/AppLogo';
import {
  LayoutDashboard,
  Users,
  Smile,
  Drill,
  MessageSquare,
  BarChart3,
  Settings,
  RotateCw,
} from 'lucide-react';

interface SidebarProps {
  onNavigate: () => void;
}

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/aligner-tracking', label: 'Aligner Tracking', icon: Smile },
  { path: '/implant-tracking', label: 'Implant Tracking', icon: Drill },
  { path: '/patient-feedback', label: 'Patient Feedback', icon: MessageSquare },
  { path: '/zonal-analytics', label: 'Zonal Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const queryClient = useQueryClient();

  const currentPath = routerState.location.pathname;

  const handleResetSession = () => {
    // Clear React Query caches and relevant sessionStorage keys
    queryClient.clear();
    sessionStorage.removeItem('dashboardAccessVerified');
    sessionStorage.removeItem('dashboardAccessTimestamp');
    // Reload the page
    window.location.reload();
  };

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    onNavigate();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-teal-700 to-teal-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
          <AppLogo variant="square" className="h-8 w-8 object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-bold">ClinicPulse</h1>
          <p className="text-xs text-teal-200">Aspen Dental</p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start gap-3 text-white hover:bg-white/10 ${
                isActive ? 'bg-white/20 hover:bg-white/20' : ''
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <Separator className="bg-white/10" />

      {/* Session Actions */}
      <div className="p-4 space-y-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white hover:bg-white/10"
          onClick={handleResetSession}
        >
          <RotateCw className="h-5 w-5" />
          <span>Reset Session</span>
        </Button>
      </div>
    </div>
  );
}
