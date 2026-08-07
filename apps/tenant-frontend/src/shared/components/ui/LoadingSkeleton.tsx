// ============================================
// FILE: frontend/src/shared/components/ui/LoadingSkeleton.tsx
// Modern loading skeleton component
// ============================================
import clsx from 'clsx';

interface LoadingSkeletonProps {
  type?: 'text' | 'avatar' | 'image' | 'card' | 'table';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export const LoadingSkeleton = ({
  type = 'text',
  width,
  height,
  className,
  count = 1,
}: LoadingSkeletonProps) => {
  const baseClasses = 'animate-pulse bg-slate-200 rounded';

  const typeClasses = {
    text: 'h-4 rounded',
    avatar: 'rounded-full',
    image: 'rounded',
    card: 'rounded-xl',
    table: 'h-4 rounded',
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={clsx(
        baseClasses,
        typeClasses[type],
        className,
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  ));

  return <>{skeletons}</>;
};

// Predefined skeleton components for common use cases
export const TextSkeleton = ({ count = 1, className }: { count?: number; className?: string }) => (
  <LoadingSkeleton type="text" count={count} className={className} />
);

export const AvatarSkeleton = ({ size = 40, className }: { size?: number; className?: string }) => (
  <LoadingSkeleton type="avatar" width={size} height={size} className={className} />
);

export const CardSkeleton = ({ count = 1, className }: { count?: number; className?: string }) => (
  <LoadingSkeleton type="card" count={count} className={className} />
);

export const TableSkeleton = ({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) => (
  <div className={clsx('space-y-3', className)}>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4">
        {Array.from({ length: cols }, (_, j) => (
          <div key={j} className="h-10 bg-slate-200 rounded animate-pulse" />
        ))}
      </div>
    ))}
  </div>
);