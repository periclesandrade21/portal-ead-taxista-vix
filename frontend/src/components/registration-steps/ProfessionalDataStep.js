import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Briefcase, Car, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const ProfessionalDataStep = ({ data, updateData, onNext, onPrev }) => {
  const [errors, setErrors] = useState({});

  const validateStep = () => {
    const newErrors = {};

    // CNH
    if (!data.cnhNumber || data.cnhNumber.trim().length < 8) {
      newErrors.cnhNumber = 'Número da CNH é obrigatório';
    }

    if (!data.cnhCategory) {
      newErrors.cnhCategory = 'Categoria da CNH é obrigatória';
    }

    if (!data.cnhExpiry) {
      newErrors.cnhExpiry = 'Validade da CNH é obrigatória';
    } else {
      const expiryDate = new Date(data.cnhExpiry);
      const today = new Date();
      if (expiryDate <= today) {
        newErrors.cnhExpiry = 'CNH deve estar dentro da validade';
      }
    }

    if (!data.workingCity) {
      newErrors.workingCity = 'Município de atuação é obrigatório';
    }

    // Se não é autônomo, cooperativa é obrigatória
    if (!data.isAutonomous && (!data.cooperativeName || data.cooperativeName.trim().length < 2)) {
      newErrors.cooperativeName = 'Nome da cooperativa/empresa é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const handleInputChange = (field, value) => {
    updateData({ [field]: value });
    // Remove error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const espiritoSantoCities = [
    'Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Viana', 'Guarapari',
    'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus', 'Colatina',
    'Aracruz', 'Nova Venécia', 'Domingos Martins', 'Santa Teresa',
    'Castelo', 'Venda Nova do Imigrante', 'Iconha', 'Piúma', 'Anchieta'
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-blue-600" />
          Dados Profissionais
        </CardTitle>
        <CardDescription>
          Informações sobre sua habilitação e atuação profissional como taxista.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Seção CNH */}
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🚗 Carteira Nacional de Habilitação (CNH)
          </h4>

          {/* Número da CNH */}
          <div className="mb-4">
            <Label htmlFor="cnhNumber" className="text-sm font-semibold text-gray-700">
              Número da CNH *
            </Label>
            <Input
              id="cnhNumber"
              type="text"
              value={data.cnhNumber}
              onChange={(e) => handleInputChange('cnhNumber', e.target.value)}
              placeholder="00000000000"
              className={`mt-2 h-12 text-lg font-mono ${errors.cnhNumber ? 'border-red-500' : ''}`}
              maxLength="11"
            />
            {errors.cnhNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.cnhNumber}</p>
            )}
          </div>

          {/* Categoria e Validade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cnhCategory" className="text-sm font-semibold text-gray-700">
                Categoria da CNH *
              </Label>
              <select
                id="cnhCategory"
                value={data.cnhCategory}
                onChange={(e) => handleInputChange('cnhCategory', e.target.value)}
                className={`mt-2 h-12 text-lg w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.cnhCategory ? 'border-red-500' : ''}`}
              >
                <option value="">Selecione</option>
                <option value="B">B - Veículos até 3.500kg</option>
                <option value="C">C - Veículos até 3.500kg + reboque</option>
                <option value="D">D - Transporte de passageiros</option>
                <option value="E">E - Todos os veículos</option>
              </select>
              {errors.cnhCategory && (
                <p className="text-red-500 text-sm mt-1">{errors.cnhCategory}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                📋 Mínimo categoria B para táxi
              </p>
            </div>

            <div>
              <Label htmlFor="cnhExpiry" className="text-sm font-semibold text-gray-700">
                Validade da CNH *
              </Label>
              <Input
                id="cnhExpiry"
                type="date"
                value={data.cnhExpiry}
                onChange={(e) => handleInputChange('cnhExpiry', e.target.value)}
                className={`mt-2 h-12 text-lg ${errors.cnhExpiry ? 'border-red-500' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.cnhExpiry && (
                <p className="text-red-500 text-sm mt-1">{errors.cnhExpiry}</p>
              )}
            </div>
          </div>
        </div>

        {/* Seção Dados Profissionais */}
        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🚖 Informações Profissionais
          </h4>

          {/* Tipo de Profissional */}
          <div className="mb-4">
            <Label className="text-sm font-semibold text-gray-700 mb-3 block">
              Tipo de Profissional *
            </Label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="professionalType"
                  checked={data.isAutonomous === true}
                  onChange={() => handleInputChange('isAutonomous', true)}
                  className="mr-2"
                />
                <span className="text-lg">🚖 Autônomo</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="professionalType"
                  checked={data.isAutonomous === false}
                  onChange={() => handleInputChange('isAutonomous', false)}
                  className="mr-2"
                />
                <span className="text-lg">🏢 Cooperativa/Empresa</span>
              </label>
            </div>
          </div>

          {/* Alvará (se autônomo) */}
          {data.isAutonomous && (
            <div className="mb-4">
              <Label htmlFor="taxiLicense" className="text-sm font-semibold text-gray-700">
                Número do Alvará de Táxi
              </Label>
              <Input
                id="taxiLicense"
                type="text"
                value={data.taxiLicense}
                onChange={(e) => handleInputChange('taxiLicense', e.target.value)}
                placeholder="TAX-12345"
                className="mt-2 h-12 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                📋 Para taxistas autônomos com alvará próprio
              </p>
            </div>
          )}

          {/* Cooperativa/Empresa (se não autônomo) */}
          {!data.isAutonomous && (
            <div className="mb-4">
              <Label htmlFor="cooperativeName" className="text-sm font-semibold text-gray-700">
                Nome da Cooperativa/Sindicato/Empresa *
              </Label>
              <Input
                id="cooperativeName"
                type="text"
                value={data.cooperativeName}
                onChange={(e) => handleInputChange('cooperativeName', e.target.value)}
                placeholder="Ex: Cooperativa de Táxis de Vitória"
                className={`mt-2 h-12 text-lg ${errors.cooperativeName ? 'border-red-500' : ''}`}
              />
              {errors.cooperativeName && (
                <p className="text-red-500 text-sm mt-1">{errors.cooperativeName}</p>
              )}
            </div>
          )}

          {/* Município de Atuação */}
          <div>
            <Label htmlFor="workingCity" className="text-sm font-semibold text-gray-700">
              Município de Atuação *
            </Label>
            <select
              id="workingCity"
              value={data.workingCity}
              onChange={(e) => handleInputChange('workingCity', e.target.value)}
              className={`mt-2 h-12 text-lg w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.workingCity ? 'border-red-500' : ''}`}
            >
              <option value="">Selecione o município</option>
              {espiritoSantoCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.workingCity && (
              <p className="text-red-500 text-sm mt-1">{errors.workingCity}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              📍 Município onde você atua como taxista
            </p>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📝 Informações Adicionais (Opcionais)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Escolaridade */}
            <div>
              <Label htmlFor="education" className="text-sm font-semibold text-gray-700">
                Escolaridade
              </Label>
              <select
                id="education"
                value={data.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                className="mt-2 h-12 text-lg w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione</option>
                <option value="fundamental_incompleto">Fundamental Incompleto</option>
                <option value="fundamental_completo">Fundamental Completo</option>
                <option value="medio_incompleto">Médio Incompleto</option>
                <option value="medio_completo">Médio Completo</option>
                <option value="superior_incompleto">Superior Incompleto</option>
                <option value="superior_completo">Superior Completo</option>
                <option value="pos_graduacao">Pós-graduação</option>
              </select>
            </div>

            {/* Tempo de Profissão */}
            <div>
              <Label htmlFor="professionTime" className="text-sm font-semibold text-gray-700">
                Tempo como Taxista
              </Label>
              <select
                id="professionTime"
                value={data.professionTime}
                onChange={(e) => handleInputChange('professionTime', e.target.value)}
                className="mt-2 h-12 text-lg w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione</option>
                <option value="menos_1_ano">Menos de 1 ano</option>
                <option value="1_a_2_anos">1 a 2 anos</option>
                <option value="3_a_5_anos">3 a 5 anos</option>
                <option value="6_a_10_anos">6 a 10 anos</option>
                <option value="mais_10_anos">Mais de 10 anos</option>
              </select>
            </div>
          </div>

          {/* Necessidades de Acessibilidade */}
          <div className="mt-4">
            <Label htmlFor="accessibility" className="text-sm font-semibold text-gray-700">
              Necessidades de Acessibilidade
            </Label>
            <Input
              id="accessibility"
              type="text"
              value={data.accessibility}
              onChange={(e) => handleInputChange('accessibility', e.target.value)}
              placeholder="Ex: surdez, baixa visão, mobilidade reduzida"
              className="mt-2 h-12 text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              ♿ Informe se precisa de algum tipo de suporte durante o curso
            </p>
          </div>
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

export default ProfessionalDataStep;