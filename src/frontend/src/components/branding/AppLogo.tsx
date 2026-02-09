interface AppLogoProps {
  variant?: 'square' | 'wide';
  className?: string;
}

export function AppLogo({ variant = 'square', className = '' }: AppLogoProps) {
  const src = variant === 'wide' 
    ? '/assets/generated/aspen-dental-care-logo-wide.dim_800x240.png'
    : '/assets/generated/aspen-dental-care-logo.dim_512x512.png';

  return (
    <img 
      src={src} 
      alt="Aspen Dental Care logo" 
      className={className}
    />
  );
}
