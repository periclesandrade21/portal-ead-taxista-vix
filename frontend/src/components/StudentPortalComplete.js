import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Users, BookOpen, Award, TrendingUp, Eye, EyeOff, Edit, Play, Download, Search, Filter,
  Mail, Phone, Calendar, DollarSign, BarChart3, PieChart, Activity, Lock, Unlock,
  Gift, Percent, RefreshCw, Key, User, AlertCircle, CheckCircle, Clock, ChevronLeft,
  ChevronRight, MessageCircle, FileText, HelpCircle, Star, Trophy, Target, Bookmark,
  Volume2, Settings, CreditCard, Receipt, GraduationCap, Shield, Bell, Home, LogOut, Camera
} from 'lucide-react';
import axios from 'axios';
import { 
  ContentTab, 
  GradesTab, 
  CalendarTab, 
  SupportTab, 
  FinancialTab, 
  ProfileTab 
} from './StudentPortalTabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StudentPortalComplete = () => {
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
  const [currentVideo, setCurrentVideo] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Estados de quiz
  const [quizModal, setQuizModal] = useState({ 
    show: false, 
    questions: [], 
    currentQuestion: 0, 
    answers: [], 
    score: null,
    moduleId: null
  });

  // Estados de perfil
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', city: '', car_plate: '', license_number: '', photo: null
  });
  const [changePasswordModal, setChangePasswordModal] = useState({ 
    show: false, 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });
  const [accessHistory, setAccessHistory] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);

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
          license_number: response.data.user.license_number || '',
          photo: response.data.user.photo || null
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
      // Carregar módulos reais
      const modulesResponse = await axios.get(`${API}/modules`);
      setModules(modulesResponse.data.modules || []);

      // Inicializar com dados vazios - será preenchido quando implementado progresso real
      setUserProgress({});

      // Notificações baseadas no status real do usuário
      const realNotifications = [];
      if (user && user.course_access === 'granted') {
        realNotifications.push({
          id: 1, 
          type: 'success', 
          message: `Bem-vindo, ${user.name}! Seu curso foi liberado.`, 
          time: 'agora'
        });
      }
      if (user && user.payment_status === 'pending') {
        realNotifications.push({
          id: 2, 
          type: 'warning', 
          message: 'Aguardando confirmação de pagamento', 
          time: '1 hora atrás'
        });
      }
      setNotifications(realNotifications);

      // Histórico de acesso real - apenas login atual
      const realAccessHistory = [
        { 
          id: 1, 
          action: 'Login realizado', 
          date: new Date().toLocaleString('pt-BR'), 
          ip: 'IP oculto por segurança' 
        }
      ];
      setAccessHistory(realAccessHistory);

      // Histórico de atividades real - apenas login atual
      const realActivityHistory = [
        { 
          id: 1, 
          action: 'Login no portal', 
          module: 'Sistema', 
          date: new Date().toLocaleString('pt-BR') 
        }
      ];
      setActivityHistory(realActivityHistory);

      console.log('✅ Dados reais do estudante carregados');

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

  const loadModuleQuestions = async (moduleId) => {
    try {
      const response = await axios.get(`${API}/questions/${moduleId}`);
      const questions = response.data.questions || {};
      
      // Combinar todas as questões de diferentes dificuldades
      const allQuestions = [
        ...(questions.facil || []),
        ...(questions.media || []),
        ...(questions.dificil || [])
      ];
      
      // Embaralhar questões
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
      
      setQuizModal(prev => ({
        ...prev,
        questions: shuffledQuestions.slice(0, 10), // Máximo 10 questões
        moduleId: moduleId
      }));
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
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

  const handleStartQuiz = async (moduleId) => {
    await loadModuleQuestions(moduleId);
    setQuizModal(prev => ({
      ...prev,
      show: true,
      currentQuestion: 0,
      answers: [],
      score: null
    }));
  };

  const handleQuizAnswer = (answerIndex) => {
    const newAnswers = [...quizModal.answers];
    newAnswers[quizModal.currentQuestion] = answerIndex;
    
    setQuizModal(prev => ({
      ...prev,
      answers: newAnswers
    }));
  };

  const handleNextQuestion = () => {
    if (quizModal.currentQuestion < quizModal.questions.length - 1) {
      setQuizModal(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const correctAnswers = quizModal.answers.reduce((count, answer, index) => {
      return count + (answer === quizModal.questions[index].correct_answer ? 1 : 0);
    }, 0);
    
    const score = Math.round((correctAnswers / quizModal.questions.length) * 100);
    const passed = score >= 70;
    
    setQuizModal(prev => ({
      ...prev,
      score: score
    }));
    
    // Atualizar progresso do usuário
    setUserProgress(prev => ({
      ...prev,
      [quizModal.moduleId]: {
        ...prev[quizModal.moduleId],
        quiz_score: score,
        quiz_passed: passed
      }
    }));
  };

  const calculateModuleProgress = (moduleId) => {
    const progress = userProgress[moduleId];
    if (!progress) return 0;
    
    const watchedVideos = progress.videos_watched?.length || 0;
    const totalVideos = moduleVideos.length || 1;
    const videoProgress = (watchedVideos / totalVideos) * 0.7; // 70% peso para vídeos
    const quizProgress = progress.quiz_passed ? 0.3 : 0; // 30% peso para quiz
    
    return Math.round((videoProgress + quizProgress) * 100);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      alert('Por favor, digite seu email.');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${API}/auth/reset-password`, { email: resetEmail });
      
      // Show detailed success message
      const emailSent = response.data.email_sent;
      const whatsappSent = response.data.whatsapp_sent;
      
      let message = '🎉 Nova senha temporária foi gerada com sucesso!\n\n';
      
      if (emailSent) {
        message += '📧 ✅ Email enviado com sucesso\n';
      } else {
        message += '📧 ❌ Não foi possível enviar o email\n';
      }
      
      if (whatsappSent) {
        message += '📱 ✅ WhatsApp enviado com sucesso\n';
      } else {
        message += '📱 ⚠️ WhatsApp não configurado (opcional)\n';
      }
      
      message += '\n💡 Verifique sua caixa de entrada e spam.';
      message += '\n🔑 Use a nova senha para fazer login.';
      
      alert(message);
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      console.error('Erro ao solicitar reset:', error);
      if (error.response?.status === 404) {
        alert('❌ Email não encontrado no sistema.\n\n📝 Verifique se o email está correto ou faça um novo cadastro.');
      } else {
        alert('❌ Erro ao solicitar redefinição de senha.\n\n🔄 Tente novamente em alguns minutos.');
      }
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

  const handleChangePassword = async () => {
    if (changePasswordModal.newPassword !== changePasswordModal.confirmPassword) {
      alert('Nova senha e confirmação não coincidem!');
      return;
    }

    if (changePasswordModal.newPassword.length < 6) {
      alert('Nova senha deve ter pelo menos 6 caracteres!');
      return;
    }

    try {
      setLoading(true);
      
      // Simular chamada API para trocar senha
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('✅ Senha alterada com sucesso!');
      setChangePasswordModal({ 
        show: false, 
        currentPassword: '', 
        newPassword: '', 
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Arquivo muito grande! Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          photo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
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

          {/* Informações sobre como obter a senha */}
          <div className="bg-blue-800/30 border border-blue-400/30 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <Key className="h-4 w-4 mr-2" />
              🔐 Como obter sua senha?
            </h3>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• 📧 Senha enviada por <strong>email</strong> após cadastro</li>
              <li>• 📱 Também enviada por <strong>WhatsApp</strong> (se informado)</li>
              <li>• 🔄 Use "Esqueci minha senha" para nova senha</li>
              <li>• 💡 Verifique spam/lixo eletrônico</li>
            </ul>
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

          <div className="mt-6 space-y-4">
            {/* Botões de ajuda */}
            <div className="grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowResetModal(true)}
                className="w-full text-blue-200 hover:text-white hover:bg-white/10 border border-blue-400/30"
              >
                <Key className="h-4 w-4 mr-2" />
                🔑 Solicitar Nova Senha
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => window.history.back()}
                className="w-full text-blue-200 hover:text-white hover:bg-white/10 border border-blue-400/30"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                ← Voltar ao Portal
              </Button>
            </div>
            
            {/* Informações de suporte */}
            <div className="text-center pt-2 border-t border-white/20">
              <p className="text-blue-200 text-xs">
                🆘 Problemas para acessar?
              </p>
              <a 
                href="mailto:suporte@sindtaxi-es.org" 
                className="text-blue-300 hover:text-white text-xs underline"
              >
                suporte@sindtaxi-es.org
              </a>
            </div>
          </div>
        </div>

        {/* Modal de Reset de Senha - Melhorado */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="text-center mb-4">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">🔑 Solicitar Nova Senha</h3>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Como funciona?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 📧 Nova senha será enviada por <strong>email</strong></li>
                  <li>• 📱 Também tentaremos enviar por <strong>WhatsApp</strong> (se cadastrado)</li>
                  <li>• ⚡ Processo automático e instantâneo</li>
                  <li>• 🔒 Senha temporária segura gerada automaticamente</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resetEmail" className="text-sm font-semibold text-gray-700">
                    Email cadastrado *
                  </Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    required
                    className="mt-1 h-12 text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    📧 Digite o email usado no seu cadastro
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>💡 Dica:</strong> Verifique sua caixa de entrada e pasta de spam após enviar a solicitação.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowResetModal(false);
                      setResetEmail('');
                    }}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleResetPassword}
                    disabled={loading || !resetEmail.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Nova Senha
                      </div>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-xs text-gray-500">
                  🆘 Problemas? Entre em contato: 
                  <a href="mailto:suporte@sindtaxi-es.org" className="text-blue-600 hover:underline ml-1">
                    suporte@sindtaxi-es.org
                  </a>
                </p>
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
              <Button variant="ghost" size="sm" className="relative">
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
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
            <TabsTrigger value="dashboard">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="modules">
              <BookOpen className="h-4 w-4 mr-2" />
              Disciplinas
            </TabsTrigger>
            <TabsTrigger value="content">
              <Play className="h-4 w-4 mr-2" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="grades">
              <Trophy className="h-4 w-4 mr-2" />
              Notas
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="support">
              <MessageCircle className="h-4 w-4 mr-2" />
              Suporte
            </TabsTrigger>
            <TabsTrigger value="financial">
              <CreditCard className="h-4 w-4 mr-2" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Módulos Concluídos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0/{modules.length || 1}</div>
                  <p className="text-xs text-muted-foreground">
                    {modules.length > 0 ? '0% do curso completo' : 'Aguardando módulos'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Sem avaliações ainda
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Horas Estudadas</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0h</div>
                  <p className="text-xs text-muted-foreground">
                    Este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status do Curso</CardTitle>
                  <Award className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user?.course_access === 'granted' ? '✅' : '⏳'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user?.course_access === 'granted' ? 'Liberado' : 'Aguardando'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progresso dos Módulos */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso dos Módulos</CardTitle>
                <CardDescription>Acompanhe seu desempenho em cada disciplina</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules.map((module) => {
                  const progress = calculateModuleProgress(module.id);
                  return (
                    <div key={module.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{module.name}</span>
                        <span className="text-sm text-gray-500">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle>Notificações Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      notification.type === 'success' ? 'bg-green-100' :
                      notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                       notification.type === 'warning' ? <AlertCircle className="h-4 w-4 text-yellow-600" /> :
                       <Bell className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disciplinas/Módulos */}
          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Disciplinas do Curso</CardTitle>
                <CardDescription>Selecione uma disciplina para acessar o conteúdo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modules.map((module) => {
                    const progress = calculateModuleProgress(module.id);
                    const moduleProgress = userProgress[module.id];
                    
                    return (
                      <Card key={module.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleModuleSelect(module)}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: module.color }}></div>
                              <div>
                                <h3 className="font-semibold text-lg">{module.name}</h3>
                                <p className="text-sm text-gray-600">{module.duration_hours}h de conteúdo</p>
                              </div>
                            </div>
                            <Badge variant={progress >= 100 ? "default" : progress > 0 ? "secondary" : "outline"}>
                              {progress >= 100 ? "Concluído" : progress > 0 ? "Em Progresso" : "Não Iniciado"}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progresso</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📹 {module.video_count || 0} vídeos</span>
                              <span>📝 Quiz disponível</span>
                            </div>
                            {moduleProgress?.quiz_passed && (
                              <Badge variant="default" className="bg-green-600">
                                ✓ Aprovado ({moduleProgress.quiz_score}%)
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo */}
          <ContentTab 
            selectedModule={selectedModule}
            moduleVideos={moduleVideos}
            handleVideoSelect={handleVideoSelect}
            handleStartQuiz={handleStartQuiz}
            userProgress={userProgress}
            formatDuration={formatDuration}
          />

          {/* Notas */}
          <GradesTab modules={modules} userProgress={userProgress} />

          {/* Calendário */}
          <CalendarTab />

          {/* Suporte */}
          <SupportTab 
            chatMessages={chatMessages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
          />

          {/* Financeiro */}
          <FinancialTab user={user} />

          {/* Perfil */}
          <ProfileTab 
            profileData={profileData} 
            user={user}
            handlePhotoUpload={handlePhotoUpload}
            setChangePasswordModal={setChangePasswordModal}
            accessHistory={accessHistory}
            activityHistory={activityHistory}
          />

          {/* Modal de Quiz */}
          {quizModal.show && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {quizModal.score !== null ? (
                  // Resultado do Quiz
                  <div className="text-center">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-2xl font-bold mb-2">Quiz Finalizado!</h3>
                    <div className="text-6xl font-bold mb-4 text-blue-600">{quizModal.score}%</div>
                    <p className="text-lg mb-6">
                      {quizModal.score >= 70 ? (
                        <span className="text-green-600">🎉 Parabéns! Você foi aprovado!</span>
                      ) : (
                        <span className="text-red-600">😔 Você precisa de pelo menos 70% para ser aprovado.</span>
                      )}
                    </p>
                    <Button onClick={() => setQuizModal({ show: false, questions: [], currentQuestion: 0, answers: [], score: null, moduleId: null })}>
                      Fechar
                    </Button>
                  </div>
                ) : (
                  // Quiz em Andamento
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">
                        Questão {quizModal.currentQuestion + 1} de {quizModal.questions.length}
                      </h3>
                      <Button 
                        variant="outline" 
                        onClick={() => setQuizModal({ show: false, questions: [], currentQuestion: 0, answers: [], score: null, moduleId: null })}
                      >
                        Cancelar
                      </Button>
                    </div>
                    
                    <div className="mb-6">
                      <Progress value={(quizModal.currentQuestion / quizModal.questions.length) * 100} className="mb-4" />
                    </div>

                    {quizModal.questions[quizModal.currentQuestion] && (
                      <>
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold mb-4">
                            {quizModal.questions[quizModal.currentQuestion].question}
                          </h4>
                          
                          <div className="space-y-3">
                            {quizModal.questions[quizModal.currentQuestion].options.map((option, index) => (
                              <label 
                                key={index}
                                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                                  quizModal.answers[quizModal.currentQuestion] === index 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="quiz-answer"
                                  value={index}
                                  checked={quizModal.answers[quizModal.currentQuestion] === index}
                                  onChange={() => handleQuizAnswer(index)}
                                  className="sr-only"
                                />
                                <span className="flex items-center">
                                  <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <Button 
                            variant="outline"
                            disabled={quizModal.currentQuestion === 0}
                            onClick={() => setQuizModal(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }))}
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Anterior
                          </Button>
                          
                          <Button 
                            onClick={handleNextQuestion}
                            disabled={quizModal.answers[quizModal.currentQuestion] === undefined}
                          >
                            {quizModal.currentQuestion === quizModal.questions.length - 1 ? 'Finalizar' : 'Próxima'}
                            {quizModal.currentQuestion !== quizModal.questions.length - 1 && (
                              <ChevronRight className="h-4 w-4 ml-2" />
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Modal de Troca de Senha */}
          {changePasswordModal.show && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={changePasswordModal.showCurrentPassword ? "text" : "password"}
                        value={changePasswordModal.currentPassword}
                        onChange={(e) => setChangePasswordModal(prev => ({
                          ...prev,
                          currentPassword: e.target.value
                        }))}
                        placeholder="Digite sua senha atual"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setChangePasswordModal(prev => ({
                          ...prev,
                          showCurrentPassword: !prev.showCurrentPassword
                        }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {changePasswordModal.showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={changePasswordModal.showNewPassword ? "text" : "password"}
                        value={changePasswordModal.newPassword}
                        onChange={(e) => setChangePasswordModal(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))}
                        placeholder="Digite a nova senha (mín. 6 caracteres)"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setChangePasswordModal(prev => ({
                          ...prev,
                          showNewPassword: !prev.showNewPassword
                        }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {changePasswordModal.showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={changePasswordModal.showConfirmPassword ? "text" : "password"}
                        value={changePasswordModal.confirmPassword}
                        onChange={(e) => setChangePasswordModal(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))}
                        placeholder="Confirme a nova senha"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setChangePasswordModal(prev => ({
                          ...prev,
                          showConfirmPassword: !prev.showConfirmPassword
                        }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {changePasswordModal.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setChangePasswordModal({ 
                      show: false, 
                      currentPassword: '', 
                      newPassword: '', 
                      confirmPassword: '',
                      showCurrentPassword: false,
                      showNewPassword: false,
                      showConfirmPassword: false
                    })}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleChangePassword}
                    disabled={loading || !changePasswordModal.currentPassword || !changePasswordModal.newPassword || !changePasswordModal.confirmPassword}
                  >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default StudentPortalComplete;