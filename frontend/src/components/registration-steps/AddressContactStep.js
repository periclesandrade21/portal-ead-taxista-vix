import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Home, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const AddressContactStep = ({ data, updateData, onNext, onPrev }) => {
  const [errors, setErrors] = useState({});

  const formatCEP = (value) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatPhone = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 11) {
      return numericValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = () => {
    const newErrors = {};

    // Endereço
    if (!data.address || data.address.trim().length < 5) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!data.number || data.number.trim().length < 1) {
      newErrors.number = 'Número é obrigatório';
    }

    if (!data.neighborhood || data.neighborhood.trim().length < 2) {
      newErrors.neighborhood = 'Bairro é obrigatório';
    }

    if (!data.city || data.city.trim().length < 2) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!data.zipCode || data.zipCode.replace(/\D/g, '').length !== 8) {
      newErrors.zipCode = 'CEP é obrigatório e deve ter 8 dígitos';
    }

    // Contato
    if (!data.email || !validateEmail(data.email)) {
      newErrors.email = 'Email válido é obrigatório';
    }

    if (!data.cellPhone || data.cellPhone.replace(/\D/g, '').length < 10) {
      newErrors.cellPhone = 'Celular é obrigatório (com DDD)';
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

  const handleCEPBlur = async (cep) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const addressData = await response.json();
        
        if (!addressData.erro) {
          updateData({
            address: addressData.logradouro || data.address,
            neighborhood: addressData.bairro || data.neighborhood,
            city: addressData.localidade || data.city,
            state: addressData.uf || 'ES'
          });
        }
      } catch (error) {
        console.log('Erro ao buscar CEP:', error);
      }
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-6 w-6 text-blue-600" />
          Endereço e Contato
        </CardTitle>
        <CardDescription>
          Informe seu endereço residencial atual e dados de contato.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Seção Endereço */}
        <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🏠 Endereço Residencial
          </h4>
          
          {/* CEP */}
          <div className="mb-4">
            <Label htmlFor="zipCode" className="text-sm font-semibold text-gray-700">
              CEP *
            </Label>
            <Input
              id="zipCode"
              type="text"
              value={data.zipCode}
              onChange={(e) => handleInputChange('zipCode', formatCEP(e.target.value))}
              onBlur={(e) => handleCEPBlur(e.target.value)}
              placeholder="00000-000"
              className={`mt-2 h-12 text-lg font-mono ${errors.zipCode ? 'border-red-500' : ''}`}
              maxLength="9"
            />
            {errors.zipCode && (
              <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              📋 Preenchimento automático ao digitar CEP válido
            </p>
          </div>

          {/* Endereço e Número */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                Endereço (Rua/Avenida) *
              </Label>
              <Input
                id="address"
                type="text"
                value={data.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Ex: Rua das Flores"
                className={`mt-2 h-12 text-lg ${errors.address ? 'border-red-500' : ''}`}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <Label htmlFor="number" className="text-sm font-semibold text-gray-700">
                Número *
              </Label>
              <Input
                id="number"
                type="text"
                value={data.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                placeholder="123"
                className={`mt-2 h-12 text-lg ${errors.number ? 'border-red-500' : ''}`}
              />
              {errors.number && (
                <p className="text-red-500 text-sm mt-1">{errors.number}</p>
              )}
            </div>
          </div>

          {/* Complemento e Bairro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="complement" className="text-sm font-semibold text-gray-700">
                Complemento (opcional)
              </Label>
              <Input
                id="complement"
                type="text"
                value={data.complement}
                onChange={(e) => handleInputChange('complement', e.target.value)}
                placeholder="Apt 101, Bloco A"
                className="mt-2 h-12 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="neighborhood" className="text-sm font-semibold text-gray-700">
                Bairro *
              </Label>
              <Input
                id="neighborhood"
                type="text"
                value={data.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                placeholder="Centro"
                className={`mt-2 h-12 text-lg ${errors.neighborhood ? 'border-red-500' : ''}`}
              />
              {errors.neighborhood && (
                <p className="text-red-500 text-sm mt-1">{errors.neighborhood}</p>
              )}
            </div>
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                Cidade *
              </Label>
              <Input
                id="city"
                type="text"
                value={data.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Vitória"
                className={`mt-2 h-12 text-lg ${errors.city ? 'border-red-500' : ''}`}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state" className="text-sm font-semibold text-gray-700">
                Estado
              </Label>
              <Input
                id="state"
                type="text"
                value={data.state}
                readOnly
                className="mt-2 h-12 text-lg bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Seção Contato */}
        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📱 Informações de Contato
          </h4>

          {/* Email */}
          <div className="mb-4">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value.toLowerCase())}
              placeholder="seuemail@exemplo.com"
              className={`mt-2 h-12 text-lg ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              📧 Será usado para envio da senha e comunicações importantes
            </p>
          </div>

          {/* Telefones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cellPhone" className="text-sm font-semibold text-gray-700">
                Celular (WhatsApp) *
              </Label>
              <Input
                id="cellPhone"
                type="tel"
                value={data.cellPhone}
                onChange={(e) => handleInputChange('cellPhone', formatPhone(e.target.value))}
                placeholder="(27) 99999-9999"
                className={`mt-2 h-12 text-lg font-mono ${errors.cellPhone ? 'border-red-500' : ''}`}
              />
              {errors.cellPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.cellPhone}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                📱 Preferencialmente com WhatsApp
              </p>
            </div>

            <div>
              <Label htmlFor="landlinePhone" className="text-sm font-semibold text-gray-700">
                Telefone Fixo (opcional)
              </Label>
              <Input
                id="landlinePhone"
                type="tel"
                value={data.landlinePhone}
                onChange={(e) => handleInputChange('landlinePhone', formatPhone(e.target.value))}
                placeholder="(27) 3333-3333"
                className="mt-2 h-12 text-lg font-mono"
              />
            </div>
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

export default AddressContactStep;