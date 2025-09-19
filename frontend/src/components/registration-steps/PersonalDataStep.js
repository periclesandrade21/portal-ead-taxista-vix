import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { User, Calendar, IdCard, ChevronRight } from 'lucide-react';

const PersonalDataStep = ({ data, updateData, onNext }) => {
  const [errors, setErrors] = useState({});

  const formatCPF = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 11) {
      return numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatRG = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 9) {
      return numericValue.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const validateStep = () => {
    const newErrors = {};

    if (!data.fullName || data.fullName.trim().length < 3) {
      newErrors.fullName = 'Nome completo é obrigatório (mínimo 3 caracteres)';
    }

    if (!data.cpf || data.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF é obrigatório e deve ter 11 dígitos';
    }

    if (!data.rg || data.rg.trim().length < 7) {
      newErrors.rg = 'RG é obrigatório';
    }

    if (!data.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else {
      const birthYear = new Date(data.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (age < 18) {
        newErrors.birthDate = 'Candidato deve ser maior de 18 anos';
      }
      if (age > 80) {
        newErrors.birthDate = 'Verifique a data de nascimento';
      }
    }

    if (!data.gender) {
      newErrors.gender = 'Gênero é obrigatório';
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

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          Dados Pessoais
        </CardTitle>
        <CardDescription>
          Preencha suas informações pessoais básicas. Todos os campos marcados com * são obrigatórios.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Nome Completo */}
        <div>
          <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
            Nome Completo *
          </Label>
          <Input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Ex: João Silva Santos"
            className={`mt-2 h-12 text-lg ${errors.fullName ? 'border-red-500' : ''}`}
            maxLength="100"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* CPF e RG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="cpf" className="text-sm font-semibold text-gray-700">
              CPF *
            </Label>
            <Input
              id="cpf"
              type="text"
              value={data.cpf}
              onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              className={`mt-2 h-12 text-lg font-mono ${errors.cpf ? 'border-red-500' : ''}`}
              maxLength="14"
            />
            {errors.cpf && (
              <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rg" className="text-sm font-semibold text-gray-700">
              RG (ou outro documento oficial com foto) *
            </Label>
            <Input
              id="rg"
              type="text"
              value={data.rg}
              onChange={(e) => handleInputChange('rg', formatRG(e.target.value))}
              placeholder="00.000.000-0"
              className={`mt-2 h-12 text-lg font-mono ${errors.rg ? 'border-red-500' : ''}`}
              maxLength="12"
            />
            {errors.rg && (
              <p className="text-red-500 text-sm mt-1">{errors.rg}</p>
            )}
          </div>
        </div>

        {/* Data de Nascimento e Nacionalidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="birthDate" className="text-sm font-semibold text-gray-700">
              Data de Nascimento *
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={data.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className={`mt-2 h-12 text-lg ${errors.birthDate ? 'border-red-500' : ''}`}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
            {errors.birthDate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
            )}
          </div>

          <div>
            <Label htmlFor="nationality" className="text-sm font-semibold text-gray-700">
              Nacionalidade
            </Label>
            <Input
              id="nationality"
              type="text"
              value={data.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              placeholder="Brasileira"
              className="mt-2 h-12 text-lg"
            />
          </div>
        </div>

        {/* Gênero e Estado Civil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
              Gênero *
            </Label>
            <select
              id="gender"
              value={data.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className={`mt-2 h-12 text-lg w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.gender ? 'border-red-500' : ''}`}
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
              <option value="prefere_nao_informar">Prefere não informar</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <Label htmlFor="maritalStatus" className="text-sm font-semibold text-gray-700">
              Estado Civil (opcional)
            </Label>
            <select
              id="maritalStatus"
              value={data.maritalStatus}
              onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
              className="mt-2 h-12 text-lg w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione</option>
              <option value="solteiro">Solteiro(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viuvo">Viúvo(a)</option>
              <option value="uniao_estavel">União Estável</option>
            </select>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <IdCard className="h-5 w-5" />
            Informações Importantes
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Certifique-se de que os dados estejam corretos - eles serão usados no certificado</li>
            <li>• O CPF será usado para validação e emissão do certificado</li>
            <li>• Tenha em mãos os documentos originais para o upload na próxima etapa</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6">
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

export default PersonalDataStep;