interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'form' | 'table' | 'avatar' | 'button';
  lines?: number;
  height?: string;
  width?: string;
  className?: string;
}

export function LoadingSkeleton({ 
  variant = 'text', 
  lines = 1, 
  height, 
  width, 
  className = '' 
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded';

  const variants = {
    text: `h-4 ${width || 'w-full'} ${baseClasses}`,
    card: `h-48 ${width || 'w-full'} ${baseClasses} rounded-xl`,
    form: `h-11 ${width || 'w-full'} ${baseClasses} rounded-xl`,
    table: `h-8 ${width || 'w-full'} ${baseClasses} rounded-lg`,
    avatar: `h-10 w-10 ${baseClasses} rounded-full`,
    button: `h-11 ${width || 'w-32'} ${baseClasses} rounded-xl`,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${variants.text} ${index === lines - 1 ? 'w-3/4' : ''} shimmer`}
            style={{ 
              height: height,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${variants[variant]} ${className} shimmer`}
      style={{ 
        height: height,
        width: width,
      }}
    />
  );
}

// Specialized skeleton components
export function FormSkeleton() {
  return (
    <div className="card">
      <div className="card-header">
        <LoadingSkeleton variant="text" width="w-48" />
      </div>
      <div className="card-body space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <LoadingSkeleton variant="text" width="w-32" />
            <LoadingSkeleton variant="form" />
          </div>
        ))}
        <div className="flex space-x-4">
          <LoadingSkeleton variant="button" />
          <LoadingSkeleton variant="button" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card">
      <div className="card-header">
        <LoadingSkeleton variant="text" width="w-40" />
      </div>
      <div className="card-body">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex space-x-4">
              <LoadingSkeleton variant="table" width="w-1/4" />
              <LoadingSkeleton variant="table" width="w-1/3" />
              <LoadingSkeleton variant="table" width="w-1/4" />
              <LoadingSkeleton variant="table" width="w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <LoadingSkeleton variant="text" width="w-64" height="h-8" />
          <LoadingSkeleton variant="text" width="w-48" />
        </div>
        <LoadingSkeleton variant="button" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <LoadingSkeleton variant="text" width="w-24" />
                  <LoadingSkeleton variant="text" width="w-16" height="h-8" />
                </div>
                <LoadingSkeleton variant="avatar" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <FormSkeleton />
    </div>
  );
}

// Add the shimmer animation to global styles
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = shimmerStyles;
  document.head.appendChild(styleElement);
}
