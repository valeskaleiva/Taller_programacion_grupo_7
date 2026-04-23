import React from 'react';

interface ButtonProps {
    variant: 'primary' | 'secondary' | 'danger' | 'success';
    children: React.ReactNode;
    onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ variant, children, onClick }) => {
    const baseStyle = 'py-2 px-4 font-semibold rounded-lg shadow-md text-white ';  
    let variantStyle = '';

    switch(variant) {
        case 'primary':
            variantStyle = 'bg-blue-500 hover:bg-blue-700';
            break;
        case 'secondary':
            variantStyle = 'bg-gray-500 hover:bg-gray-700';
            break;
        case 'danger':
            variantStyle = 'bg-red-500 hover:bg-red-700';
            break;
        case 'success':
            variantStyle = 'bg-green-500 hover:bg-green-700';
            break;
        default:
            variantStyle = '';
    }

    return (
        <button className={`${baseStyle} ${variantStyle}`} onClick={onClick}>
            {children}
        </button>
    );
};

export default Button;