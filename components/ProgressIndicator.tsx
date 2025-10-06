"use client";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
  className?: string;
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  steps = [],
  className = "" 
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
          />
        </div>
        
        {/* Step indicators */}
        {steps.length > 0 && (
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    index < currentStep
                      ? "bg-green-500 text-white"
                      : index === currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-400 text-center">
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Progress Text */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
} 