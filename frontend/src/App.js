import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import AdminDashboard from "./components/AdminDashboard";
import AdminDashboardEAD from "./components/AdminDashboardEAD";
import StudentPortalComplete from "./components/StudentPortalComplete";
import ChatBot from "./components/ChatBot";
import PaymentFlow from "./components/PaymentFlow";
import ProgressSteps from "./components/ProgressSteps";
import MultiStepRegistration from "./components/MultiStepRegistration";
import { 
  Car, 
  GraduationCap, 
  Shield, 
  Clock, 
  Award, 
  Users, 
  CheckCircle, 
  Phone, 
  Mail,
  Globe,
  QrCode,
  CreditCard,
  BookOpen,
  Video,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileCheck
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [showNewRegistration, setShowNewRegistration] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [carPlate, setCarPlate] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState("registration"); // registration, payment, success
  const [userSubscription, setUserSubscription] = useState(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwordSentInfo, setPasswordSentInfo] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [duplicatePopup, setDuplicatePopup] = useState(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [coursePrice, setCoursePrice] = useState(150); // Preço dinâmico do curso
  
  // Estados para LGPD
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [privacyPolicyModal, setPrivacyPolicyModal] = useState(false);

  // Buscar preço do curso ao carregar componente
  useEffect(() => {
    const fetchCoursePrice = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/courses/default/price`);
        if (response.data && response.data.price) {
          setCoursePrice(response.data.price);
        }
      } catch (error) {
        console.error('Erro ao buscar preço do curso:', error);
        // Manter valor padrão de 150 em caso de erro
      }
    };

    fetchCoursePrice();
  }, []);

  // Função de geolocalização
  const detectUserLocation = async () => {
    setIsDetectingLocation(true);
    
    try {
      if (!navigator.geolocation) {
        alert("Geolocalização não é suportada pelo seu navegador");
        setIsDetectingLocation(false);
        return;
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Usar API de reverse geocoding para obter a cidade
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
      );
      const data = await response.json();
      
      if (data.city || data.locality) {
        const detectedCity = data.city || data.locality;
        setCustomCity(detectedCity);
        
        // Verificar se a cidade detectada está na lista do ES
        const esCities = ["Vitória", "Vila Velha", "Serra", "Cariacica", "Viana", "Guarapari", 
                         "Cachoeiro de Itapemirim", "Linhares", "São Mateus", "Colatina", 
                         "Aracruz", "Nova Venécia", "Domingos Martins", "Santa Teresa", 
                         "Castelo", "Venda Nova do Imigrante", "Iconha", "Piúma", "Anchieta"];
        
        if (esCities.includes(detectedCity)) {
          setCity(detectedCity);
          setCustomCity("");
          alert(`✅ Localização detectada: ${detectedCity}`);
        } else {
          alert(`📍 Localização detectada: ${detectedCity}\nMantenha selecionado "Outra cidade do ES" e confirme se está correto.`);
        }
      } else {
        alert("Não foi possível detectar sua cidade. Digite manualmente.");
      }
    } catch (error) {
      console.error("Erro na geolocalização:", error);
      if (error.code === 1) {
        alert("❌ Acesso à localização negado. Por favor, digite sua cidade manualmente.");
      } else if (error.code === 2) {
        alert("❌ Localização não disponível. Digite sua cidade manualmente.");
      } else {
        alert("❌ Erro ao detectar localização. Digite sua cidade manualmente.");
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Melhorar validação de email conforme RFC 5322
  const validateEmail = (email) => {
    if (!email) return false;
    
    // Regex mais robusta baseada na RFC 5322
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return emailRegex.test(email.trim());
  };

  // Validação robusta de nomes brasileiros
  const validateName = (name) => {
    if (!name || !name.trim()) return false;
    
    const trimmedName = name.trim();
    
    // Verificações básicas
    if (trimmedName.length < 2 || trimmedName.length > 60) return false;
    
    // Deve conter apenas letras, espaços, hífens e acentos
    if (!/^[A-Za-zÀ-ÿ\s\'-]+$/.test(trimmedName)) return false;
    
    // Deve ter pelo menos nome e sobrenome
    const parts = trimmedName.split(/\s+/);
    if (parts.length < 2) return false;
    
    // Cada parte deve ter pelo menos 2 caracteres
    for (const part of parts) {
      if (part.length < 2) return false;
    }
    
    // Verificar palavras proibidas
    const forbiddenWords = [
      'teste', 'test', 'admin', 'usuario', 'user', 'fake', 'falso', 
      'exemplo', 'example', 'aaa', 'bbb', 'ccc', '123', 'abc', 'xyz'
    ];
    
    const nameLower = trimmedName.toLowerCase();
    for (const word of forbiddenWords) {
      if (nameLower.includes(word)) return false;
    }
    
    // Verificar repetições excessivas
    if (/(.)\1{3,}/.test(trimmedName)) return false;
    
    return true;
  };

  // Validação de CPF
  const validateCPF = (cpf) => {
    if (!cpf) return false;
    
    // Remove formatação
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
    
    return true;
  };

  // Formatação de CPF
  const formatCPF = (value) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    const match = cleanValue.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (match) {
      return !match[2] ? match[1] : 
             !match[3] ? `${match[1]}.${match[2]}` :
             !match[4] ? `${match[1]}.${match[2]}.${match[3]}` :
             `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return value;
  };
  const validateTaxiPlate = (plate) => {
    if (!plate) return false;
    
    const plateUpper = plate.toUpperCase().trim();
    const patterns = [
      /^[A-Z]{3}-\d{4}-T$/,      // ABC-1234-T
      /^[A-Z]{3}\d{1}[A-Z]{1}\d{2}$/,  // ABC1D23 (Mercosul)
      /^[A-Z]{3}\d{4}$/,         // ABC1234
    ];
    
    return patterns.some(pattern => pattern.test(plateUpper));
  };

  const validateTaxiLicense = (license) => {
    if (!license) return false;
    
    const licenseUpper = license.toUpperCase().trim();
    const patterns = [
      /^TA-\d{4,6}$/,           // TA-12345
      /^TAX-\d{4}-\d{4}$/,      // TAX-2023-1234
      /^T-\d{4,7}$/,            // T-1234567
      /^[A-Z]{2,3}-\d{4,6}$/,   // Outros prefixos
      /^\d{4,8}$/,              // Apenas números
    ];
    
    return patterns.some(pattern => pattern.test(licenseUpper));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = "Nome é obrigatório";
    } else if (!validateName(name)) {
      errors.name = "Informe seu nome completo real (mínimo 2 nomes, sem números ou caracteres especiais)";
    }
    
    if (!email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!validateEmail(email)) {
      errors.email = "Email inválido. Use o formato: exemplo@dominio.com";
    }
    
    if (!phone.trim()) {
      errors.phone = "Telefone é obrigatório";
    }
    
    if (!cpf.trim()) {
      errors.cpf = "CPF é obrigatório";
    } else if (!validateCPF(cpf)) {
      errors.cpf = "CPF inválido";
    }
    
    if (carPlate && !validateTaxiPlate(carPlate)) {
      errors.carPlate = "Formato inválido. Use: ABC-1234-T, ABC1D23 ou ABC1234";
    }
    
    if (licenseNumber && !validateTaxiLicense(licenseNumber)) {
      errors.licenseNumber = "Formato inválido. Use: TA-12345, TAX-2023-1234, T-1234567 ou números";
    }
    
    if (!city) {
      errors.city = "Cidade é obrigatória";
    } else if (city === "Outra" && !customCity.trim()) {
      errors.customCity = "Por favor, informe sua cidade";
    }
    
    if (!lgpdConsent) {
      errors.lgpdConsent = "É necessário aceitar os termos de privacidade e proteção de dados (LGPD)";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Verificar duplicatas em tempo real
  const checkDuplicates = async () => {
    if (!name.trim() && !email.trim() && !cpf.trim() && !phone.trim() && !carPlate.trim() && !licenseNumber.trim()) {
      return;
    }

    setIsCheckingDuplicates(true);
    
    try {
      const finalCity = city === "Outra" ? customCity : city;
      
      const response = await axios.post(`${API}/check-duplicates`, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cpf: cpf.trim(),
        carPlate: carPlate.trim(),
        licenseNumber: licenseNumber.trim(),
        city: finalCity
      });
      
      if (response.data.has_duplicates) {
        setDuplicatePopup(response.data.duplicates);
      }
      
    } catch (error) {
      console.error("Erro ao verificar duplicatas:", error);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  // Array de imagens para o carrossel
  const carouselImages = [
    {
      url: "https://customer-assets.emergentagent.com/job_moodle-taxistas/artifacts/sz52fpqs_image.png",
      alt: "Taxi do Espírito Santo - 1"
    },
    {
      url: "https://customer-assets.emergentagent.com/job_moodle-taxistas/artifacts/bwd2er9v_image.png",
      alt: "Taxi do Espírito Santo - 2"
    },
    {
      url: "https://customer-assets.emergentagent.com/job_moodle-taxistas/artifacts/5fytsmog_image.png",
      alt: "Taxi do Espírito Santo - 3"
    },
    {
      url: "https://customer-assets.emergentagent.com/job_moodle-taxistas/artifacts/97b16o9r_image.png",
      alt: "Taxi do Espírito Santo - 4"
    },
    {
      url: "https://images.unsplash.com/photo-1642331395578-62fc20996c2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHx0YXhpJTIwZWR1Y2F0aW9ufGVufDB8fHx8MTc1Nzk5MDAwM3ww&ixlib=rb-4.1.0&q=85",
      alt: "Taxi Profissional - 5"
    }
  ];

  // Auto-avançar carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Muda a cada 4 segundos

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  const handleSubscription = async (e) => {
    e.preventDefault();
    
    // Validar formulário (incluindo LGPD)
    if (!validateForm()) {
      alert("Por favor, corrija os erros no formulário antes de continuar.");
      return;
    }
    
    try {
      const finalCity = city === "Outra" ? customCity : city;
      
      const response = await axios.post(`${API}/subscribe`, {
        name,
        email,
        phone,
        cpf,
        carPlate,
        licenseNumber,
        city: finalCity,
        lgpd_consent: lgpdConsent  // Incluir consentimento LGPD
      });
      
      // Salvar informações sobre o envio da senha
      setPasswordSentInfo(response.data);
      
      // Mostrar popup de confirmação
      setShowPasswordPopup(true);
      
    } catch (error) {
      console.error("Erro ao realizar inscrição:", error);
      
      if (error.response && error.response.data && error.response.data.detail) {
        // Verificar se é erro de duplicata
        if (error.response.data.detail.includes("já cadastrado")) {
          alert(`⚠️ Dados duplicados encontrados:\n\n${error.response.data.detail}`);
        } else {
          alert(`Erro: ${error.response.data.detail}`);
        }
      } else {
        alert("Erro ao realizar cadastro. Verifique os dados e tente novamente.");
      }
    }
  };

  const handlePasswordPopupClose = () => {
    setShowPasswordPopup(false);
    
    // Preparar dados da inscrição para o fluxo de pagamento
    const finalCity = city === "Outra" ? customCity : city;
    const subscriptionData = {
      name,
      email,
      phone,
      cpf,
      car_plate: carPlate,
      license_number: licenseNumber,
      city: finalCity
    };
    
    setUserSubscription(subscriptionData);
    setCurrentStep("payment");
    window.scrollTo(0, 0);
  };

  const handlePaymentSuccess = () => {
    // Redirecionar para portal do aluno
    window.location.href = "/student-portal";
  };

  const handleBackToRegistration = () => {
    setCurrentStep("registration");
  };

  const handleRegistrationComplete = (registrationData) => {
    console.log('Registration completed:', registrationData);
    // Redirect to student portal or show success message
    setShowNewRegistration(false);
    alert('🎉 Cadastro concluído com sucesso! Você já pode acessar o curso.');
  };

  console.log('showNewRegistration state:', showNewRegistration); // DEBUG

  // Renderizar o novo sistema de cadastro se solicitado
  if (showNewRegistration) {
    console.log('Rendering MultiStepRegistration component'); // DEBUG
    return (
      <MultiStepRegistration onRegistrationComplete={handleRegistrationComplete} />
    );
  }

  return (
    <>
      {/* Modal Política de Privacidade LGPD */}
      {privacyPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🔒 Política de Privacidade e Proteção de Dados</h2>
              <Button
                onClick={() => setPrivacyPolicyModal(false)}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-6 text-sm text-gray-700">
              <section>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">📋 1. Coleta e Tratamento de Dados</h3>
                <p className="mb-2">
                  O <strong>Sindicato dos Taxistas do Espírito Santo (SINDTAXI-ES)</strong> coleta e trata seus dados pessoais com base na 
                  <strong> Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong> para as seguintes finalidades:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Processamento de inscrições no curso EAD obrigatório para taxistas</li>
                  <li>Emissão de certificados reconhecidos pelo DETRAN-ES</li>
                  <li>Comunicações sobre o curso e suporte técnico</li>
                  <li>Cumprimento de obrigações legais e regulamentares</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">🛡️ 2. Dados Coletados</h3>
                <p className="mb-2">Coletamos os seguintes dados pessoais:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Dados de identificação:</strong> Nome completo, CPF, email</li>
                  <li><strong>Dados de contato:</strong> Telefone/WhatsApp</li>
                  <li><strong>Dados profissionais:</strong> Número do alvará, placa do veículo, cidade de atuação</li>
                  <li><strong>Dados de pagamento:</strong> Informações necessárias para processamento PIX</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">🔐 3. Segurança e Proteção</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Utilizamos criptografia SSL/TLS para proteger dados em trânsito</li>
                  <li>Dados armazenados em servidores seguros com backup regular</li>
                  <li>Acesso restrito apenas a pessoal autorizado</li>
                  <li>Monitoramento constante contra acessos não autorizados</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">📞 4. Seus Direitos (LGPD)</h3>
                <p className="mb-2">Você tem os seguintes direitos sobre seus dados pessoais:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Acesso:</strong> Solicitar informações sobre seus dados</li>
                  <li><strong>Correção:</strong> Atualizar dados incompletos ou incorretos</li>
                  <li><strong>Exclusão:</strong> Solicitar remoção de dados (quando aplicável)</li>
                  <li><strong>Portabilidade:</strong> Obter seus dados em formato estruturado</li>
                  <li><strong>Revogação:</strong> Retirar consentimento a qualquer momento</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">⏰ 5. Retenção de Dados</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Dados são mantidos pelo período necessário para prestação do serviço</li>
                  <li>Certificados e registros mantidos conforme exigência legal (mínimo 5 anos)</li>
                  <li>Dados podem ser anonimizados para fins estatísticos</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">🏢 6. Compartilhamento</h3>
                <p className="mb-2">Seus dados podem ser compartilhados apenas com:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>DETRAN-ES (para reconhecimento de certificados)</li>
                  <li>Processadores de pagamento (para transações PIX)</li>
                  <li>Autoridades competentes (quando exigido por lei)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">📧 7. Contato - Encarregado de Dados</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> privacidade@sindtaxi-es.org</p>
                  <p><strong>Telefone:</strong> (27) 3033-4455</p>
                  <p><strong>Endereço:</strong> Rua XV de Novembro, 123 - Centro, Vitória/ES</p>
                  <p className="text-sm text-blue-600 mt-2">
                    Para exercer seus direitos ou esclarecer dúvidas sobre tratamento de dados
                  </p>
                </div>
              </section>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setPrivacyPolicyModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Popup de Duplicatas */}
      {duplicatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              {/* Ícone de aviso */}
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              
              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                ⚠️ Dados Duplicados Encontrados!
              </h3>
              
              {/* Lista de duplicatas */}
              <div className="bg-red-50 p-4 rounded-lg mb-6 text-left">
                <h4 className="font-semibold mb-3 text-red-800">📋 Informações já cadastradas:</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(duplicatePopup).map(([field, info]) => (
                    <div key={field} className="flex items-start">
                      <span className="text-red-600 mr-2">•</span>
                      <div>
                        <strong>{info.field}:</strong> {info.value}
                        <br />
                        <span className="text-gray-600">Já cadastrado para: {info.existing_user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Instruções */}
              <p className="text-sm text-gray-600 mb-6">
                Os dados destacados já estão cadastrados no sistema. Verifique suas informações ou entre em contato conosco se houver algum erro.
              </p>
              
              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setDuplicatePopup(null)}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl"
                >
                  📝 Corrigir Dados
                </Button>
                <Button
                  onClick={() => {
                    setDuplicatePopup(null);
                    // Scroll para seção de contato ou abrir WhatsApp
                    window.open('mailto:suporte@sindtaxi-es.org', '_blank');
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  📞 Contatar Suporte
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup de Senha Enviada - Melhorado */}
      {showPasswordPopup && passwordSentInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg mx-4 shadow-2xl">
            <div className="text-center">
              {/* Ícone de sucesso */}
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🎉 Cadastro Realizado com Sucesso!
              </h3>
              
              {/* Mensagem principal */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center justify-center">
                  <Key className="h-5 w-5 mr-2" />
                  🔑 Sua Senha de Acesso Foi Enviada!
                </h4>
                <p className="text-blue-800 text-sm">
                  Sua senha temporária foi enviada pelos canais selecionados abaixo.
                  Use esta senha para acessar o Portal do Aluno.
                </p>
              </div>
              
              {/* Status de envio detalhado */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">📱 Status do Envio:</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      📧 Email ({email}):
                    </span>
                    <Badge className={passwordSentInfo.password_sent_email ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {passwordSentInfo.password_sent_email ? "✅ Enviado" : "❌ Falhou"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-green-600" />
                      📱 WhatsApp ({phone}):
                    </span>
                    <Badge className={passwordSentInfo.password_sent_whatsapp ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {passwordSentInfo.password_sent_whatsapp ? "✅ Enviado" : "⚠️ Não configurado"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Senha temporária (apenas para desenvolvimento) */}
              {passwordSentInfo.temporary_password && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">🔒 Senha Temporária:</h4>
                  <div className="bg-blue-100 p-3 rounded font-mono text-lg text-blue-900 border border-blue-300">
                    {passwordSentInfo.temporary_password}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 <strong>Modo Desenvolvimento:</strong> Esta informação será removida em produção
                  </p>
                </div>
              )}
              
              {/* Instruções importantes */}
              <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-left">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  📋 Próximos Passos:
                </h4>
                <ol className="text-sm text-yellow-800 space-y-1">
                  <li>1. ✅ <strong>Senha enviada</strong> - Verifique sua caixa de entrada e spam</li>
                  <li>2. 💳 <strong>Pagar o curso</strong> - Continue para o pagamento PIX</li>
                  <li>3. 🎓 <strong>Acessar o curso</strong> - Use a senha no Portal do Aluno</li>
                  <li>4. 📚 <strong>Iniciar estudos</strong> - Após pagamento confirmado</li>
                </ol>
              </div>
              
              {/* Botão para continuar */}
              <Button
                onClick={handlePasswordPopupClose}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold rounded-xl"
              >
                🚀 Continuar para Pagamento
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fluxo de Pagamento */}
      {currentStep === "payment" && userSubscription && (
        <PaymentFlow
          userSubscription={userSubscription}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={handleBackToRegistration}
        />
      )}

      {/* Página Principal */}
      {currentStep === "registration" && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* Marca d'água da Terceira Ponte - Melhorada */}
      <div 
        className="fixed inset-0 z-0 opacity-15 bg-center bg-no-repeat bg-contain"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1725132620980-808ebeee990b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHx0ZXJjZWlyYSUyMHBvbnRlJTIwZXNwaXJpdG8lMjBzYW50b3xlbnwwfHx8fDE3NTc5OTg1NDF8MA&ixlib=rb-4.1.0&q=85')",
          backgroundSize: '80%',
          backgroundPosition: 'center center',
          filter: 'contrast(1.2) brightness(0.8)',
          mixBlendMode: 'multiply'
        }}
      ></div>
      
      {/* Conteúdo da página */}
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EAD Taxista ES</h1>
                <p className="text-sm text-gray-600">Sindicato dos Taxistas - Espírito Santo</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#cursos" className="text-gray-600 hover:text-blue-600 font-medium">Cursos</a>
              <a href="#cadastro" className="text-gray-600 hover:text-blue-600 font-medium">Cadastro</a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600 font-medium">Contato</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
                Certificação Profissional Reconhecida
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-6 leading-relaxed">
                <span className="font-semibold">Educação</span> <span className="text-blue-600 font-medium">Profissional</span>
                <br />
                <span className="text-lg md:text-xl lg:text-2xl text-green-600 font-normal tracking-wide">
                  para Taxistas do Espírito Santo
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Capacite-se com nosso curso EAD completo, com certificado reconhecido pelo DETRAN 
                e pelas prefeituras, válido em todo o território nacional e homologado pelo 
                Sindicato dos Taxistas do Espírito Santo.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
                <Button 
                  onClick={() => {
                    console.log('Button clicked! Setting showNewRegistration to true');
                    setShowNewRegistration(true);
                  }}
                  className="w-full sm:w-auto px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105"
                >
                  <Car className="mr-2 h-6 w-6" />
                  🚀 Fazer Inscrição Completa
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link to="/student-portal" className="w-full sm:w-auto">
                    <Button className="w-full px-6 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md border-2 border-blue-600">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Portal do Aluno
                    </Button>
                  </Link>

                  <Link to="/admin-ead" className="w-full sm:w-auto">
                    <Button className="w-full px-6 py-4 text-lg bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md border-2 border-green-600">
                      <Shield className="mr-2 h-5 w-5" />
                      Admin EAD
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* Vídeo Synthesia */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <iframe 
                  src="https://share.synthesia.io/84a6d089-2a26-4871-bc7b-0f1262605d5d?autoplay=1"
                  className="w-full h-[500px] border-0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title="Vídeo Apresentação Curso EAD Taxista ES"
                />
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">28h</div>
                  <div className="text-sm text-white/80">Carga Horária</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos do Curso */}
      <section id="cursos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800">Curriculum Oficial CONTRAN</Badge>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Módulos do Curso</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conteúdo baseado na Resolução CONTRAN nº 456/2013, com módulos obrigatórios e opcionais
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105 relative overflow-hidden">
              <CardHeader className="text-center">
                <div className="bg-blue-500/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-300/30">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Relações Humanas</CardTitle>
                <CardDescription className="text-gray-700">14 horas</CardDescription>
              </CardHeader>
              <CardContent className="bg-white/50 backdrop-blur-sm rounded-lg mx-4 mb-4 p-4">
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Imagem do taxista na sociedade</li>
                  <li>• Condições físicas e emocionais</li>
                  <li>• Segurança no transporte dos usuários</li>
                  <li>• Comportamento solidário no trânsito</li>
                </ul>
              </CardContent>
              
              {/* Hover Details */}
              <div className="absolute inset-0 bg-blue-600/95 backdrop-blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 overflow-y-auto">
                <div className="text-white">
                  <h3 className="font-bold text-lg mb-3 text-center">RELAÇÕES HUMANAS - 14h</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">A imagem do taxista na sociedade:</h4>
                      <p>• Postura, vestuário, higiene pessoal e do veículo</p>
                      <p>• Responsabilidade e disciplina no trabalho</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Condições físicas e emocionais:</h4>
                      <p>• Fadiga, tempo de direção e descanso</p>
                      <p>• Consumo de álcool e drogas</p>
                      <p>• Estresse (controle emocional)</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Segurança no transporte:</h4>
                      <p>• Cinto de segurança, lotação, velocidade</p>
                      <p>• Respeito à sinalização</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Atendimento especializado:</h4>
                      <p>• Gestantes, idosos, pessoas com deficiência</p>
                      <p>• Normas do órgão autorizatário</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105 relative overflow-hidden">
              <CardHeader className="text-center">
                <div className="bg-green-500/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-300/30">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Direção Defensiva</CardTitle>
                <CardDescription className="text-gray-700">8 horas</CardDescription>
              </CardHeader>
              <CardContent className="bg-white/50 backdrop-blur-sm rounded-lg mx-4 mb-4 p-4">
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Conceito de direção defensiva</li>
                  <li>• Riscos e perigos no trânsito</li>
                  <li>• Embarque e desembarque</li>
                  <li>• Prevenção de acidentes</li>
                </ul>
              </CardContent>
              
              {/* Hover Details */}
              <div className="absolute inset-0 bg-green-600/95 backdrop-blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 overflow-y-auto">
                <div className="text-white">
                  <h3 className="font-bold text-lg mb-3 text-center">DIREÇÃO DEFENSIVA - 8h</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">Conceito de direção defensiva</h4>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Riscos e perigos no trânsito:</h4>
                      <p>• Veículos, condutores, vias</p>
                      <p>• O ambiente e comportamento das pessoas</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Embarque e desembarque de passageiros</h4>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Ver e ser visto</h4>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Como evitar acidentes:</h4>
                      <p>• Especialmente com pedestres</p>
                      <p>• Motociclistas e ciclistas</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Equipamentos obrigatórios do veículo</h4>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105 relative overflow-hidden">
              <CardHeader className="text-center">
                <div className="bg-red-500/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-300/30">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Primeiros Socorros</CardTitle>
                <CardDescription className="text-gray-700">2 horas</CardDescription>
              </CardHeader>
              <CardContent className="bg-white/50 backdrop-blur-sm rounded-lg mx-4 mb-4 p-4">
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Sinalização do local</li>
                  <li>• Acionamento de recursos</li>
                  <li>• Verificação da vítima</li>
                  <li>• Cuidados básicos</li>
                </ul>
              </CardContent>
              
              {/* Hover Details */}
              <div className="absolute inset-0 bg-red-600/95 backdrop-blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 overflow-y-auto">
                <div className="text-white">
                  <h3 className="font-bold text-lg mb-3 text-center">PRIMEIROS SOCORROS - 2h</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">Sinalização do local</h4>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Acionamento de recursos:</h4>
                      <p>• Bombeiros, polícia, ambulância</p>
                      <p>• Concessionária da via, etc</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Verificação das condições gerais da vítima</h4>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Cuidados com a vítima</h4>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105 relative overflow-hidden">
              <CardHeader className="text-center">
                <div className="bg-purple-500/20 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-300/30">
                  <Car className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Mecânica Básica</CardTitle>
                <CardDescription className="text-gray-700">4 horas</CardDescription>
              </CardHeader>
              <CardContent className="bg-white/50 backdrop-blur-sm rounded-lg mx-4 mb-4 p-4">
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Funcionamento do motor</li>
                  <li>• Sistemas elétricos e eletrônicos</li>
                  <li>• Suspensão, freios, pneus</li>
                  <li>• Manutenção preventiva</li>
                </ul>
              </CardContent>
              
              {/* Hover Details */}
              <div className="absolute inset-0 bg-purple-600/95 backdrop-blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 overflow-y-auto">
                <div className="text-white">
                  <h3 className="font-bold text-lg mb-3 text-center">MECÂNICA BÁSICA - 4h</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-1">O funcionamento do motor</h4>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Sistemas elétricos e eletrônicos do veículo</h4>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Suspensão, freios, pneus:</h4>
                      <p>• Alinhamento e balanceamento do veículo</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Instrumentos de indicação e advertência eletrônica</h4>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Manutenção preventiva do veículo</h4>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Módulos Opcionais */}
          <div className="bg-gradient-to-r from-blue-50/50 to-green-50/50 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
            <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Módulos Opcionais Exclusivos</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-4 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm">60h</Badge>
                </div>
                <h5 className="font-semibold text-gray-900">Inglês Básico Turismo</h5>
              </div>
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-4 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm">35h</Badge>
                </div>
                <h5 className="font-semibold text-gray-900">Turismo Local</h5>
              </div>
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-4 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm">30h</Badge>
                </div>
                <h5 className="font-semibold text-gray-900">Atendimento ao Cliente</h5>
              </div>
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-4 rounded-lg shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                  <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm">20h</Badge>
                </div>
                <h5 className="font-semibold text-gray-900">Conhecimentos da Cidade</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pagamento PIX */}
      {/* Certificados */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-yellow-100 text-yellow-800">Sindicato Oficial</Badge>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                Sindicato que <span className="text-yellow-600">Representa a Categoria</span>
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Válidos em todo território nacional</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Aceitos pelo DETRAN de todos os estados</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Reconhecido pelo sindicato</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Reconhecido pelas prefeituras</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Reconhecido pelo Governo do Estado do Espírito Santo</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Reconhecido pelo Governo Federal</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Certificação Profissional</h4>
                <p className="text-gray-600">
                  Certificados válidos em todo território nacional, com reconhecimento oficial 
                  e QR Code de verificação anti-falsificação.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1574966390692-5140d4310743?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBlZHVjYXRpb258ZW58MHx8fHwxNzU3OTkwMDE3fDA&ixlib=rb-4.1.0&q=85"
                alt="Certificação Profissional"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Cadastro - Novo Sistema */}
      <section id="cadastro" className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white">Sistema Completo</Badge>
          <h3 className="text-4xl font-bold text-white mb-6">🚀 Faça Seu Cadastro</h3>
          <p className="text-xl text-blue-100 mb-4">
            Sistema avançado de cadastro com 6 etapas detalhadas e processo simplificado
          </p>
          <p className="text-lg text-blue-200 mb-8">
            ⚡ Upload de documentos • Dados completos • Pagamento seguro • Acesso imediato
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-center">
              <CardContent className="p-6">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Dados Completos</h4>
                <p className="text-blue-100 text-sm">Informações pessoais, profissionais e documentos</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-center">
              <CardContent className="p-6">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Processo Simplificado</h4>
                <p className="text-blue-100 text-sm">6 etapas rápidas e intuitivas</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-center">
              <CardContent className="p-6">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Pagamento PIX</h4>
                <p className="text-blue-100 text-sm">Pagamento rápido e seguro com confirmação automática</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleMultiStepRegister}
              className="bg-white text-blue-600 hover:bg-blue-50 px-12 py-4 rounded-lg text-xl font-bold transition-all duration-300 transform hover:scale-105 mb-6 shadow-lg"
            >
              📝 Fazer Inscrição Agora
            </button>
            <p className="text-blue-200 text-sm mt-4">
              💡 Processo 100% online • Certificado válido nacionalmente • Suporte 24h
            </p>
          </div>
        </div>
      </section>

      {/* Bot de Atendimento */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white">Atendimento Automático</Badge>
          <h3 className="text-4xl font-bold text-white mb-6">Bot de Atendimento 24h</h3>
          <p className="text-xl text-green-100 mb-8">
            Tire suas dúvidas, desbloqueie senhas ou equipamentos a qualquer hora
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-center">
              <CardContent className="p-6">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Desbloqueio de Dispositivos</h4>
                <p className="text-green-100 text-sm">Desbloqueie seu acesso em novos aparelhos</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-center">
              <CardContent className="p-6">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Recuperação de Senha</h4>
                <p className="text-green-100 text-sm">Recupere sua senha de acesso rapidamente</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-center">
              <CardContent className="p-6">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">Dúvidas sobre Cursos</h4>
                <p className="text-green-100 text-sm">Informações sobre valores e conteúdos</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white border-0"
              onClick={() => window.open('https://api.whatsapp.com/send?phone=5527319117277&text=Olá! Preciso de ajuda com o curso EAD Taxista ES', '_blank')}
            >
              <Phone className="mr-2 h-5 w-5" />
              📱 WhatsApp Suporte
            </Button>
            <Button 
              className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white border-0"
              onClick={() => window.open('mailto:suporte@sindtaxi-es.org?subject=Suporte EAD Taxista ES&body=Olá! Preciso de ajuda com o curso EAD Taxista ES', '_blank')}
            >
              <Mail className="mr-2 h-5 w-5" />
              📧 Email Suporte
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-center text-white">
              ℹ️ <strong>Suporte Técnico:</strong> Utilize preferencialmente o WhatsApp ou bot IA.<br />
              Caso não resolva, envie email para: <strong>suporte@sindtaxi-es.org</strong>
            </p>
          </div>
          
          <div className="mt-8 p-6 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
            <h4 className="font-semibold text-white mb-2">🤖 Atendimento Inteligente</h4>
            <p className="text-green-100 text-sm">
              Nosso bot está disponível 24 horas para resolver questões sobre:
              desbloqueios, senhas, valores, dúvidas do curso e suporte técnico.
            </p>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Central de Atendimento</h3>
            <p className="text-xl text-gray-600">Estamos aqui para ajudar você</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Telefone</h4>
                <p className="text-gray-600">(27) 3191-1727</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Mail className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-gray-600">diretoria@sindtaxi-es.org</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Website</h4>
                <p className="text-gray-600">sindtaxi-es.org</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Endereço</h4>
                <p className="text-gray-600 text-sm">
                  Rua Construtor Camilo Gianordoli 575<br/>
                  Vitória - ES<br/>
                  29045-180
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">EAD Taxista ES</h4>
                  <p className="text-gray-400 text-sm">Sindicato dos Taxistas</p>
                </div>
              </div>
              <p className="text-gray-400">
                Educação profissional de qualidade para taxistas do Espírito Santo.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Links Úteis</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#cursos" className="hover:text-white transition-colors">Cursos</a></li>
                <li><a href="#cadastro" className="hover:text-white transition-colors">Cadastro</a></li>
                <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="https://sindtaxi-es.org/" className="hover:text-white transition-colors">Portal do Taxista</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Endereço</h5>
              <div className="text-gray-400 text-sm space-y-1">
                <p>Rua Construtor Camilo Gianordoli 575</p>
                <p>Vitória, Espírito Santo</p>
                <p>CEP: 29045-180</p>
                <p className="mt-2">Email: diretoria@sindtaxi-es.org</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EAD Taxista ES - Sindicato dos Taxistas do Espírito Santo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
      </div>
      
      {/* Chat Bot */}
      <ChatBot />
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student-portal" element={<StudentPortalComplete />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-ead" element={<AdminDashboardEAD />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;