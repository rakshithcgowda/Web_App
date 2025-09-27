import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BQCForm } from '@/components/BQCForm';
import { ArrowRightOnRectangleIcon, UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const handleProductTour = () => {
    // Simple product tour implementation
    const tourSteps = [
      { element: 'nav', message: 'Welcome to BQC Generator! This is your navigation bar.' },
      { element: '.card', message: 'Fill out the BQC form sections step by step.' },
      { element: 'button[type="submit"]', message: 'Generate your BQC document when ready.' }
    ];
    
    let currentStep = 0;
    
    const showStep = () => {
      if (currentStep < tourSteps.length) {
        const step = tourSteps[currentStep];
        const element = document.querySelector(step.element);
        
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Create a simple tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'fixed z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg max-w-xs';
          tooltip.innerHTML = `
            <p class="text-sm mb-2">${step.message}</p>
            <div class="flex justify-between items-center">
              <span class="text-xs opacity-75">Step ${currentStep + 1} of ${tourSteps.length}</span>
              <button class="bg-white text-blue-600 px-2 py-1 rounded text-xs font-medium" onclick="this.parentElement.parentElement.remove(); window.nextTourStep()">
                ${currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          `;
          
          const rect = element.getBoundingClientRect();
          tooltip.style.top = `${rect.bottom + 10}px`;
          tooltip.style.left = `${Math.max(10, rect.left)}px`;
          
          document.body.appendChild(tooltip);
          
          // Add highlight effect
          element.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50');
          
          // Clean up previous highlights
          document.querySelectorAll('.ring-4').forEach(el => {
            if (el !== element) {
              el.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50');
            }
          });
        }
        
        currentStep++;
      }
    };
    
    // Make nextTourStep globally available
    (window as any).nextTourStep = () => {
      // Clean up current highlight
      document.querySelectorAll('.ring-4').forEach(el => {
        el.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50');
      });
      
      if (currentStep < tourSteps.length) {
        setTimeout(showStep, 300);
      } else {
        delete (window as any).nextTourStep;
      }
    };
    
    showStep();
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Top Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold gradient-text">BQC Generator</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Welcome back!</p>
                  <p className="text-gray-600">{user?.fullName || user?.username}</p>
                </div>
              </div>
              
              <button
                onClick={handleProductTour}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200"
                title="Take a product tour to learn about the application"
              >
                <AcademicCapIcon className="h-4 w-4" />
                <span>Product Tour</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <BQCForm />
    </div>
  );
}
