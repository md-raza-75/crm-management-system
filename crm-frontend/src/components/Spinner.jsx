import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'h-5 w-5 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
        xl: 'h-16 w-16 border-4'
    };

    const selectedSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div className={`animate-spin rounded-full border-t-indigo-600 border-b-transparent border-l-indigo-600/30 border-r-transparent ${selectedSize}`}></div>
        </div>
    );
}
