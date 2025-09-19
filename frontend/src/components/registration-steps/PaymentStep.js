import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CreditCard, CheckCircle, Clock, Smartphone, QrCode, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

const PaymentStep = ({ data, updateData, onNext, goToStep }) => {
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed, failed
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentId, setPaymentId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    // Simulate payment creation
    if (!paymentId) {
      const newPaymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setPaymentId(newPaymentId);
      updateData({ 
        paymentId: newPaymentId,
        paymentStatus: 'pending',
        paymentCreatedAt: new Date().toISOString()
      });
    }
  }, []);

  useEffect(() => {
    // Countdown timer
    if (timeRemaining > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, paymentStatus]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const coursePrice = 150.00;
  const discountAmount = 0;
  const finalPrice = coursePrice - discountAmount;

  const handlePaymentRedirect = () => {
    // Simulate payment redirect
    setPaymentStatus('processing');
    updateData({ paymentStatus: 'processing' });
    
    // Open payment in new window (simulation)
    const paymentWindow = window.open(
      'https://sandbox.asaas.com/i/bsnw3pmz2yiacw1w',
      '_blank',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    // Simulate payment completion after some time
    setTimeout(() => {
      setPaymentStatus('completed');
      updateData({ 
        paymentStatus: 'completed',
        paymentCompletedAt: new Date().toISOString()
      });
    }, 5000);
  };

  const handlePaymentVerification = async () => {
    try {
      setPaymentStatus('processing');
      
      // Simulate API call to verify payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment verification
      const isPaymentConfirmed = Math.random() > 0.3; // 70% chance of success
      
      if (isPaymentConfirmed) {
        setPaymentStatus('completed');
        updateData({ 
          paymentStatus: 'completed',
          paymentCompletedAt: new Date().toISOString()
        });
        
        // Auto advance to next step after payment confirmation
        setTimeout(() => {
          onNext();
        }, 2000);
      } else {
        setPaymentStatus('pending');
        alert('Pagamento ainda não confirmado. Tente novamente em alguns minutos.');
      }
    } catch (error) {
      setPaymentStatus('failed');
      console.error('Payment verification error:', error);
    }
  };

  if (paymentStatus === 'completed') {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              🎉 Pagamento Confirmado!
            </h2>
            <p className="text-lg text-gray-600">
              Seu pagamento foi processado com sucesso
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="font-medium">ID do Pagamento:</span> {paymentId}</p>
                <p><span className="font-medium">Valor Pago:</span> R$ {finalPrice.toFixed(2)}</p>
              </div>
              <div>
                <p><span className="font-medium">Método:</span> PIX</p>
                <p><span className="font-medium">Status:</span> <Badge className="bg-green-600">Confirmado</Badge></p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Próximos Passos:</h4>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• Seus documentos serão validados automaticamente por IA</li>
              <li>• Você receberá um email com o resultado da validação</li>
              <li>• Após aprovação, o acesso ao curso será liberado</li>
              <li>• O processo de validação leva até 24 horas úteis</li>
            </ul>
          </div>

          <Button 
            onClick={onNext}
            className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700"
          >
            Continuar para Validação
            <CheckCircle className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-600" />
          Pagamento do Curso
        </CardTitle>
        <CardDescription>
          Finalize o pagamento para concluir sua inscrição no curso EAD Taxista ES.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resumo do Pedido */}
        <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            🛒 Resumo do Pedido
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Curso EAD Taxista - Completo (28h)</span>
              <span>R$ {coursePrice.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Desconto aplicado</span>
                <span>-R$ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total a pagar</span>
              <span className="text-blue-600">R$ {finalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Método de Pagamento */}
        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            💳 Método de Pagamento
          </h4>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-white hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="pix"
                checked={paymentMethod === 'pix'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-green-600"
              />
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">PIX (Recomendado)</p>
                  <p className="text-sm text-gray-600">Pagamento instantâneo - Aprovação em minutos</p>
                </div>
              </div>
              <Badge className="ml-auto bg-green-600">Mais Rápido</Badge>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer bg-white hover:bg-gray-50 opacity-60">
              <input
                type="radio"
                name="paymentMethod"
                value="boleto"
                disabled
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Boleto Bancário</p>
                  <p className="text-sm text-gray-600">Aprovação em 1-2 dias úteis</p>
                </div>
              </div>
              <Badge variant="outline" className="ml-auto">Em breve</Badge>
            </label>
          </div>
        </div>

        {/* Contador e Status */}
        {paymentStatus === 'pending' && (
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-yellow-800">
                ⏰ Tempo para Pagamento
              </h4>
              <div className="text-2xl font-bold text-yellow-800">
                {formatTime(timeRemaining)}
              </div>
            </div>
            <Progress 
              value={(15 * 60 - timeRemaining) / (15 * 60) * 100} 
              className="h-2 mb-4" 
            />
            <p className="text-sm text-yellow-700">
              ⚠️ Este pagamento expira em {formatTime(timeRemaining)}. Após este prazo, será necessário gerar um novo.
            </p>
          </div>
        )}

        {paymentStatus === 'processing' && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <h4 className="text-lg font-semibold text-blue-800">
                🔄 Processando Pagamento...
              </h4>
            </div>
            <p className="text-sm text-blue-700">
              Aguarde enquanto confirmamos seu pagamento. Isso pode levar alguns minutos.
            </p>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="space-y-4">
          {paymentStatus === 'pending' && (
            <>
              <Button 
                onClick={handlePaymentRedirect}
                className="w-full py-4 text-lg bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <QrCode className="mr-2 h-6 w-6" />
                Pagar com PIX - R$ {finalPrice.toFixed(2)}
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                onClick={handlePaymentVerification}
                variant="outline"
                className="w-full py-3 text-lg"
                size="lg"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Já Paguei - Verificar Status
              </Button>
            </>
          )}

          {paymentStatus === 'processing' && (
            <Button 
              onClick={handlePaymentVerification}
              variant="outline"
              className="w-full py-3 text-lg"
              size="lg"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Verificar Pagamento
            </Button>
          )}
        </div>

        {/* Informações de Segurança */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            🔒 Pagamento Seguro
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Processamento seguro via Asaas (certificado SSL)</li>
            <li>• Seus dados bancários não são armazenados em nossos servidores</li>
            <li>• PIX é instantâneo e confirmado automaticamente</li>
            <li>• Em caso de problemas: suporte@sindtaxi-es.org</li>
          </ul>
        </div>

        {/* Suporte */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <p>
            Problemas com o pagamento? 
            <a href="mailto:suporte@sindtaxi-es.org" className="text-blue-600 hover:underline ml-1">
              Entre em contato conosco
            </a>
          </p>
          <p className="mt-1">
            📞 (27) 3333-3333 | 📱 WhatsApp: (27) 99999-9999
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStep;