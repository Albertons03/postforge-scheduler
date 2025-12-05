import { cn } from '@/lib/utils';

interface StackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'vertical' | 'horizontal';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const spacingClasses = {
  vertical: {
    xs: 'space-y-2',
    sm: 'space-y-3 sm:space-y-4',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8',
    xl: 'space-y-8 sm:space-y-10',
  },
  horizontal: {
    xs: 'space-x-2',
    sm: 'space-x-3 sm:space-x-4',
    md: 'space-x-4 sm:space-x-6',
    lg: 'space-x-6 sm:space-x-8',
    xl: 'space-x-8 sm:space-x-10',
  },
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export function Stack({
  children,
  className,
  spacing = 'md',
  direction = 'vertical',
  align = 'stretch',
  justify = 'start',
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        spacingClasses[direction][spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}
