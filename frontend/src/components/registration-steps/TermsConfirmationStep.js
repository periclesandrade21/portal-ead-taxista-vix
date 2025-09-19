import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileCheck, Shield, CheckCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const TermsConfirmationStep = ({ data, updateData, onNext, onPrev }) => {
  const [errors, setErrors] = useState({});
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const validateStep = () => {
    const newErrors = {};

    if (!data.termsAccepted) {
      newErrors.termsAccepted = 'Você deve aceitar os termos de uso';
    }

    if (!data.lgpdAccepted) {
      newErrors.lgpdAccepted = 'Você deve aceitar o tratamento de dados pessoais (LGPD)';
    }

    if (!data.truthfulnessDeclaration) {
      newErrors.truthfulnessDeclaration = 'Você deve declarar a veracidade dos dados';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const handleCheckboxChange = (field, value) => {
    updateData({ [field]: value });
    // Remove error when user checks
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-blue-600" />
          Termos e Confirmação
        </CardTitle>
        <CardDescription>
          Leia e aceite os termos necessários para continuar com seu cadastro.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resumo dos Dados */}
        <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📋 Resumo do Cadastro
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Nome:</span> {data.fullName || 'Não informado'}</p>
              <p><span className="font-medium">CPF:</span> {data.cpf || 'Não informado'}</p>
              <p><span className="font-medium">Email:</span> {data.email || 'Não informado'}</p>
              <p><span className="font-medium">Telefone:</span> {data.cellPhone || 'Não informado'}</p>
            </div>
            <div>
              <p><span className="font-medium">Cidade:</span> {data.city || 'Não informado'}</p>
              <p><span className="font-medium">CNH:</span> {data.cnhNumber || 'Não informado'}</p>
              <p><span className="font-medium">Categoria:</span> {data.cnhCategory || 'Não informado'}</p>
              <p><span className="font-medium">Tipo:</span> {data.isAutonomous ? 'Autônomo' : 'Cooperativa/Empresa'}</p>
            </div>
          </div>
        </div>

        {/* Termos de Uso */}
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📜 Termos de Uso do Curso EAD
          </h4>
          <div className="bg-white p-4 rounded-lg max-h-40 overflow-y-auto text-sm border">
            <h5 className="font-semibold mb-2">TERMOS E CONDIÇÕES DE USO - CURSO EAD TAXISTA ES</h5>
            <p className="mb-2">
              <strong>1. ACEITAÇÃO DOS TERMOS:</strong> Ao se inscrever neste curso, você concorda com todos os termos aqui estabelecidos.
            </p>
            <p className="mb-2">
              <strong>2. OBJETIVO DO CURSO:</strong> Este curso visa capacitar taxistas conforme exigências do CONTRAN e órgãos reguladores locais.
            </p>
            <p className="mb-2">
              <strong>3. OBRIGAÇÕES DO ALUNO:</strong> Participar ativamente das aulas, realizar todas as atividades propostas e manter dados atualizados.
            </p>
            <p className="mb-2">
              <strong>4. CERTIFICADO:</strong> Será emitido apenas após conclusão completa do curso e aprovação na avaliação final.
            </p>
            <p className="mb-2">
              <strong>5. VALIDADE:</strong> O certificado terá validade conforme determinado pelos órgãos competentes.
            </p>
            <p className="mb-2">
              <strong>6. PROPRIEDADE INTELECTUAL:</strong> Todo conteúdo do curso é propriedade do Sindicato dos Taxistas do ES.
            </p>
          </div>
          
          <div className="mt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.termsAccepted}
                onChange={(e) => handleCheckboxChange('termsAccepted', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${errors.termsAccepted ? 'text-red-600' : 'text-gray-700'}`}>
                Eu li e aceito os <strong>Termos de Uso do Curso EAD</strong> e concordo em cumprir todas as condições estabelecidas.
              </span>
            </label>
            {errors.termsAccepted && (
              <p className="text-red-500 text-sm mt-1 ml-7">{errors.termsAccepted}</p>
            )}
          </div>
        </div>

        {/* LGPD */}
        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🔒 Proteção de Dados Pessoais - LGPD
          </h4>
          <div className="bg-white p-4 rounded-lg text-sm border space-y-2">
            <p><strong>Finalidade:</strong> Seus dados serão utilizados exclusivamente para gestão do curso, emissão de certificado e comunicações relacionadas.</p>
            <p><strong>Base Legal:</strong> Execução de contrato de prestação de serviços educacionais e cumprimento de obrigação legal.</p>
            <p><strong>Compartilhamento:</strong> Dados poderão ser compartilhados com órgãos reguladores quando exigido por lei.</p>
            <p><strong>Retenção:</strong> Dados serão mantidos pelo prazo legal exigido para certificações profissionais.</p>
            <p><strong>Seus Direitos:</strong> Acesso, correção, exclusão, portabilidade e oposição ao tratamento.</p>
            <p><strong>Contato DPO:</strong> privacidade@sindtaxi-es.org</p>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
              variant="outline"
              size="sm"
              className="mb-3"
            >
              📋 {showPrivacyPolicy ? 'Ocultar' : 'Ler'} Política de Privacidade Completa
            </Button>
            
            {showPrivacyPolicy && (
              <div className="bg-white p-4 rounded-lg max-h-32 overflow-y-auto text-xs border">
                <h6 className="font-semibold mb-2">POLÍTICA DE PRIVACIDADE COMPLETA</h6>
                <p>Esta política descreve como coletamos, usamos e protegemos suas informações pessoais...</p>
                <p><strong>Coleta de Dados:</strong> Coletamos apenas dados necessários para o curso e certificação.</p>
                <p><strong>Uso de Dados:</strong> Para gestão acadêmica, emissão de certificados e comunicação.</p>
                <p><strong>Segurança:</strong> Utilizamos medidas técnicas e organizacionais adequadas.</p>
                <p><strong>Terceiros:</strong> Compartilhamos apenas com órgãos oficiais quando necessário.</p>
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer mt-3">
              <input
                type="checkbox"
                checked={data.lgpdAccepted}
                onChange={(e) => handleCheckboxChange('lgpdAccepted', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${errors.lgpdAccepted ? 'text-red-600' : 'text-gray-700'}`}>
                Eu autorizo o tratamento dos meus dados pessoais conforme descrito na <strong>Política de Privacidade</strong> e em conformidade com a LGPD.
              </span>
            </label>
            {errors.lgpdAccepted && (
              <p className="text-red-500 text-sm mt-1 ml-7">{errors.lgpdAccepted}</p>
            )}
          </div>
        </div>

        {/* Declaração de Veracidade */}
        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            ✋ Declaração de Veracidade
          </h4>
          <div className="bg-white p-4 rounded-lg text-sm border">
            <p className="mb-2">
              <strong>DECLARAÇÃO OBRIGATÓRIA:</strong>
            </p>
            <p>
              Eu declaro, sob as penas da lei, que todas as informações prestadas neste cadastro são verdadeiras e exatas. 
              Estou ciente de que a falsidade dessas informações constitui crime previsto no Código Penal Brasileiro (artigo 299) 
              e pode resultar no cancelamento da minha inscrição e impedimento de participação em futuros cursos.
            </p>
          </div>

          <div className="mt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.truthfulnessDeclaration}
                onChange={(e) => handleCheckboxChange('truthfulnessDeclaration', e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${errors.truthfulnessDeclaration ? 'text-red-600' : 'text-gray-700'}`}>
                Eu declaro que <strong>todos os dados informados são verdadeiros</strong> e estou ciente das consequências legais de informações falsas.
              </span>
            </label>
            {errors.truthfulnessDeclaration && (
              <p className="text-red-500 text-sm mt-1 ml-7">{errors.truthfulnessDeclaration}</p>
            )}
          </div>
        </div>

        {/* Informações Finais */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Próximos Passos
          </h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Após aceitar os termos, você será direcionado ao pagamento</li>
            <li>• O pagamento pode ser feito via PIX (mais rápido)</li>
            <li>• Após confirmação do pagamento, seus documentos serão validados automaticamente</li>
            <li>• Você receberá acesso ao curso em até 24 horas após aprovação dos documentos</li>
            <li>• Em caso de dúvidas: suporte@sindtaxi-es.org</li>
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
            disabled={!data.termsAccepted || !data.lgpdAccepted || !data.truthfulnessDeclaration}
          >
            Finalizar Cadastro
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TermsConfirmationStep;