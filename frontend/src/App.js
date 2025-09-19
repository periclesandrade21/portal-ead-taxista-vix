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
import StudentPortal from "./components/StudentPortal";
import ChatBot from "./components/ChatBot";
import PaymentFlow from "./components/PaymentFlow";
import ProgressSteps from "./components/ProgressSteps";
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
  ChevronRight
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
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
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
    
    // Validar formulário
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
        city: finalCity
      });
      
      // Salvar informações sobre o envio da senha
      setPasswordSentInfo(response.data);
      
      // Mostrar popup de confirmação
      setShowPasswordPopup(true);
      
    } catch (error) {
      console.error("Erro ao realizar inscrição:", error);
      
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Erro: ${error.response.data.detail}`);
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

  return (
    <>
      {/* Popup de Senha Enviada */}
      {showPasswordPopup && passwordSentInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              {/* Ícone de sucesso */}
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🎉 Cadastro Realizado!
              </h3>
              
              {/* Mensagem principal */}
              <p className="text-lg text-gray-600 mb-6">
                {passwordSentInfo.message}
              </p>
              
              {/* Status de envio */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-3 text-gray-800">📱 Status do Envio:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email:
                    </span>
                    <Badge className={passwordSentInfo.password_sent_email ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {passwordSentInfo.password_sent_email ? "✅ Enviado" : "❌ Falhou"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      WhatsApp:
                    </span>
                    <Badge className={passwordSentInfo.password_sent_whatsapp ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {passwordSentInfo.password_sent_whatsapp ? "✅ Enviado" : "❌ Falhou"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Senha temporária (apenas para desenvolvimento) */}
              {passwordSentInfo.temporary_password && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Senha temporária:</strong> {passwordSentInfo.temporary_password}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    (Esta informação será removida em produção)
                  </p>
                </div>
              )}
              
              {/* Instruções */}
              <p className="text-sm text-gray-500 mb-6">
                Use sua senha para acessar o portal do aluno após confirmar o pagamento.
              </p>
              
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
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/student-portal">
                  <Button className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    <Users className="mr-2 h-5 w-5" />
                    Portal do Aluno
                  </Button>
                </Link>
                <Link to="/admin">
                  <Button variant="outline" className="px-8 py-4 text-lg border-2">
                    <Shield className="mr-2 h-5 w-5" />
                    Portal Admin
                  </Button>
                </Link>
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

      {/* Inscrição */}
      <section id="cadastro" className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Progress Steps */}
          <div className="mb-12">
            <ProgressSteps currentStep="registration" />  
          </div>
          
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-4">🚀 Comece Sua Jornada Agora</h3>
            <p className="text-xl text-blue-100 mb-2">
              Complete seu cadastro e prossiga para o pagamento PIX
            </p>
            <p className="text-lg text-blue-200">
              ⚡ Processo rápido e seguro - Acesso liberado automaticamente!
            </p>
          </div>

          <Card className="max-w-3xl mx-auto shadow-2xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
              <CardTitle className="text-3xl font-bold text-gray-800">📝 Dados do Taxista</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Preencha seus dados para criar sua conta
              </CardDescription>
              <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ <strong>Todos os campos são obrigatórios</strong> - Preencha com seus dados reais
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubscription} className="space-y-8">
                
                {/* Seção Dados Pessoais */}
                <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    👤 Dados Pessoais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nome Completo *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          // Limpar erro quando usuário digita
                          if (validationErrors.name) {
                            setValidationErrors(prev => ({...prev, name: ''}));
                          }
                        }}
                        placeholder="Ex: João Silva Santos"
                        required
                        className={`mt-2 h-12 text-lg ${validationErrors.name ? 'border-red-500' : ''}`}
                        maxLength="60"
                      />
                      {validationErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        👤 Use seu nome real completo (mínimo: nome + sobrenome)
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value.toLowerCase());
                          // Limpar erro quando usuário digita
                          if (validationErrors.email) {
                            setValidationErrors(prev => ({...prev, email: ''}));
                          }
                        }}
                        placeholder="exemplo@gmail.com"
                        required
                        className={`mt-2 h-12 text-lg ${validationErrors.email ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        📧 Será usado para envio da senha e comunicações importantes
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Telefone/WhatsApp *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(27) 99999-9999"
                        required
                        className="mt-2 h-12 text-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção Dados Profissionais */}
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    🚕 Dados do Taxista
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="carPlate" className="text-sm font-semibold text-gray-700">Placa do Veículo *</Label>
                      <Input
                        id="carPlate"
                        type="text"
                        value={carPlate}
                        onChange={(e) => {
                          setCarPlate(e.target.value.toUpperCase());
                          // Limpar erro quando usuário digita
                          if (validationErrors.carPlate) {
                            setValidationErrors(prev => ({...prev, carPlate: ''}));
                          }
                        }}
                        placeholder="ABC-1234-T, ABC1D23 ou ABC1234"
                        required
                        className={`mt-2 h-12 text-lg font-mono ${validationErrors.carPlate ? 'border-red-500' : ''}`}
                        maxLength="10"
                      />
                      {validationErrors.carPlate && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.carPlate}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos aceitos: ABC-1234-T (táxi), ABC1D23 (Mercosul), ABC1234
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="licenseNumber" className="text-sm font-semibold text-gray-700">Número do Alvará *</Label>
                      <Input
                        id="licenseNumber"
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => {
                          setLicenseNumber(e.target.value.toUpperCase());
                          // Limpar erro quando usuário digita
                          if (validationErrors.licenseNumber) {
                            setValidationErrors(prev => ({...prev, licenseNumber: ''}));
                          }
                        }}
                        placeholder="TA-12345, TAX-2023-1234, T-1234567"
                        required
                        className={`mt-2 h-12 text-lg ${validationErrors.licenseNumber ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.licenseNumber && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.licenseNumber}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos aceitos: TA-12345, TAX-2023-1234, T-1234567 ou apenas números
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="city" className="text-sm font-semibold text-gray-700">Cidade do Espírito Santo *</Label>
                      <select
                        id="city"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          // Limpar cidade personalizada se não for "Outra"
                          if (e.target.value !== "Outra") {
                            setCustomCity("");
                          }
                          // Limpar erro quando usuário seleciona
                          if (validationErrors.city) {
                            setValidationErrors(prev => ({...prev, city: ''}));
                          }
                        }}
                        required
                        className={`mt-2 h-12 text-lg w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.city ? 'border-red-500' : ''}`}
                      >
                        <option value="">Selecione sua cidade</option>
                        <option value="Vitória">Vitória</option>
                        <option value="Vila Velha">Vila Velha</option>
                        <option value="Serra">Serra</option>
                        <option value="Cariacica">Cariacica</option>
                        <option value="Viana">Viana</option>
                        <option value="Guarapari">Guarapari</option>
                        <option value="Cachoeiro de Itapemirim">Cachoeiro de Itapemirim</option>
                        <option value="Linhares">Linhares</option>
                        <option value="São Mateus">São Mateus</option>
                        <option value="Colatina">Colatina</option>
                        <option value="Aracruz">Aracruz</option>
                        <option value="Nova Venécia">Nova Venécia</option>
                        <option value="Domingos Martins">Domingos Martins</option>
                        <option value="Santa Teresa">Santa Teresa</option>
                        <option value="Castelo">Castelo</option>
                        <option value="Venda Nova do Imigrante">Venda Nova do Imigrante</option>
                        <option value="Iconha">Iconha</option>
                        <option value="Piúma">Piúma</option>
                        <option value="Anchieta">Anchieta</option>
                        <option value="Outra">🏙️ Outra cidade do ES</option>
                      </select>
                      {validationErrors.city && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                      )}
                      
                      {/* Campo adicional para cidade personalizada */}
                      {city === "Outra" && (
                        <div className="mt-4">
                          <Label htmlFor="customCity" className="text-sm font-semibold text-gray-700">
                            Qual sua cidade? *
                          </Label>
                          
                          {/* Botão de geolocalização */}
                          <div className="flex gap-2 mt-2">
                            <Input
                              id="customCity"
                              type="text"
                              value={customCity}
                              onChange={(e) => {
                                setCustomCity(e.target.value);
                                // Limpar erro quando usuário digita
                                if (validationErrors.customCity) {
                                  setValidationErrors(prev => ({...prev, customCity: ''}));
                                }
                              }}
                              placeholder="Digite o nome da sua cidade"
                              required
                              className={`h-12 text-lg flex-1 ${validationErrors.customCity ? 'border-red-500' : ''}`}
                            />
                            <Button
                              type="button"
                              onClick={detectUserLocation}
                              disabled={isDetectingLocation}
                              className="h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isDetectingLocation ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  <MapPin className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  📍
                                </div>
                              )}
                            </Button>
                          </div>
                          
                          {validationErrors.customCity && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.customCity}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            📍 Digite sua cidade no ES ou clique no botão de localização para detectar automaticamente
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações importantes */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <span className="text-blue-600 text-xl">💡</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-blue-800 mb-2">Importante:</h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Use seus dados reais para garantir a validade do certificado</li>
                        <li>• O certificado será emitido com o nome informado aqui</li>
                        <li>• WhatsApp será usado para suporte e comunicações importantes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botão de envio melhorado */}
                <div className="text-center pt-4">
                  <Button 
                    type="submit" 
                    className="w-full py-6 text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <CreditCard className="mr-3 h-6 w-6" />
                    💳 Finalizar Pagamento
                  </Button>
                  
                  <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-1">✅</span>
                      Pagamento seguro
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-1">⚡</span>
                      Aprovação instantânea
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-600 mr-1">🔒</span>
                      Dados protegidos
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
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
          <Route path="/student-portal" element={<StudentPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;