import './Loading.css'; 

//  Se usa mientras espera la respuesta del backend
const LoadingSpinner = () => {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
        </div>
    );
};

// Reemplaza las cards mientras espera la API
type SkeletonLoaderProps = {
    width?: string;
    height?: string;
};

const SkeletonLoader = ({ width = '100%', height = '20px' }: SkeletonLoaderProps) => {
    return (
        <div className="skeleton-loader" style={{ width, height }}></div>
    );
};

export { LoadingSpinner, SkeletonLoader };