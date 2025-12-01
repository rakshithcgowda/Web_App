import { useEffect, useState } from 'react';
import { CheckCircleIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

interface SuccessPopupProps {
  isVisible: boolean;
  generationTimeMs: number;
  onClose: () => void;
}

export function SuccessPopup({ isVisible, generationTimeMs, onClose }: SuccessPopupProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsLeaving(false);
      // Auto-close after 10 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      // For times over 1 minute, show minutes and seconds
      if (seconds < 1) {
        return `${minutes}m`;
      } else {
        return `${minutes}m ${Math.round(seconds)}s`;
      }
    } else {
      // For times under 1 minute, show seconds with decimal precision
      if (totalSeconds < 1) {
        return `${Math.max(0.1, totalSeconds).toFixed(1)}s`;
      } else {
        return `${totalSeconds.toFixed(1)}s`;
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isLeaving ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-8 max-w-md w-full mx-4 transform transition-all duration-300 ${
          isLeaving 
            ? 'scale-95 opacity-0 translate-y-4' 
            : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close popup"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 mb-6">
            <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Great! You have completed the document creation
          </h3>

          {/* Time Display */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200/50">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <ClockIcon className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-blue-900">Generation Time</span>
            </div>
            <div className="text-3xl font-bold text-blue-700">
              {formatTime(generationTimeMs)}
            </div>
            <p className="text-sm text-blue-600 mt-2">
              Your document has been generated and downloaded successfully
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>✓ Document format: DOCX</p>
            <p>✓ All sections completed</p>
            <p>✓ Ready for use</p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
