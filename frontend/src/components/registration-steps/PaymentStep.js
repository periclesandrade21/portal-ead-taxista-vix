import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, ExternalLink, ArrowRight, CreditCard, Smartphone, QrCode } from 'lucide-react';

const PaymentStep = ({ data, updateData, onComplete }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleCompleteRegistration = async () => {
    setIsRedirecting(true);
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      
      // ETAPA 1: Fazer cadastro real na API
      const subscribeResponse = await fetch(`${BACKEND_URL}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          phone: data.cellPhone,
          cpf: data.cpf,
          carPlate: data.vehiclePlate,
          licenseNumber: data.licenseNumber,
          city: data.city,
          lgpd_consent: data.termsAccepted || true
        })
      });

      if (subscribeResponse.ok) {
        const subscribeResult = await subscribeResponse.json();
        
        // Mostrar popup de sucesso do cadastro
        alert(`🎉 Cadastro realizado com sucesso!\n\n` +
              `Nome: ${data.fullName}\n` +
              `Email: ${data.email}\n` +
              `Telefone: ${data.cellPhone}\n\n` +
              `✅ ${subscribeResult.message}\n` +
              `📧 Email: ${subscribeResult.password_sent_email ? '✅ Enviado' : '❌ Falhou'}\n` +
              `📱 WhatsApp: ${subscribeResult.password_sent_whatsapp ? '✅ Enviado' : '❌ Falhou'}\n` +
              `🔐 Senha temporária: ${subscribeResult.temporary_password}`);
        
        // ETAPA 2: Criar pagamento na Asaas
        const paymentResponse = await fetch(`${BACKEND_URL}/api/create-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userData: data,
            subscriptionData: subscribeResult
          })
        });

        if (paymentResponse.ok) {
          const paymentResult = await paymentResponse.json();
          
          // Mostrar popup sobre pagamento PIX criado
          setTimeout(() => {
            alert(`💳 Pagamento PIX Criado!\n\n` +
                  `✅ ${paymentResult.message}\n` +
                  `💰 Valor: R$ ${paymentResult.amount.toFixed(2)}\n` +
                  `📅 Vencimento: ${paymentResult.due_date}\n\n` +
                  `📋 Próximos passos:\n` +
                  `1. Pague via PIX usando o QR Code\n` +
                  `2. Aguarde confirmação automática\n` +
                  `3. Receba acesso por WhatsApp\n\n` +
                  `🔄 Redirecionando para pagamento...`);
            
            // Mostrar popup sobre documentos e liberação do curso
            setTimeout(() => {
              alert(`📋 Informações Importantes:\n\n` +
                    `🔄 Seu curso será liberado quando:\n` +
                    `• Pagamento PIX for confirmado\n` +
                    `• Documentos forem conferidos pela equipe\n\n` +
                    `📱 Você receberá uma mensagem no WhatsApp confirmando:\n` +
                    `• Liberação do acesso ao curso\n` +
                    `• Instruções para entrar no portal\n` +
                    `• Login e senha de acesso\n\n` +
                    `💳 Finalize seu pagamento PIX agora!`);
              
              // Finalizar e abrir popup de pagamento
              if (onComplete) {
                onComplete({ 
                  ...data, 
                  subscriptionData: subscribeResult,
                  paymentData: paymentResult
                });
              }
            }, 1500);
          }, 1500);
          
        } else {
          const paymentError = await paymentResponse.json();
          alert(`❌ Erro ao criar pagamento:\n\n${paymentError.detail || 'Erro desconhecido'}\n\nTente novamente.`);
          setIsRedirecting(false);
        }
        
      } else {
        const errorData = await subscribeResponse.json();
        alert(`❌ Erro no cadastro:\n\n${errorData.detail || 'Erro desconhecido'}`);
        setIsRedirecting(false);
      }
      
    } catch (error) {
      console.error('Erro ao fazer cadastro:', error);
      alert(`❌ Erro de conexão:\n\n${error.message}\n\nTente novamente.`);
      setIsRedirecting(false);
    }
  };

  const coursePrice = 150.00;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-600" />
          Finalizar Inscrição
        </CardTitle>
        <CardDescription>
          Seu cadastro está completo! Finalize sua inscrição para prosseguir com o pagamento.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resumo do Cadastro */}
        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
          <h4 className="text-lg font-semibold text-green-800 mb-4">
            ✅ Resumo da Inscrição
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Nome:</span> {data.fullName}</p>
              <p><span className="font-medium">CPF:</span> {data.cpf}</p>
              <p><span className="font-medium">Email:</span> {data.email}</p>
              <p><span className="font-medium">Telefone:</span> {data.cellPhone}</p>
            </div>
            <div>
              <p><span className="font-medium">Cidade:</span> {data.city}</p>
              <p><span className="font-medium">CNH:</span> {data.cnhNumber}</p>
              <p><span className="font-medium">Categoria:</span> {data.cnhCategory}</p>
              <p><span className="font-medium">Tipo:</span> {data.isAutonomous ? 'Autônomo' : 'Cooperativa'}</p>
            </div>
          </div>
        </div>

        {/* Informações do Curso */}
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h4 className="text-lg font-semibold text-blue-800 mb-4">
            📚 Detalhes do Curso
          </h4>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>Curso:</strong> EAD Taxista ES - Completo</p>
            <p><strong>Módulos:</strong> Relações Humanas, Direção Defensiva, Primeiros Socorros, Mecânica Básica</p>
            <p><strong>Carga Horária:</strong> 28 horas</p>
            <p><strong>Certificado:</strong> Válido nacionalmente</p>
            <p><strong>Valor:</strong> <span className="text-xl font-bold">R$ {coursePrice.toFixed(2)}</span></p>
          </div>
        </div>

        {/* Documentos Enviados */}
        <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
          <h4 className="text-lg font-semibold text-purple-800 mb-4">
            📄 Documentos Enviados
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(data.documents).map(([docType, docInfo]) => {
              if (!docInfo) return null;
              
              const docNames = {
                cnh: '🚗 CNH',
                residenceProof: '🏠 Comprovante de Residência',
                photo: '📷 Foto/Selfie',
                crlv: '📋 CRLV',
                taxiLicense: '🚖 Alvará do Táxi',
                cooperativeProof: '🏢 Comprovante de Vínculo'
              };
              
              return (
                <div key={docType} className="bg-white p-3 rounded border">
                  <p className="font-medium text-sm text-purple-800">{docNames[docType]}</p>
                  <p className="text-xs text-gray-600">{docInfo.name}</p>
                  <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                    ✅ Enviado
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
          <h4 className="text-lg font-semibold text-yellow-800 mb-4">
            🔄 Próximos Passos
          </h4>
          <ol className="text-sm text-yellow-700 space-y-2">
            <li>1. ✅ <strong>Cadastro completo</strong> - Todos os dados foram salvos</li>
            <li>2. 📧 <strong>Senha enviada</strong> - Verifique seu email e WhatsApp</li>
            <li>3. 💳 <strong>Pagamento PIX</strong> - R$ {coursePrice.toFixed(2)} via PIX instantâneo</li>
            <li>4. 📚 <strong>Acesso ao curso</strong> - Liberado após confirmação do pagamento</li>
            <li>5. 📋 <strong>Validação de documentos</strong> - Feita pelo admin após pagamento</li>
          </ol>
        </div>

        {/* Opções de Pagamento */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            💳 Finalizar Inscrição e Prosseguir para Pagamento
          </h4>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <QrCode className="h-6 w-6 text-green-600" />
              <span className="font-semibold">PIX Instantâneo</span>
            </div>
            <div className="text-2xl">•</div>
            <div className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">Aprovação Rápida</span>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="text-3xl font-bold text-green-600">
              R$ {coursePrice.toFixed(2)}
            </div>
            
            <Button 
              onClick={handleCompleteRegistration}
              disabled={isRedirecting}
              className="w-full py-4 text-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
              size="lg"
            >
              {isRedirecting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Finalizando Cadastro...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-6 w-6" />
                  Fazer Inscrição Completa
                  <ArrowRight className="ml-3 h-6 w-6" />
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Informações de Suporte */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          <p>
            💡 Após finalizar, você será direcionado para o pagamento seguro via PIX
          </p>
          <p className="mt-2">
            🆘 Dúvidas? Entre em contato: 
            <a href="mailto:suporte@sindtaxi-es.org" className="text-blue-600 hover:underline ml-1">
              suporte@sindtaxi-es.org
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStep;