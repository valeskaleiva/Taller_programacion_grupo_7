import './Badge.css'; // Assuming you have some CSS for the Badge styling

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