'use client';

import React from 'react';

interface LoadMoreControlsProps {
  showLoadMore: boolean;
  showShowLess: boolean;
  handleLoadMore: () => void;
  handleShowLess: () => void;
  buttonContainerRef: React.RefObject<HTMLDivElement | null>;
}

const LoadMoreControls: React.FC<LoadMoreControlsProps> = ({
  showLoadMore,
  showShowLess,
  handleLoadMore,
  handleShowLess,
  buttonContainerRef,
}) => {
  return (
    <>
      {(showLoadMore || showShowLess) && (
        <div
          ref={buttonContainerRef}
          className="flex flex-row gap-4 items-center justify-center pt-10 pb-20"
        >
          {showLoadMore && (
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 bg-black cursor-pointer text-white rounded-full text-sm font-semibold hover:bg-black/80 transition-colors duration-200 focus:ring-2 focus:ring-primary"
              aria-label="Load more items"
            >
              Load More
            </button>
          )}
          {showShowLess && (
            <button
              onClick={handleShowLess}
              className="px-6 py-2 bg-black cursor-pointer text-white rounded-full text-sm font-semibold hover:bg-black/80 transition-colors duration-200 focus:ring-2 focus:ring-primary"
              aria-label="Show fewer items"
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default LoadMoreControls;