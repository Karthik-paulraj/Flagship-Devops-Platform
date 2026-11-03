import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, numReviews, size = 'sm' }) => {
  const stars = [1, 2, 3, 4, 5];
  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentSize = starSizes[size] || starSizes.sm;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {stars.map((star) => {
          const isFilled = rating >= star;
          const isHalf = !isFilled && rating >= star - 0.5;

          return (
            <span key={star} className="relative inline-block">
              <Star
                className={`${currentSize} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-200 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            </span>
          );
        })}
      </div>
      {numReviews !== undefined && (
        <span className="text-xs text-gray-500 font-medium">
          ({numReviews})
        </span>
      )}
    </div>
  );
};
