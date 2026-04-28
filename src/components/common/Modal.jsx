import React from 'react';
import ReactModal from 'react-modal';

// تعيين الـ root element للـ modal
ReactModal.setAppElement('#root');

const Modal = ({
  isOpen,
  onRequestClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={`relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-6 mx-4 max-h-[80vh] overflow-y-auto ${sizeClasses[size]}`}
      overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      closeTimeoutMS={200}
    >
      {(title || showCloseButton) && (
        <div className="flex items-center justify-between mb-5">
          {title && <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>}
          {showCloseButton && (
            <button
              onClick={onRequestClose}
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
      {children}
    </ReactModal>
  );
};

export default Modal;