import React from 'react';
import PropTypes from 'prop-types';
import './Badge.css'; // Assuming you have some CSS for the Badge styling

const Badge = ({ label, variant }) => {
    const variantClass = variant ? `badge-${variant}` : '';

    return <span className={`badge ${variantClass}`}>{label}</span>;
};

Badge.propTypes = {
    label: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
};

Badge.defaultProps = {
    variant: 'info',
};

export default Badge;