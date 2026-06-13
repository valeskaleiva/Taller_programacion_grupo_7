import './Badge.css'; 

type BadgeVariant = 'success' | 'warning' | 'error' | 'info';

type BadgeProps = {
    label: string;
    variant?: BadgeVariant;
};

const Badge = ({ label, variant = 'info' }: BadgeProps) => {
    const variantClass = variant ? `badge-${variant}` : '';

    return <span className={`badge ${variantClass}`}>{label}</span>;
};

export default Badge;