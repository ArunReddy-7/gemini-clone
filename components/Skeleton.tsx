export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-300 dark:bg-gray-700 animate-pulse rounded ${className}`} />
);
