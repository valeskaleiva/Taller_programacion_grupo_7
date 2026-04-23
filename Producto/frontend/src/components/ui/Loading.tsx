import React from 'react';
import './Loading.css'; // Import your CSS for styling

// Loading Spinner Component
const LoadingSpinner = () => {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
        </div>
    );
};

// Skeleton Loader Component
const SkeletonLoader = ({ width = '100%', height = '20px' }) => {
    return (
        <div className="skeleton-loader" style={{ width, height }}></div>
    );
};

export { LoadingSpinner, SkeletonLoader };