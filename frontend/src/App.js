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
  MapPin
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubscription = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/subscribe`, {
        name,
        email,
        phone
      });
      alert("Inscrição realizada com sucesso! Você receberá mais informações em breve.");
      setName("");
      setEmail("");
      setPhone("");
    } catch (error) {
      console.error("Erro ao realizar inscrição:", error);
      alert("Erro ao realizar inscrição. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Educação <span className="text-blue-600">Profissional</span> para 
                <span className="text-green-600 block mt-2">Taxistas do ES</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Capacite-se com nosso curso EAD completo. Certificados reconhecidos pelo DETRAN, 
                válidos em todo território nacional e aceitos por todas as cooperativas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Começar Agora
                </Button>
                <Button variant="outline" className="px-8 py-4 text-lg border-2">
                  <Video className="mr-2 h-5 w-5" />
                  Ver Demonstração
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1642331395578-62fc20996c2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHx0YXhpJTIwZWR1Y2F0aW9ufGVufDB8fHx8MTc1Nzk5MDAwM3ww&ixlib=rb-4.1.0&q=85"
                alt="Taxi Profissional"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
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
              <Badge className="mb-4 bg-yellow-100 text-yellow-800">Certificação Oficial</Badge>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                Certificados <span className="text-yellow-600">Reconhecidos</span>
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
                  <span className="text-gray-700">Reconhecidos por cooperativas de taxi</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Válidos para empresas de aplicativo</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">QR Code de verificação anti-falsificação</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Certificado Automático</h4>
                <p className="text-gray-600">
                  Receba seu certificado automaticamente após obter nota igual ou superior a 7 
                  e concluir todos os módulos obrigatórios.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1554068741-2456f561031a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHw0fHxicmF6aWxpYW4lMjB0YXhpfGVufDB8fHx8MTc1Nzk5MDQwMnww&ixlib=rb-4.1.0&q=85"
                alt="Taxi Brasileiro com Bandeira do Brasil"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-green-600/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-white font-semibold text-sm">🏆 Certificação Nacional</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria de Táxis Brasileiros */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800">Nosso Brasil</Badge>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Táxis do Brasil</h3>
            <p className="text-xl text-gray-600">Profissionais como você, de todo o país</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <img 
                src="https://images.unsplash.com/photo-1590905652146-8e169292f5de?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxlc3Bpcml0byUyMHNhbnRvJTIwdGF4aXxlbnwwfHx8fDE3NTc5OTA0MDJ8MA&ixlib=rb-4.1.0&q=85"
                alt="Taxi em operação"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-semibold">Taxi Clássico</h4>
                <p className="text-sm text-gray-200">Tradição no transporte</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <img 
                src="https://images.unsplash.com/photo-1648931140039-edd56e11179b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHw0fHxicmF6aWxpYW4lMjB0YXhpfGVufDB8fHx8MTc1Nzk5MDQwMnww&ixlib=rb-4.1.0&q=85"
                alt="Taxi amarelo brasileiro"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-semibold">Taxi Amarelo</h4>
                <p className="text-sm text-gray-200">Padrão brasileiro</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <img 
                src="https://images.unsplash.com/photo-1650383045243-9c37a9c5f1c8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjB0YXhpfGVufDB8fHx8MTc1Nzk5MDQwMnww&ixlib=rb-4.1.0&q=85"
                alt="Taxi brasileiro estacionado"
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="font-semibold">Profissional</h4>
                <p className="text-sm text-gray-200">Sempre pronto</p>
              </div>
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
                
                <Button type="submit" className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Quero Começar Agora
                </Button>
              </form>
            </CardContent>
          </Card>
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
                <h4 className="font-semibold mb-2">WhatsApp</h4>
                <p className="text-gray-600">(27) 9996-5200</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Mail className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-gray-600">contato@taxistaead.com.br</p>
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
                <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Horários</h4>
                <p className="text-gray-600 text-sm">
                  Seg-Sex: 7h às 19h<br/>
                  Sáb: 8h às 14h
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
              <h5 className="font-semibold mb-4">Certificações</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>✓ Resolução CONTRAN nº 456/2013</li>
                <li>✓ Reconhecido pelo DETRAN</li>
                <li>✓ Válido nacionalmente</li>
                <li>✓ Anti-falsificação</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EAD Taxista ES - Sindicato dos Taxistas do Espírito Santo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;