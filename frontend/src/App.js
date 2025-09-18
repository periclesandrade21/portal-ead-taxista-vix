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
  const [carPlate, setCarPlate] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    try {
      const response = await axios.post(`${API}/subscribe`, {
        name,
        email,
        phone,
        carPlate,
        licenseNumber
      });
      alert("Inscrição realizada com sucesso! Você receberá mais informações em breve.");
      setName("");
      setEmail("");
      setPhone("");
      setCarPlate("");
      setLicenseNumber("");
    } catch (error) {
      console.error("Erro ao realizar inscrição:", error);
      alert("Erro ao realizar inscrição. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* Marca d'água da Terceira Ponte */}
      <div 
        className="fixed inset-0 z-0 opacity-5 bg-center bg-no-repeat bg-contain"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1725132620980-808ebeee990b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHx0ZXJjZWlyYSUyMHBvbnRlJTIwZXNwaXJpdG8lMjBzYW50b3xlbnwwfHx8fDE3NTc5OTg1NDF8MA&ixlib=rb-4.1.0&q=85')",
          backgroundSize: '60%',
          backgroundPosition: 'center center'
        }}
      />
      
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
              <a href="#pagamento" className="text-gray-600 hover:text-blue-600 font-medium">Pagamento</a>
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
      <section id="pagamento" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800">Pagamento Seguro</Badge>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Formas de Pagamento</h3>
            <p className="text-xl text-gray-600">Pague de forma rápida e segura via PIX</p>
          </div>

          <Card className="max-w-2xl mx-auto shadow-xl border-2">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Pagamento via PIX</CardTitle>
              <CardDescription className="text-blue-100">Rápido, seguro e instantâneo</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Tabs defaultValue="qr" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="qr" className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    CNPJ PIX
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="qr" className="text-center space-y-6">
                  <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                    <img 
                      src="https://customer-assets.emergentagent.com/job_af15f3b0-8220-4468-b0f8-b470f6d459d9/artifacts/2lwlxi11_QR-code.jpg"
                      alt="QR Code PIX"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-gray-600">Escaneie o QR Code com seu app bancário</p>
                </TabsContent>
                
                <TabsContent value="phone" className="text-center space-y-6">
                  <div className="bg-blue-50 p-8 rounded-lg">
                    <div className="text-4xl mb-4">🏢</div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">02.914.651/0001-12</div>
                    <p className="text-gray-600">Use este CNPJ como chave PIX para realizar o pagamento</p>
                  </div>
                  <Button 
                    onClick={() => navigator.clipboard.writeText('02914651000112')}
                    variant="outline"
                    className="w-full"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Copiar CNPJ PIX
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="mt-8 p-6 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h5 className="font-semibold text-green-800">Após o pagamento:</h5>
                </div>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>✓ Acesso liberado em até 5 minutos</li>
                  <li>✓ Envio de credenciais por email</li>
                  <li>✓ Suporte prioritário via WhatsApp</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-white mb-4">Comece Sua Jornada Agora</h3>
            <p className="text-xl text-blue-100">
              Não perca tempo - Sua carreira não pode esperar!
            </p>
          </div>

          <Card className="max-w-2xl mx-auto shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Quero Começar Agora</CardTitle>
              <CardDescription>Preencha seus dados para receber mais informações</CardDescription>
              <div className="mt-2 text-sm text-red-600 font-medium">
                * Todos os campos são obrigatórios
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscription} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(27) 99999-9999"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="carPlate">Placa do Veículo</Label>
                  <Input
                    id="carPlate"
                    type="text"
                    value={carPlate}
                    onChange={(e) => setCarPlate(e.target.value.toUpperCase())}
                    placeholder="ABC-1234 ou ABC1D23"
                    required
                    className="mt-2"
                    maxLength="8"
                  />
                </div>

                <div>
                  <Label htmlFor="licenseNumber">Número do Alvará</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="Número do alvará de taxista"
                    required
                    className="mt-2"
                  />
                </div>
                
                <Button type="submit" className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Quero Começar Agora
                </Button>
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
              onClick={() => window.open('https://wa.me/5527319117277?text=Olá! Preciso de ajuda com o curso EAD Taxista ES', '_blank')}
            >
              <Phone className="mr-2 h-5 w-5" />
              WhatsApp Bot
            </Button>
            <Button 
              variant="outline" 
              className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-green-600"
              onClick={() => window.open('tel:27319117277', '_blank')}
            >
              <Phone className="mr-2 h-5 w-5" />
              Ligar Agora
            </Button>
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
                <li><a href="#pagamento" className="hover:text-white transition-colors">Pagamento</a></li>
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