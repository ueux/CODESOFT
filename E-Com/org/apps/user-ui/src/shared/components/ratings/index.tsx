import React from 'react';
import { EmptyStar, FullStar, HalfStar } from 'apps/user-ui/src/assets/svgs/starIcons';

type RatingsProps = {
  rating: number;
  className?: string;
  starSize?: string;
  showNumber?: boolean;
  precision?: number;
};

const Ratings: React.FC<RatingsProps> = ({
  rating = 0,
  className = '',
  starSize = 'w-5 h-5',
  showNumber = false,
  precision = 1,
}) => {
  const clampedRating = Math.min(Math.max(rating, 0), 5);
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <FullStar key={`full-${i}`} className={`${starSize} text-yellow-400`} />
      ))}

      {hasHalfStar && (
        <HalfStar key="half" className={`${starSize} text-yellow-400`} />
      )}

      {[...Array(emptyStars)].map((_, i) => (
        <EmptyStar key={`empty-${i}`} className={`${starSize} text-gray-300 dark:text-gray-500`} />
      ))}

      {showNumber && (
        <span className="ml-1 text-sm font-medium text-gray-600 dark:text-gray-400">
          {clampedRating.toFixed(precision)}
        </span>
      )}
    </div>
  );
};

export default Ratings;