import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLogo } from '../branding/AppLogo';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b bg-card px-4 py-3 lg:hidden">
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
          <AppLogo variant="square" className="h-6 w-6 object-contain" />
        </div>
        <div>
          <h1 className="text-lg font-bold">ClinicPulse</h1>
        </div>
      </div>
    </header>
  );
}
