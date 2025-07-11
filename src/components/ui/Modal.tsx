import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}

interface ModalBodyProps {
  children: React.ReactNode;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
          onClick={onClose}
        />
        <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all`}>
          {title && (
            <ModalHeader onClose={onClose} showCloseButton={showCloseButton}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            </ModalHeader>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalHeader: React.FC<ModalHeaderProps> = ({ 
  children, 
  onClose, 
  showCloseButton = true 
}) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
    {children}
    {showCloseButton && onClose && (
      <button
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

const ModalBody: React.FC<ModalBodyProps> = ({ children }) => (
  <div className="p-6">
    {children}
  </div>
);

const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => (
  <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
    {children}
  </div>
);

export { Modal, ModalHeader, ModalBody, ModalFooter };