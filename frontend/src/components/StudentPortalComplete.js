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
    name: '', email: '', phone: '', city: '', car_plate: '', license_number: ''
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

      // Carregar progresso do usuário (mock por enquanto)
      const mockProgress = {
        'module1': { videos_watched: ['video1', 'video2'], quiz_score: 85, quiz_passed: true },
        'module2': { videos_watched: ['video1'], quiz_score: null, quiz_passed: false }
      };
      setUserProgress(mockProgress);

      // Carregar notificações
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