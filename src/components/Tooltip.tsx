import { useState, useRef, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function Tooltip({ content, position = 'top', children, showIcon = true }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.top - tooltipRect.height - 8;
          break;
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          y = triggerRect.bottom + 8;
          break;
        case 'left':
          x = triggerRect.left - tooltipRect.width - 8;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
        case 'right':
          x = triggerRect.right + 8;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
      }

      setTooltipPosition({ x, y });
    }
  }, [isVisible, position]);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children || (
          showIcon && (
            <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors duration-200" />
          )
        )}
      </div>
      
      {isVisible && (
        <>
          <div
            ref={tooltipRef}
            className="tooltip-fixed px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg opacity-0 animate-fade-in"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
          >
            {content}
            <div
              className={`
                absolute w-2 h-2 bg-gray-900 transform rotate-45
                ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
              `}
            />
          </div>
        </>
      )}
    </div>
  );
}
