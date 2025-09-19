import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  User, 
  Home, 
  Phone, 
  Briefcase, 
  Upload, 
  FileCheck, 
  CreditCard,
  CheckCircle,
  Camera,
  MapPin,
  Calendar,
  IdCard,
  Car,
  Shield,
  AlertCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import PersonalDataStep from './registration-steps/PersonalDataStep';
import AddressContactStep from './registration-steps/AddressContactStep';
import ProfessionalDataStep from './registration-steps/ProfessionalDataStep';
import DocumentUploadStep from './registration-steps/DocumentUploadStep';
import TermsConfirmationStep from './registration-steps/TermsConfirmationStep';
import PaymentStep from './registration-steps/PaymentStep';
import DocumentValidationStep from './registration-steps/DocumentValidationStep';

const MultiStepRegistration = ({ onRegistrationComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState({
    // Dados Pessoais
    fullName: '',
    cpf: '',
    rg: '',
    birthDate: '',
    nationality: 'Brasileira',
    gender: '',
    maritalStatus: '',
    
    // Endereço
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'ES',
    zipCode: '',
    residenceProof: null,
    
    // Contato
    email: '',
    cellPhone: '',
    landlinePhone: '',
    
    // Dados Profissionais
    cnhNumber: '',
    cnhCategory: '',
    cnhExpiry: '',
    taxiLicense: '',
    cooperativeName: '',
    workingCity: '',
    isAutonomous: true,
    
    // Documentos
    documents: {
      cnh: null,
      residenceProof: null,
      photo: null,
      crlv: null,
      taxiLicense: null,
      cooperativeProof: null
    },
    
    // Termos
    termsAccepted: false,
    lgpdAccepted: false,
    truthfulnessDeclaration: false,
    
    // Informações Adicionais
    accessibility: '',
    renavam: '',
    education: '',
    professionTime: '',
    previousCourses: '',
    
    // Controle
    registrationId: null,
    paymentStatus: 'pending',
    documentValidationStatus: 'pending'
  });

  const steps = [
    {
      id: 1,
      title: 'Dados Pessoais',
      description: 'Informações básicas do candidato',
      icon: User,
      component: PersonalDataStep
    },
    {
      id: 2,
      title: 'Endereço e Contato',
      description: 'Endereço residencial e informações de contato',
      icon: Home,
      component: AddressContactStep
    },
    {
      id: 3,
      title: 'Dados Profissionais',
      description: 'CNH, alvará e informações profissionais',
      icon: Briefcase,
      component: ProfessionalDataStep
    },
    {
      id: 4,
      title: 'Upload de Documentos',
      description: 'Envio dos documentos obrigatórios',
      icon: Upload,
      component: DocumentUploadStep
    },
    {
      id: 5,
      title: 'Termos e Confirmação',
      description: 'Aceite dos termos e política de privacidade',
      icon: FileCheck,
      component: TermsConfirmationStep
    },
    {
      id: 6,
      title: 'Pagamento',
      description: 'Finalização do pagamento do curso',
      icon: CreditCard,
      component: PaymentStep
    },
    {
      id: 7,
      title: 'Validação IA',
      description: 'Aguardar validação automática dos documentos',
      icon: CheckCircle,
      component: DocumentValidationStep
    }
  ];

  const updateRegistrationData = (newData) => {
    setRegistrationData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
    }
  };

  const getCurrentStepComponent = () => {
    const currentStepData = steps.find(step => step.id === currentStep);
    const StepComponent = currentStepData.component;
    
    return (
      <StepComponent
        data={registrationData}
        updateData={updateRegistrationData}
        onNext={nextStep}
        onPrev={prevStep}
        goToStep={goToStep}
        onComplete={onRegistrationComplete}
      />
    );
  };

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚖 Faça Seu Cadastro - EAD Taxista ES
          </h1>
          <p className="text-lg text-gray-600">
            Complete seu cadastro em {steps.length} etapas simples
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Etapa {currentStep} de {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}% concluído
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {steps.map((step) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;
              
              return (
                <button
                  key={step.id}
                  onClick={() => step.id <= currentStep && goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-300 min-w-[100px] ${
                    status === 'completed'
                      ? 'border-green-500 bg-green-50 text-green-700 cursor-pointer hover:bg-green-100'
                      : status === 'current'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-pointer'
                      : 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    status === 'completed'
                      ? 'bg-green-500 text-white'
                      : status === 'current'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          {getCurrentStepComponent()}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Dúvidas? Entre em contato: 
            <a href="mailto:suporte@sindtaxi-es.org" className="text-blue-600 hover:underline ml-1">
              suporte@sindtaxi-es.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiStepRegistration;