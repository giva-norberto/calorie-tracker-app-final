import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'default' 
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300',
    outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
  };

  return (
    <div className={`rounded-2xl ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`p-6 pt-4 border-t border-gray-100 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardContent, CardFooter };