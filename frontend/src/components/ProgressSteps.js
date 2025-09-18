import React from 'react';
import { CheckCircle, Circle, CreditCard, UserPlus } from 'lucide-react';

const ProgressSteps = ({ currentStep }) => {
  const steps = [
    {
      id: 'registration',
      title: 'Cadastro',
      description: 'Seus dados',
      icon: UserPlus
    },
    {
      id: 'payment',
      title: 'Pagamento',
      description: 'PIX CNPJ',
      icon: CreditCard
    }
  ];

  const getStepStatus = (stepId) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step circle */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                ${status === 'completed' ? 'bg-green-600 text-white' : ''}
                ${status === 'active' ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
                ${status === 'upcoming' ? 'bg-gray-200 text-gray-400' : ''}
              `}>
                {status === 'completed' ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>
              
              {/* Step info */}
              <div className="text-center">
                <p className={`
                  font-semibold text-sm
                  ${status === 'active' ? 'text-blue-600' : ''}
                  ${status === 'completed' ? 'text-green-600' : ''}
                  ${status === 'upcoming' ? 'text-gray-400' : ''}
                `}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`
                  absolute top-6 w-full h-0.5 -z-10 transition-all duration-300
                  ${status === 'completed' ? 'bg-green-600' : 'bg-gray-200'}
                `} 
                style={{ 
                  left: '50%', 
                  width: `calc(100% / ${steps.length} - 48px)`,
                  transform: 'translateX(24px)'
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;