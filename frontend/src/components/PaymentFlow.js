import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { 
  QrCode, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  AlertCircle
} from "lucide-react";

const PaymentFlow = ({ userSubscription, onPaymentSuccess, onBack }) => {
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, success, failed
  
  // URL do backend
  const API = process.env.REACT_APP_BACKEND_URL;

  // Redirecionamento automático para o Asaas
  useEffect(() => {
    if (paymentStatus === "pending") {
      // Redireciona automaticamente para o link do Asaas
      window.location.href = 'https://sandbox.asaas.com/i/bsnw3pmz2yiacw1w';
    }
  }, [paymentStatus]);

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
      <div className="max-w-2xl mx-auto p-4 pt-8">

        {/* Interface Ultra Minimalista - Apenas o Link */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="shadow-xl w-full max-w-md">
            <CardContent className="p-8 text-center">
              
              {paymentStatus === "pending" && (
                <div>
                  <button
                    onClick={() => window.open('https://sandbox.asaas.com/i/bsnw3pmz2yiacw1w', '_blank')}
                    className="w-full py-8 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <QrCode className="h-8 w-8" />
                      <span>💳 Finalizar Pagamento</span>
                    </div>
                  </button>
                </div>
              )}

              {paymentStatus === "processing" && (
                <div className="p-8 text-center">
                  <div className="animate-spin mb-4 mx-auto">
                    <Clock className="h-12 w-12 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">
                    ⏳ Verificando seu pagamento...
                  </h3>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-800 mb-2">
                    ❌ Pagamento não encontrado
                  </h3>
                  <Button
                    onClick={() => setPaymentStatus("pending")}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold mt-4"
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