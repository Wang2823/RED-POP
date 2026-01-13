
import React from 'react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
  onStepClick: (step: AppStep) => void;
}

const steps = Object.values(AppStep);

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full overflow-x-auto pb-4 mb-8">
      <div className="flex items-center min-w-max px-4">
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isPast = steps.indexOf(currentStep) > index;
          
          return (
            <React.Fragment key={step}>
              <button
                onClick={() => onStepClick(step)}
                className={`flex flex-col items-center group transition-all duration-300 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    isActive
                      ? 'bg-[#ED3C38] border-[#ED3C38] text-white shadow-lg'
                      : isPast
                      ? 'bg-[#6AB2FF] border-[#6AB2FF] text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`mt-2 text-xs whitespace-nowrap font-medium ${
                    isActive ? 'text-[#ED3C38]' : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-12 mx-2 mb-6 ${
                    isPast ? 'bg-[#6AB2FF]' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
