import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  CreditCard, 
  QrCode, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Copy,
  Smartphone,
  DollarSign
} from "lucide-react";

const PaymentFlow = ({ userSubscription, onPaymentSuccess, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, success, failed
  const [pixCode, setPixCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos

  // Gerar código PIX simulado
  useEffect(() => {
    if (paymentMethod === "pix") {
      const simulatedPixCode = `00020126580014BR.GOV.BCB.PIX013602914651000112520400005303986540${(150).toFixed(2)}5802BR5909SINDTAXI6009VITORIA62070503***6304`;
      setPixCode(simulatedPixCode);
    }
  }, [paymentMethod]);

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

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    alert("Código PIX copiado!");
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus("success");
    setTimeout(() => {
      onPaymentSuccess();
    }, 2000);
  };

  // Simular verificação de pagamento (em produção seria via webhook)
  const checkPaymentStatus = () => {
    setPaymentStatus("processing");
    
    // Simular delay de processamento
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% de chance de sucesso para demo
      if (success) {
        handlePaymentSuccess();
      } else {
        setPaymentStatus("failed");
        setTimeout(() => setPaymentStatus("pending"), 3000);
      }
    }, 3000);
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl mx-auto text-center shadow-2xl">
          <CardContent className="p-12">
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-green-600 mb-4">Pagamento Confirmado!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Bem-vindo ao EAD Taxista ES, {userSubscription?.name}!
            </p>
            
            <div className="bg-green-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-green-800 mb-2">Próximos Passos:</h3>
              <ul className="text-sm text-green-700 space-y-2">
                <li>✅ Cadastro confirmado</li>
                <li>✅ Pagamento aprovado</li>
                <li>✅ Acesso liberado aos cursos</li>
                <li>📧 Email de confirmação enviado</li>
              </ul>
            </div>

            <Button 
              onClick={onPaymentSuccess}
              className="w-full py-4 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Acessar Portal do Aluno
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finalize seu Pagamento</h1>
            <p className="text-gray-600">Último passo para acessar os cursos</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Resumo do Pedido */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span>Curso EAD Taxista ES</span>
                <span className="font-semibold">R$ 150,00</span>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Dados do Aluno:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Nome:</strong> {userSubscription?.name}</p>
                  <p><strong>Email:</strong> {userSubscription?.email}</p>
                  <p><strong>Telefone:</strong> {userSubscription?.phone}</p>
                  <p><strong>Placa:</strong> {userSubscription?.car_plate}</p>
                  <p><strong>Alvará:</strong> {userSubscription?.license_number}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">R$ 150,00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Método de Pagamento
              </CardTitle>
              <CardDescription>
                {timeLeft > 0 && paymentStatus === "pending" && (
                  <div className="flex items-center text-orange-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Expira em: {formatTime(timeLeft)}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              
              {/* Seleção de Método */}
              <div className="space-y-4 mb-6">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "pix" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                  onClick={() => setPaymentMethod("pix")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <QrCode className="h-6 w-6 mr-3 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">PIX</h3>
                        <p className="text-sm text-gray-600">Aprovação instantânea</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Recomendado
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Pagamento PIX */}
              {paymentMethod === "pix" && (
                <div className="space-y-4">
                  
                  {paymentStatus === "pending" && (
                    <>
                      <div className="bg-blue-50 p-6 rounded-lg text-center">
                        <QrCode className="h-24 w-24 mx-auto mb-4 text-blue-600" />
                        <h3 className="font-semibold mb-2">Escaneie o QR Code</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Use o app do seu banco para escanear o código
                        </p>
                        
                        <div className="bg-white p-4 rounded border">
                          <p className="text-xs text-gray-500 mb-2">Código PIX:</p>
                          <p className="text-xs break-all font-mono">{pixCode}</p>
                        </div>
                        
                        <Button
                          onClick={handleCopyPixCode}
                          variant="outline"
                          className="mt-4 w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Código PIX
                        </Button>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4">
                          Após realizar o pagamento, clique no botão abaixo
                        </p>
                        <Button
                          onClick={checkPaymentStatus}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Smartphone className="h-4 w-4 mr-2" />
                          Já Paguei - Verificar Pagamento
                        </Button>
                      </div>
                    </>
                  )}

                  {paymentStatus === "processing" && (
                    <div className="bg-yellow-50 p-6 rounded-lg text-center">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-600 animate-spin" />
                      <h3 className="font-semibold text-yellow-800 mb-2">Processando Pagamento</h3>
                      <p className="text-sm text-yellow-700">
                        Aguarde enquanto verificamos seu pagamento...
                      </p>
                    </div>
                  )}

                  {paymentStatus === "failed" && (
                    <div className="bg-red-50 p-6 rounded-lg text-center">
                      <div className="text-red-600 mb-4">❌</div>
                      <h3 className="font-semibold text-red-800 mb-2">Pagamento não encontrado</h3>
                      <p className="text-sm text-red-700 mb-4">
                        Não conseguimos localizar seu pagamento. Tente novamente.
                      </p>
                      <Button
                        onClick={() => setPaymentStatus("pending")}
                        variant="outline"
                        className="border-red-300 text-red-700"
                      >
                        Tentar Novamente
                      </Button>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;