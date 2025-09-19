import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CheckCircle, Clock, AlertCircle, Eye, RefreshCw, FileCheck, Bot, Zap } from 'lucide-react';

const DocumentValidationStep = ({ data, updateData, onComplete }) => {
  const [validationStatus, setValidationStatus] = useState('processing'); // processing, completed, failed, manual_review
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationResults, setValidationResults] = useState({});
  const [estimatedTime, setEstimatedTime] = useState(120); // 2 minutes in seconds

  useEffect(() => {
    simulateDocumentValidation();
  }, []);

  useEffect(() => {
    // Countdown timer for estimated time
    if (estimatedTime > 0 && validationStatus === 'processing') {
      const timer = setTimeout(() => {
        setEstimatedTime(estimatedTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [estimatedTime, validationStatus]);

  const simulateDocumentValidation = async () => {
    const documents = Object.keys(data.documents).filter(key => data.documents[key]);
    const totalDocuments = documents.length;
    
    if (totalDocuments === 0) {
      setValidationStatus('failed');
      return;
    }

    // Simulate validation progress
    for (let i = 0; i <= totalDocuments; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const progress = (i / totalDocuments) * 100;
      setValidationProgress(progress);
      
      if (i < totalDocuments) {
        const docKey = documents[i];
        const validationResult = simulateDocumentAnalysis(docKey);
        
        setValidationResults(prev => ({
          ...prev,
          [docKey]: validationResult
        }));
      }
    }

    // Final validation result
    const allResults = Object.values(validationResults);
    const hasFailures = allResults.some(result => result.status === 'rejected');
    const hasWarnings = allResults.some(result => result.status === 'warning');

    if (hasFailures) {
      setValidationStatus('failed');
    } else if (hasWarnings) {
      setValidationStatus('manual_review');
    } else {
      setValidationStatus('completed');
      updateData({ 
        documentValidationStatus: 'approved',
        courseAccessGranted: true,
        validationCompletedAt: new Date().toISOString()
      });
    }
  };

  const simulateDocumentAnalysis = (docKey) => {
    const scenarios = {
      cnh: {
        approved: {
          status: 'approved',
          confidence: 0.95,
          analysis: 'CNH válida identificada. Número, categoria e validade confirmados.',
          details: ['Documento legível', 'Dentro da validade', 'Categoria B confirmada']
        },
        warning: {
          status: 'warning',
          confidence: 0.78,
          analysis: 'CNH identificada mas com baixa qualidade da imagem.',
          details: ['Documento parcialmente legível', 'Recomenda-se nova foto']
        }
      },
      residenceProof: {
        approved: {
          status: 'approved',
          confidence: 0.92,
          analysis: 'Comprovante de residência válido. Endereço corresponde aos dados informados.',
          details: ['Documento legível', 'Data recente', 'Endereço confirmado']
        },
        warning: {
          status: 'warning',
          confidence: 0.71,
          analysis: 'Comprovante identificado mas data superior a 3 meses.',
          details: ['Documento legível', 'Data pode estar desatualizada']
        }
      },
      photo: {
        approved: {
          status: 'approved',
          confidence: 0.89,
          analysis: 'Foto identificada e compatível com documento.',
          details: ['Rosto claramente visível', 'Boa qualidade da imagem']
        }
      }
    };

    const docScenarios = scenarios[docKey] || scenarios.residenceProof;
    const scenarioKeys = Object.keys(docScenarios);
    const randomScenario = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)];
    
    return docScenarios[randomScenario];
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-600">✅ Aprovado</Badge>;
      case 'warning': return <Badge className="bg-yellow-600">⚠️ Revisão</Badge>;
      case 'rejected': return <Badge className="bg-red-600">❌ Rejeitado</Badge>;
      default: return <Badge variant="outline">⏳ Processando</Badge>;
    }
  };

  const documentNames = {
    cnh: 'CNH (Carteira Nacional de Habilitação)',
    residenceProof: 'Comprovante de Residência',
    photo: 'Foto/Selfie com Documento',
    crlv: 'CRLV do Veículo',
    taxiLicense: 'Alvará do Táxi',
    cooperativeProof: 'Comprovante de Vínculo'
  };

  if (validationStatus === 'completed') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-800 mb-2">
              🎉 Documentos Aprovados!
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              Validação IA concluída com sucesso
            </p>
            <Badge className="bg-green-600 text-lg px-4 py-2">
              ✅ Acesso ao Curso Liberado
            </Badge>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
            <h4 className="text-lg font-semibold text-green-800 mb-4">
              📊 Resultado da Validação
            </h4>
            <div className="space-y-3">
              {Object.entries(validationResults).map(([docKey, result]) => (
                <div key={docKey} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="font-medium">{documentNames[docKey]}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="text-sm text-green-700">
                      {(result.confidence * 100).toFixed(0)}% confiança
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              🚀 Acesso ao Curso EAD
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p><strong>Status:</strong> Aprovado</p>
                <p><strong>Curso:</strong> EAD Taxista ES - Completo</p>
              </div>
              <div>
                <p><strong>Carga Horária:</strong> 28 horas</p>
                <p><strong>Prazo:</strong> 60 dias para conclusão</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={onComplete}
              className="px-8 py-4 text-xl bg-green-600 hover:bg-green-700"
              size="lg"
            >
              🎓 Acessar Curso Agora
            </Button>
            
            <p className="text-sm text-gray-600">
              Você também receberá um email com as instruções de acesso
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-600" />
          Validação IA dos Documentos
        </CardTitle>
        <CardDescription>
          Nossa inteligência artificial está analisando seus documentos automaticamente.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Geral */}
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Análise em Andamento
            </h4>
            {validationStatus === 'processing' && (
              <div className="text-blue-800 font-mono text-lg">
                ⏱️ {formatTime(estimatedTime)}
              </div>
            )}
          </div>
          
          <Progress value={validationProgress} className="h-3 mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">{validationProgress.toFixed(0)}%</div>
              <div className="text-blue-600">Progresso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">{Object.keys(validationResults).length}</div>
              <div className="text-blue-600">Docs Analisados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">IA</div>
              <div className="text-blue-600">Tecnologia</div>
            </div>
          </div>
        </div>

        {/* Resultados por Documento */}
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📄 Análise Detalhada dos Documentos
          </h4>
          
          <div className="space-y-4">
            {Object.keys(data.documents)
              .filter(key => data.documents[key])
              .map(docKey => {
                const result = validationResults[docKey];
                const isProcessed = !!result;
                
                return (
                  <div key={docKey} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{documentNames[docKey]}</span>
                      </div>
                      {isProcessed ? getStatusBadge(result.status) : (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">Analisando...</span>
                        </div>
                      )}
                    </div>
                    
                    {isProcessed && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Confiança:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                result.confidence >= 0.8 ? 'bg-green-500' :
                                result.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${result.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-mono">
                            {(result.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700">{result.analysis}</p>
                        
                        {result.details && (
                          <ul className="text-xs text-gray-600 space-y-1">
                            {result.details.map((detail, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Informações sobre IA */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
            🤖 Sobre a Validação por IA
          </h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Nossa IA analisa automaticamente a autenticidade e qualidade dos documentos</li>
            <li>• Verificamos dados como validade, legibilidade e conformidade</li>
            <li>• O processo é rápido, seguro e preciso (95%+ de acurácia)</li>
            <li>• Em casos duvidosos, documentos passam por revisão humana</li>
            <li>• Seus documentos são protegidos e não armazenados após a validação</li>
          </ul>
        </div>

        {/* Botão de Refresh */}
        {validationStatus === 'processing' && (
          <div className="text-center">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="px-6 py-3"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Status
            </Button>
          </div>
        )}

        {/* Suporte */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <p>
            A validação está demorando mais que o esperado? 
            <a href="mailto:suporte@sindtaxi-es.org" className="text-blue-600 hover:underline ml-1">
              Entre em contato
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentValidationStep;