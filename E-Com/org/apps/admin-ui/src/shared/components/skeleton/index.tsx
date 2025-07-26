import { cn } from "apps/admin-ui/src/utils/cn";
import * as React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-800", className)}
      {...props}
    />
  );
};

export { Skeleton };