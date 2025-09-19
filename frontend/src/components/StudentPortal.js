import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Eye, 
  EyeOff,
  Edit, 
  Play,
  Download,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Lock,
  Unlock,
  Gift,
  Percent,
  RefreshCw,
  Key,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  FileText,
  HelpCircle,
  Star,
  Trophy,
  Target,
  Bookmark,
  Volume2,
  Settings,
  CreditCard,
  Receipt,
  GraduationCap,
  Shield,
  Bell,
  Home,
  LogOut,
  Camera
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentPortal = () => {
  // Estados de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [user, setUser] = useState(null);

  // Estados do portal
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleVideos, setModuleVideos] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [currentVideo, setCurrentVideo] = useState(null);
  const [quizModal, setQuizModal] = useState({ show: false, questions: [], currentQuestion: 0, answers: [], score: null });
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Estados de perfil
  const [profileModal, setProfileModal] = useState({ show: false });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    car_plate: '',
    license_number: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        setProfileData({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          city: response.data.user.city || '',
          car_plate: response.data.user.car_plate || '',
          license_number: response.data.user.license_number || ''
        });
        await loadStudentData(response.data.user.id);
      } else {
        alert('Credenciais inválidas. Verifique email e senha.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.response?.status === 402) {
        alert('⏳ Seu pagamento ainda não foi confirmado. Por favor, aguarde a confirmação ou entre em contato conosco.');
      } else {
        alert('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (userId) => {
    try {
      // Carregar módulos
      const modulesResponse = await axios.get(`${API}/modules`);
      setModules(modulesResponse.data.modules || []);

      // Carregar progresso do usuário
      const progressResponse = await axios.get(`${API}/progress/${userId}`);
      const progressData = progressResponse.data.progress || [];
      
      const progressMap = {};
      progressData.forEach(p => {
        progressMap[p.module_id] = p;
      });
      setUserProgress(progressMap);

      // Carregar notificações (mock)
      setNotifications([
        { id: 1, type: 'success', message: 'Bem-vindo ao Portal EAD!', time: '2 min atrás' },
        { id: 2, type: 'info', message: 'Novo módulo disponível: Mecânica Básica', time: '1 hora atrás' },
        { id: 3, type: 'warning', message: 'Lembre-se de completar o quiz do módulo anterior', time: '2 horas atrás' }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados do estudante:', error);
    }
  };

  const loadModuleVideos = async (moduleId) => {
    try {
      const response = await axios.get(`${API}/modules/${moduleId}/videos`);
      setModuleVideos(response.data.videos || []);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    }
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setActiveTab('content');
    loadModuleVideos(module.id);
  };

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
    setActiveTab('video-player');
  };

  const calculateModuleProgress = (moduleId) => {
    const progress = userProgress[moduleId];
    if (!progress) return 0;
    
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    
    const totalVideos = moduleVideos.length || 1;
    const watchedVideos = progress.videos_watched?.length || 0;
    
    return Math.round((watchedVideos / totalVideos) * 100);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/auth/reset-password`, { email: resetEmail });
      alert('📧 Instruções de redefinição de senha enviadas para seu email!');
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      console.error('Erro ao solicitar reset:', error);
      alert('Erro ao solicitar redefinição de senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('dashboard');
    setSelectedModule(null);
    setCurrentVideo(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    // Simular envio de mensagem
    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'student',
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simular resposta automática
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        text: 'Obrigado pela sua mensagem! Nossa equipe responderá em breve.',
        sender: 'support',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, response]);
    }, 1000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Portal do Aluno</h1>
            <p className="text-blue-200">EAD Taxista ES</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-white mb-2 block">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60 pr-10"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <Button
              variant="ghost"
              onClick={() => setShowResetModal(true)}
              className="text-blue-200 hover:text-white hover:bg-white/10"
            >
              <Key className="h-4 w-4 mr-2" />
              Esqueci minha senha
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-blue-200 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar ao Portal
            </Button>
          </div>
        </div>

        {/* Modal de Reset de Senha */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Redefinir Senha</h3>
              <p className="text-gray-600 mb-4">
                Digite seu email para receber instruções de redefinição de senha.
              </p>
              <div className="space-y-4">
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowResetModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Portal EAD</h1>
                <p className="text-sm text-gray-500">Taxista ES</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'Aluno'}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation */}
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Disciplinas</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Conteúdo</span>
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Notas</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Suporte</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Progresso Geral</p>
                      <p className="text-2xl font-bold">0%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Módulos Concluídos</p>
                      <p className="text-2xl font-bold">0/{modules.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Horas Estudadas</p>
                      <p className="text-2xl font-bold">0h</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Certificado</p>
                      <p className="text-2xl font-bold">-</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Welcome Message */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Bem-vindo ao Portal EAD Taxista ES!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Comece sua jornada de aprendizado acessando os módulos disponíveis.
                  </p>
                  <Button onClick={() => setActiveTab('modules')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ver Disciplinas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {modules.map((module) => (
                <Card key={module.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <CardDescription>{module.duration || 'Duração não definida'}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">Disponível</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{module.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{calculateModuleProgress(module.id)}%</span>
                      </div>
                      <Progress value={calculateModuleProgress(module.id)} className="h-2" />
                    </div>
                    <Button 
                      onClick={() => handleModuleSelect(module)}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Acessar Módulo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            {selectedModule ? (
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('modules')}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedModule.title}</h2>
                    <p className="text-gray-600">{selectedModule.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {moduleVideos.map((video, index) => (
                    <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => handleVideoSelect(video)}>
                      <CardContent className="p-4">
                        <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <Play className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="font-semibold mb-2">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Aula {index + 1}</span>
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Selecione um Módulo
                </h3>
                <p className="text-gray-600 mb-4">
                  Escolha um módulo na aba Disciplinas para ver o conteúdo
                </p>
                <Button onClick={() => setActiveTab('modules')}>
                  Ver Disciplinas
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Other tabs with placeholder content */}
          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notas e Avaliações</CardTitle>
                <CardDescription>Acompanhe seu desempenho nas avaliações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma avaliação realizada ainda</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendário Acadêmico</CardTitle>
                <CardDescription>Datas importantes e prazos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Calendário em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Suporte ao Aluno</CardTitle>
                <CardDescription>Entre em contato conosco</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {chatMessages.length === 0 ? (
                      <p className="text-gray-500 text-center">Nenhuma mensagem ainda</p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className={`mb-3 ${msg.sender === 'student' ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block p-2 rounded-lg max-w-xs ${
                            msg.sender === 'student' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border'
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      Enviar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Financeiras</CardTitle>
                <CardDescription>Status de pagamento e faturas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Informações financeiras em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>Gerencie suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button className="w-full md:w-auto">
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentPortal;