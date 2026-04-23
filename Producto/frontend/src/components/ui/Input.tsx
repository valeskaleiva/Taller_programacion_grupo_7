import React from 'react';

interface InputProps {
    type?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isValid: boolean;
    errorMessage?: string;
    placeholder?: string;
    label?: string;
}

const Input: React.FC<InputProps> = ({ type = 'text', value, onChange, isValid, errorMessage, placeholder, label }) => {
    return (
        <div className="input-container">
            {label && <label>{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                className={`input ${!isValid ? 'input-error' : ''}`}
                placeholder={placeholder}
            />
            {!isValid && errorMessage && <span className="error-message">{errorMessage}</span>}
        </div>
    );
};

export default Input;