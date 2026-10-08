import React from "react";
import "./SkeletonCard.css";

export const SkeletonCard = () => {
  return (
    <article className="skeleton-card" aria-hidden="true">
      <div className="skeleton-img skeleton-shimmer"></div>
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-title skeleton-shimmer"></div>
        <div className="skeleton-line skeleton-subtitle skeleton-shimmer"></div>
        <div className="skeleton-line skeleton-desc-1 skeleton-shimmer"></div>
        <div className="skeleton-line skeleton-desc-2 skeleton-shimmer"></div>
        <div className="skeleton-footer">
          <div className="skeleton-line skeleton-price skeleton-shimmer"></div>
          <div className="skeleton-btn skeleton-shimmer"></div>
        </div>
      </div>
    </article>
  );
};

export const SkeletonGrid = ({ count = 3 }) => {
  return (
    <div className="skeleton-grid">
      <div className="skeleton-status-banner">
        <div className="skeleton-spinner"></div>
        <span>Loading hotel listings from cloud database...</span>
      </div>
      <div className="cards">
        {Array.from({ length: count }, (_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      </div>
    </div>
  );
};

export default SkeletonCard;
