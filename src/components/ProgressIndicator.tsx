import { CheckIcon } from '@heroicons/react/24/solid';

interface ProgressStep {
  id: string;
  name: string;
  description: string;
  status: 'complete' | 'current' | 'upcoming';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                  ${
                    stepIdx < currentStep
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-emerald-500 text-white shadow-lg'
                      : stepIdx === currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-lg animate-pulse'
                      : 'border-gray-300 bg-white text-gray-500'
                  }
                `}
              >
                {stepIdx < currentStep ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{stepIdx + 1}</span>
                )}
              </div>
              <div className="ml-3 min-w-0">
                <p
                  className={`
                    text-sm font-semibold transition-colors duration-300
                    ${
                      stepIdx <= currentStep
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }
                  `}
                >
                  {step.name}
                </p>
                <p
                  className={`
                    text-xs transition-colors duration-300
                    ${
                      stepIdx <= currentStep
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {step.description}
                </p>
              </div>
            </div>
            {stepIdx < steps.length - 1 && (
              <div
                className={`
                  ml-6 h-0.5 w-16 transition-colors duration-300
                  ${
                    stepIdx < currentStep
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                      : 'bg-gray-200'
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
