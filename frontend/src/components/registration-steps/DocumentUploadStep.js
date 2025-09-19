import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, FileCheck, AlertCircle, ChevronLeft, ChevronRight, Camera, X } from 'lucide-react';

const DocumentUploadStep = ({ data, updateData, onNext, onPrev }) => {
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRefs = useRef({});

  const requiredDocuments = [
    {
      key: 'cnh',
      title: 'CNH Válida',
      description: 'Frente e verso da Carteira Nacional de Habilitação',
      required: true,
      icon: '🚗'
    },
    {
      key: 'residenceProof',
      title: 'Comprovante de Residência',
      description: 'Conta de luz, água ou telefone (últimos 3 meses)',
      required: true,
      icon: '🏠'
    },
    {
      key: 'photo',
      title: 'Foto 3x4 ou Selfie com Documento',
      description: 'Para validação facial (opcional mas recomendado)',
      required: false,
      icon: '📷'
    }
  ];

  const conditionalDocuments = [
    {
      key: 'crlv',
      title: 'CRLV do Veículo',
      description: 'Certificado de Registro e Licenciamento de Veículo',
      condition: () => data.isAutonomous,
      required: false,
      icon: '📋'
    },
    {
      key: 'taxiLicense',
      title: 'Alvará ou Licença do Táxi',
      description: 'Documento oficial de licença para operar táxi',
      condition: () => data.isAutonomous && data.taxiLicense,
      required: false,
      icon: '🚖'
    },
    {
      key: 'cooperativeProof',
      title: 'Comprovante de Vínculo',
      description: 'Documento que comprove vínculo com cooperativa/sindicato',
      condition: () => !data.isAutonomous,
      required: true,
      icon: '🏢'
    }
  ];

  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Formato não permitido. Use PDF, JPG ou PNG.';
    }

    if (file.size > maxSize) {
      return 'Arquivo muito grande. Máximo 5MB.';
    }

    return null;
  };

  const handleFileUpload = async (documentKey, file) => {
    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, [documentKey]: error }));
      return;
    }

    // Clear previous error
    setErrors(prev => ({ ...prev, [documentKey]: '' }));

    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [documentKey]: 0 }));

    try {
      // Create file info object
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        file: file // In real app, this would be a URL after upload
      };

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        setUploadProgress(prev => ({ ...prev, [documentKey]: progress }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Update document in data
      updateData({
        documents: {
          ...data.documents,
          [documentKey]: fileInfo
        }
      });

      setUploadProgress(prev => ({ ...prev, [documentKey]: 100 }));
      
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [documentKey]: undefined }));
      }, 1000);

    } catch (error) {
      setErrors(prev => ({ ...prev, [documentKey]: 'Erro no upload. Tente novamente.' }));
      setUploadProgress(prev => ({ ...prev, [documentKey]: undefined }));
    }
  };

  const removeDocument = (documentKey) => {
    updateData({
      documents: {
        ...data.documents,
        [documentKey]: null
      }
    });
  };

  const validateStep = () => {
    const newErrors = {};
    let hasRequiredDocs = true;

    // Check required documents
    requiredDocuments.forEach(doc => {
      if (doc.required && !data.documents[doc.key]) {
        newErrors[doc.key] = 'Este documento é obrigatório';
        hasRequiredDocs = false;
      }
    });

    // Check conditional required documents
    conditionalDocuments.forEach(doc => {
      if (doc.condition && doc.condition() && doc.required && !data.documents[doc.key]) {
        newErrors[doc.key] = 'Este documento é obrigatório para seu perfil';
        hasRequiredDocs = false;
      }
    });

    setErrors(newErrors);
    return hasRequiredDocs;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const renderDocumentUpload = (doc) => {
    const hasFile = data.documents[doc.key];
    const isUploading = uploadProgress[doc.key] !== undefined;
    const progress = uploadProgress[doc.key] || 0;

    return (
      <div key={doc.key} className="border rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{doc.icon}</span>
              <h4 className="font-semibold text-gray-900">
                {doc.title}
                {doc.required && <span className="text-red-500 ml-1">*</span>}
              </h4>
            </div>
            <p className="text-sm text-gray-600">{doc.description}</p>
          </div>
        </div>

        {!hasFile && !isUploading && (
          <div>
            <input
              ref={el => fileInputRefs.current[doc.key] = el}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleFileUpload(doc.key, file);
                }
              }}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRefs.current[doc.key]?.click()}
              variant="outline"
              className="w-full flex items-center gap-2 h-12"
            >
              <Upload className="h-5 w-5" />
              Escolher Arquivo
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
            </p>
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Enviando... {progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {hasFile && !isUploading && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {hasFile.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {(hasFile.size / 1024 / 1024).toFixed(2)} MB • Enviado
                  </p>
                </div>
              </div>
              <Button
                onClick={() => removeDocument(doc.key)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {errors[doc.key] && (
          <div className="mt-2 flex items-center gap-1 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{errors[doc.key]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6 text-blue-600" />
          Upload de Documentos
        </CardTitle>
        <CardDescription>
          Envie os documentos obrigatórios em formato digital. Certifique-se de que estejam legíveis e dentro da validade.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Documentos Obrigatórios */}
        <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📄 Documentos Obrigatórios
          </h4>
          <div className="space-y-4">
            {requiredDocuments.map(renderDocumentUpload)}
          </div>
        </div>

        {/* Documentos Condicionais */}
        {conditionalDocuments.filter(doc => doc.condition()).length > 0 && (
          <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📋 Documentos Específicos
            </h4>
            <div className="space-y-4">
              {conditionalDocuments
                .filter(doc => doc.condition())
                .map(renderDocumentUpload)}
            </div>
          </div>
        )}

        {/* Informações Importantes */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Instruções Importantes
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Todos os documentos devem estar legíveis e dentro da validade</li>
            <li>• Formatos aceitos: PDF, JPG, JPEG, PNG</li>
            <li>• Tamanho máximo por arquivo: 5MB</li>
            <li>• CNH deve incluir frente e verso (pode ser em arquivos separados)</li>
            <li>• Após o pagamento, seus documentos serão validados automaticamente por IA</li>
            <li>• Em caso de problemas na validação, nossa equipe entrará em contato</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button 
            onClick={onPrev}
            variant="outline"
            className="px-6 py-3 text-lg"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>
          
          <Button 
            onClick={handleNext}
            className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
          >
            Próxima Etapa
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadStep;