import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

const spacingClasses = {
  sm: 'py-8 sm:py-10',
  md: 'py-10 sm:py-12 md:py-16',
  lg: 'py-12 sm:py-16 md:py-20',
  xl: 'py-16 sm:py-20 md:py-24',
};

export function Section({
  children,
  className,
  spacing = 'md',
}: SectionProps) {
  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  );
}
