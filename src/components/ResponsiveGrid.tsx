import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { default: 1, sm: 2, md: 2, lg: 3, xl: 4 }
}) => {
  const gridClasses = cn(
    'grid gap-6',
    {
      'grid-cols-1': cols.default === 1,
      'grid-cols-2': cols.default === 2,
      'grid-cols-3': cols.default === 3,
      'grid-cols-4': cols.default === 4,
    },
    {
      'sm:grid-cols-1': cols.sm === 1,
      'sm:grid-cols-2': cols.sm === 2,
      'sm:grid-cols-3': cols.sm === 3,
      'sm:grid-cols-4': cols.sm === 4,
    },
    {
      'md:grid-cols-1': cols.md === 1,
      'md:grid-cols-2': cols.md === 2,
      'md:grid-cols-3': cols.md === 3,
      'md:grid-cols-4': cols.md === 4,
    },
    {
      'lg:grid-cols-1': cols.lg === 1,
      'lg:grid-cols-2': cols.lg === 2,
      'lg:grid-cols-3': cols.lg === 3,
      'lg:grid-cols-4': cols.lg === 4,
    },
    {
      'xl:grid-cols-1': cols.xl === 1,
      'xl:grid-cols-2': cols.xl === 2,
      'xl:grid-cols-3': cols.xl === 3,
      'xl:grid-cols-4': cols.xl === 4,
      'xl:grid-cols-5': cols.xl === 5,
      'xl:grid-cols-6': cols.xl === 6,
    },
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;