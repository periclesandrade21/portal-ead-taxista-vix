import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ProgressSteps from "./ProgressSteps";
import { 
  CreditCard, 
  QrCode, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Copy,
  Smartphone,
  DollarSign,
  AlertCircle,
  Zap,
  Shield,
  ChevronDown
} from "lucide-react";

const PaymentFlow = ({ userSubscription, onPaymentSuccess, onBack }) => {
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, success, failed
  const [pixCode, setPixCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos

  // Gerar código PIX automaticamente com CNPJ
  useEffect(() => {
    // PIX CNPJ: 02.914.651/0001-12
    const simulatedPixCode = `00020126580014BR.GOV.BCB.PIX013602914651000112520400005303986540005802BR5909SINDTAXI6009VITORIA62070503***6304`;
    setPixCode(simulatedPixCode);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === "pending") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, paymentStatus]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      alert("✅ Código PIX copiado com sucesso!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = pixCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert("✅ Código PIX copiado!");
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus("success");
    setTimeout(() => {
      onPaymentSuccess();
    }, 3000);
  };

  // Simular verificação de pagamento (em produção seria via webhook)
  const checkPaymentStatus = () => {
    setPaymentStatus("processing");
    
    // Simular delay de processamento
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% de chance de sucesso para demo
      if (success) {
        handlePaymentSuccess();
      } else {
        setPaymentStatus("failed");
        setTimeout(() => setPaymentStatus("pending"), 4000);
      }
    }, 4000);
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl mx-auto text-center shadow-2xl border-0">
          <CardContent className="p-16">
            <div className="bg-green-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            
            <h2 className="text-4xl font-bold text-green-600 mb-4">🎉 Pagamento Confirmado!</h2>
            <p className="text-xl text-gray-600 mb-2">
              Parabéns <strong>{userSubscription?.name}</strong>!
            </p>
            <p className="text-lg text-gray-500 mb-8">
              Seu acesso ao EAD Taxista ES foi liberado com sucesso!
            </p>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl mb-8">
              <h3 className="font-bold text-green-800 mb-4 text-lg">✅ Tudo Pronto!</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-green-600 mb-2">✅</div>
                  <p className="font-semibold">Cadastro Confirmado</p>
                  <p className="text-gray-600">Seus dados foram salvos</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-green-600 mb-2">💰</div>
                  <p className="font-semibold">Pagamento Aprovado</p>
                  <p className="text-gray-600">PIX processado com sucesso</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-blue-600 mb-2">🎓</div>
                  <p className="font-semibold">Cursos Liberados</p>
                  <p className="text-gray-600">Acesso completo disponível</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-blue-600 mb-2">📧</div>
                  <p className="font-semibold">Email de Confirmação</p>
                  <p className="text-gray-600">Enviado para seu email</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={onPaymentSuccess}
                className="w-full py-6 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🚀 Acessar Meus Cursos Agora
              </Button>
              
              <p className="text-sm text-gray-500">
                Você será redirecionado para o portal do aluno
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-4 pt-8">
        
        {/* Progress Steps */}
        <ProgressSteps currentStep="payment" />
        
        {/* Header com informações importantes */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💳 Finalizar Pagamento</h1>
          <p className="text-xl text-gray-600 mb-4">
            Complete seu pagamento via PIX de forma segura e rápida
          </p>
          
          {timeLeft > 0 && paymentStatus === "pending" && (
            <div className="inline-flex items-center bg-orange-100 text-orange-800 px-6 py-3 rounded-full text-lg font-semibold">
              <Clock className="h-5 w-5 mr-2" />
              <span>⏰ Expira em: {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Resumo do Pedido - Sem valores */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                <CardTitle className="flex items-center text-lg">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Resumo do Cadastro
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="py-3 border-b">
                    <span className="font-bold text-lg text-center block">Curso EAD Taxista ES</span>
                    <p className="text-sm text-gray-600 text-center mt-2">
                      Valores serão informados após aprovação da API de pagamento
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-center">👤 Seus Dados</h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nome:</span>
                        <span className="font-medium">{userSubscription?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-xs">{userSubscription?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Placa:</span>
                        <span className="font-medium">{userSubscription?.car_plate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Alvará:</span>
                        <span className="font-medium">{userSubscription?.license_number}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">PIX via CNPJ</p>
                      <p className="text-sm text-gray-600">02.914.651/0001-12</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pagamento PIX Direto - Área principal */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <CardTitle className="flex items-center text-xl">
                  <QrCode className="h-6 w-6 mr-3" />
                  💳 Finalizar Pagamento via PIX
                </CardTitle>
                <CardDescription className="text-green-100">
                  ⚡ Aprovação instantânea - Comece seus estudos agora mesmo!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                
                {/* Benefícios do PIX */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-green-800">Instantâneo</p>
                    <p className="text-xs text-green-600">Aprovação imediata</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-blue-800">Seguro</p>
                    <p className="text-xs text-blue-600">100% protegido</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-purple-800">Sem Taxa</p>
                    <p className="text-xs text-purple-600">Gratuito e rápido</p>
                  </div>
                </div>

                {/* PIX Payment - Status do Pagamento */}
                {paymentStatus === "pending" && (
                  <div className="space-y-6">
                    
                    {/* Botão Principal - Asaas */}
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl text-center border-2 border-green-300">
                      <div className="bg-white p-6 rounded-xl shadow-lg inline-block mb-6">
                        <div className="flex items-center justify-center space-x-4 mb-4">
                          <QrCode className="h-16 w-16 text-green-600" />
                          <div className="text-4xl">🔒</div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          🚀 Pagamento Seguro via PIX
                        </h3>
                        <p className="text-gray-600">Processado pela plataforma Asaas</p>
                      </div>
                      
                      {/* Botão Principal do Asaas */}
                      <div className="mb-6">
                        <button
                          onClick={() => window.open('https://www.asaas.com/c/vyric6wrm1ufvo3c', '_blank')}
                          className="w-full py-6 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="flex items-center justify-center space-x-3">
                            <QrCode className="h-6 w-6" />
                            <span>💳 Ir para Pagamento PIX Seguro</span>
                            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                              Asaas
                            </div>
                          </div>
                        </button>
                        <p className="text-sm text-gray-600 mt-3">
                          ✅ Seguro • ⚡ Instantâneo • 🔒 Criptografado
                        </p>
                      </div>
                      
                      {/* Instruções de Segurança */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
                        <h4 className="font-bold mb-4 text-gray-800 flex items-center justify-center">
                          <Shield className="h-5 w-5 mr-2 text-green-600" />
                          Como funciona o pagamento seguro:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="font-bold text-green-600">1</span>
                            </div>
                            <p className="font-semibold">Clique no botão acima</p>
                            <p className="text-gray-600">Será redirecionado para página segura</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="font-bold text-blue-600">2</span>
                            </div>
                            <p className="font-semibold">Faça o PIX</p>
                            <p className="text-gray-600">QR Code ou chave PIX</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="font-bold text-purple-600">3</span>
                            </div>
                            <p className="font-semibold">Acesso Liberado</p>
                            <p className="text-gray-600">Automático em poucos minutos</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Opção Alternativa - PIX Manual */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <details className="cursor-pointer">
                        <summary className="font-semibold text-gray-700 hover:text-blue-600 flex items-center">
                          <ChevronDown className="h-4 w-4 mr-2" />
                          💡 Opção alternativa: PIX manual (CNPJ)
                        </summary>
                        <div className="mt-4 pt-4 border-t space-y-4">
                          {/* PIX CNPJ em destaque */}
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-600 mb-2">PIX CNPJ:</p>
                            <p className="text-xl font-bold text-blue-700 mb-2">02.914.651/0001-12</p>
                            <p className="text-sm font-semibold text-gray-800">SINDTAXI-ES</p>
                          </div>

                          {/* Código PIX Copia e Cola */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-2">Código PIX Copia e Cola:</p>
                            <div className="bg-white p-3 rounded border border-gray-300">
                              <p className="text-xs break-all font-mono text-gray-700 mb-2">{pixCode}</p>
                              <Button
                                onClick={handleCopyPixCode}
                                variant="outline"
                                className="w-full"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                📋 Copiar Código PIX
                              </Button>
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>

                    {/* Botão de verificação atualizado */}
                    <div className="text-center">
                      <p className="text-lg text-gray-700 mb-4">
                        💳 <strong>Já finalizou o pagamento?</strong>
                      </p>
                      <Button
                        onClick={checkPaymentStatus}
                        className="w-full py-6 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Smartphone className="h-6 w-6 mr-3" />
                        ✅ Verificar Status do Pagamento
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        Clique aqui após concluir o pagamento
                      </p>
                    </div>
                  </div>
                )}

                {paymentStatus === "processing" && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-12 rounded-2xl text-center border-2 border-yellow-200">
                    <div className="animate-spin mb-6 mx-auto">
                      <Clock className="h-16 w-16 text-yellow-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-800 mb-4">
                      ⏳ Processando seu pagamento...
                    </h3>
                    <p className="text-lg text-yellow-700 mb-4">
                      Aguarde enquanto verificamos sua transação PIX
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        ⚡ Isso geralmente leva apenas alguns segundos
                      </p>
                    </div>
                  </div>
                )}

                {paymentStatus === "failed" && (
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-12 rounded-2xl text-center border-2 border-red-200">
                    <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-red-800 mb-4">
                      ❌ Pagamento não encontrado
                    </h3>
                    <p className="text-lg text-red-700 mb-6">
                      Não conseguimos localizar seu pagamento ainda
                    </p>
                    <div className="bg-white p-6 rounded-lg mb-6">
                      <p className="text-sm text-gray-600 mb-4">
                        <strong>Possíveis motivos:</strong>
                      </p>
                      <ul className="text-sm text-gray-600 text-left space-y-1">
                        <li>• O pagamento ainda está sendo processado pelo banco</li>
                        <li>• Verifique se o CNPJ está correto (02.914.651/0001-12)</li>
                        <li>• Aguarde alguns minutos e tente novamente</li>
                      </ul>
                    </div>
                    <Button
                      onClick={() => setPaymentStatus("pending")}
                      className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      🔄 Tentar Verificar Novamente
                    </Button>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>
        
        {/* Botão voltar */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o cadastro
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;