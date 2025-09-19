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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar ao Portal
              </Button>
              <div></div> {/* Spacer para centralizar o ícone */}
            </div>
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle>Portal do Aluno</CardTitle>
            <CardDescription>
              Acesse sua área de estudos do EAD Taxista ES
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => {
                    setLoginData({...loginData, email: e.target.value});
                    setLoginError(''); // Limpar erro ao digitar
                    setErrorModal({ show: false, type: '', message: '', title: '' }); // Limpar modal de erro
                  }}
                  placeholder="seu@email.com"
                  required
                  className={loginError ? 'border-red-500' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) => {
                      setLoginData({...loginData, password: e.target.value});
                      setLoginError(''); // Limpar erro ao digitar
                      setErrorModal({ show: false, type: '', message: '', title: '' }); // Limpar modal de erro
                    }}
                    placeholder="Sua senha temporária"
                    required
                    className={loginError ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use a senha enviada por email após seu cadastro
                </p>
              </div>
              
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{loginError}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verificando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>

              {/* Botão de Reset de Senha */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowResetModal(true)}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                🔑 Esqueci minha senha
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                <p>Problemas para acessar?</p>
                <Button variant="link" className="p-0 h-auto">
                  Recuperar senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Modal */}
        {errorModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-3">{errorModal.title}</h3>
                <p className="text-gray-600 mb-6">{errorModal.message}</p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setErrorModal({ show: false, type: '', message: '', title: '' })}
                    className="flex-1"
                  >
                    Tentar Novamente
                  </Button>
                  {errorModal.type === 'email_not_found' && (
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/'}
                      className="flex-1"
                    >
                      Fazer Cadastro
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="h-8 w-8 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3">🔑 Reset de Senha</h3>
                <p className="text-gray-600 mb-6">
                  Digite seu email para receber uma nova senha temporária
                </p>
                
                {!resetSuccess ? (
                  <div className="space-y-4">
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full"
                    />
                    
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        💡 A nova senha será enviada por email
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={handlePasswordReset}
                        disabled={resetLoading}
                        className="flex-1"
                      >
                        {resetLoading ? "Enviando..." : "📧 Enviar Nova Senha"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowResetModal(false);
                          setResetEmail('');
                          setResetSuccess(false);
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div className="text-left">
                          <p className="font-semibold text-green-800">Senha Enviada!</p>
                          <p className="text-sm text-green-700">
                            Uma nova senha foi enviada para {resetEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        📬 Verifique sua caixa de entrada e spam
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setShowResetModal(false);
                        setResetEmail('');
                        setResetSuccess(false);
                      }}
                      className="w-full"
                    >
                      ✅ Entendi, Vou Verificar
                    </Button>
                  </div>
                )}
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portal do Aluno</h1>
                <p className="text-sm text-gray-600">
                  Bem-vindo, {userInfo?.name || 'Aluno'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                setIsLoggedIn(false);
                setUserInfo(null);
                setLoginData({ email: '', password: '' });
                setLoginError('');
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">0%</div>
              <p className="text-sm text-gray-600">Progresso Geral</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">28h</div>
              <p className="text-sm text-gray-600">Carga Horária Total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">0/4</div>
              <p className="text-sm text-gray-600">Módulos Concluídos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">-</div>
              <p className="text-sm text-gray-600">Certificado</p>
            </CardContent>
          </Card>
        </div>

        {/* Aviso de Pagamento - Mostrar apenas se status for pending */}
        {userInfo?.status === 'pending' && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Lock className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Acesso Pendente</h3>
                  <p className="text-yellow-700">
                    Seu pagamento está sendo processado. O acesso aos módulos será liberado em até 5 minutos após a confirmação.
                  </p>
                  <div className="mt-2">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Status: Aguardando Confirmação PIX
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensagem de Acesso Liberado - Mostrar se status for paid ou active */}
        {(userInfo?.status === 'paid' || userInfo?.status === 'active') && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Acesso Liberado!</h3>
                  <p className="text-green-700">
                    Seu pagamento foi confirmado. Você já pode acessar todos os módulos do curso.
                  </p>
                  <div className="mt-2">
                    <Badge className="bg-green-100 text-green-800">
                      Status: Pagamento Confirmado ✅
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Módulos do Curso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      module.status === 'locked' ? 'bg-gray-100' : 
                      module.status === 'available' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {module.status === 'locked' ? (
                        <Lock className="h-6 w-6 text-gray-400" />
                      ) : module.status === 'available' ? (
                        <Play className="h-6 w-6 text-blue-600" />
                      ) : (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.duration}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={
                    module.status === 'locked' ? 'secondary' :
                    module.status === 'available' ? 'default' : 'default'
                  }>
                    {module.status === 'locked' ? 'Bloqueado' :
                     module.status === 'available' ? 'Disponível' : 'Concluído'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">{module.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso</span>
                    <span>{module.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    disabled={module.status === 'locked'}
                    className="flex-1"
                    variant={module.status === 'locked' ? 'secondary' : 'default'}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {module.status === 'locked' ? 'Acesso Bloqueado' : 'Assistir Aulas'}
                  </Button>
                  
                  <Button 
                    disabled={module.status === 'locked'}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Material
                  </Button>
                </div>
              </CardContent>
              
              {module.status === 'locked' && (
                <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Libere seu acesso</p>
                    <p className="text-sm text-gray-500">Confirme seu pagamento</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Próximos Passos */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>Complete estas etapas para avançar no curso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userInfo?.status === 'pending' ? (
                // Mostrar etapas para usuários com pagamento pendente
                <>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Confirmação de Pagamento</p>
                      <p className="text-sm text-gray-600">Aguardando confirmação do PIX</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-50">
                    <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Iniciar Módulo 1</p>
                      <p className="text-sm text-gray-600">Relações Humanas - 14h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-50">
                    <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Realizar Avaliação</p>
                      <p className="text-sm text-gray-600">Nota mínima: 7.0</p>
                    </div>
                  </div>
                </>
              ) : (
                // Mostrar etapas para usuários com pagamento confirmado
                <>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium">Pagamento Confirmado</p>
                      <p className="text-sm text-green-600">PIX processado com sucesso</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Iniciar Módulo 1</p>
                      <p className="text-sm text-gray-600">Relações Humanas - 14h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Realizar Avaliação</p>
                      <p className="text-sm text-gray-600">Nota mínima: 7.0</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPortal;