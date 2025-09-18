import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Smartphone,
  AlertCircle
} from "lucide-react";

const PaymentFlow = ({ userSubscription, onPaymentSuccess, onBack }) => {
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, success, failed
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos
  
  // URL do backend
  const API = process.env.REACT_APP_BACKEND_URL;

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

  // Simular verificação de pagamento (agora usando API real)
  const checkPaymentStatus = async () => {
    setPaymentStatus("processing");
    
    try {
      const response = await axios.post(`${API}/payment/verify-status`, {
        email: userSubscription?.email
      });
      
      if (response.data.status === 'paid') {
        handlePaymentSuccess();
      } else {
        setPaymentStatus("failed");
        setTimeout(() => setPaymentStatus("pending"), 4000);
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      setPaymentStatus("failed");
      setTimeout(() => setPaymentStatus("pending"), 4000);
    }
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

        <div className="max-w-2xl mx-auto">
          
          {/* Interface Simplificada de Pagamento */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center">
              <CardTitle className="text-2xl">
                🎓 Finalizar Pagamento
              </CardTitle>
              <CardDescription className="text-green-100">
                Clique no botão abaixo para concluir seu pagamento via PIX
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center">
              
              {/* Resumo dos Dados */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="font-bold text-lg mb-4">📋 Resumo do Cadastro</h3>
                <div className="text-sm space-y-2">
                  <p><strong>Nome:</strong> {userSubscription?.name}</p>
                  <p><strong>Email:</strong> {userSubscription?.email}</p>
                  <p><strong>Placa:</strong> {userSubscription?.car_plate}</p>
                  <p><strong>Alvará:</strong> {userSubscription?.license_number}</p>
                </div>
              </div>

              {paymentStatus === "pending" && (
                <div className="space-y-6">
                  
                  {/* Botão Principal do Asaas - Simplificado */}
                  <div className="mb-8">
                    <button
                      onClick={() => window.open('https://sandbox.asaas.com/i/bsnw3pmz2yiacw1w', '_blank')}
                      className="w-full py-8 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <QrCode className="h-8 w-8" />
                        <span>💳 Finalizar Pagamento</span>
                      </div>
                    </button>
                    <p className="text-sm text-gray-600 mt-3">
                      ✅ Seguro • ⚡ Instantâneo • 🔒 Criptografado
                    </p>
                  </div>

                  {/* Botão de verificação */}
                  <div className="border-t pt-6">
                    <p className="text-lg text-gray-700 mb-4">
                      💳 <strong>Já finalizou o pagamento?</strong>
                    </p>
                    <Button
                      onClick={checkPaymentStatus}
                      className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Smartphone className="h-5 w-5 mr-2" />
                      ✅ Verificar Status do Pagamento
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Clique aqui após concluir o pagamento
                    </p>
                  </div>
                </div>
              )}

              {paymentStatus === "processing" && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl text-center border-2 border-yellow-200">
                  <div className="animate-spin mb-4 mx-auto">
                    <Clock className="h-12 w-12 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">
                    ⏳ Verificando seu pagamento...
                  </h3>
                  <p className="text-yellow-700">
                    Aguarde alguns instantes
                  </p>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-2xl text-center border-2 border-red-200">
                  <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-800 mb-2">
                    ❌ Pagamento não encontrado
                  </h3>
                  <p className="text-red-700 mb-4">
                    Aguarde alguns minutos e tente novamente
                  </p>
                  <Button
                    onClick={() => setPaymentStatus("pending")}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    🔄 Tentar Novamente
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>

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