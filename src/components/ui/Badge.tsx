import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;