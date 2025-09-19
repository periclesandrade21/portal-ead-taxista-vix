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
  Volume2, Settings, CreditCard, Receipt, GraduationCap, Shield, Bell, Home, LogOut, 
  Camera, Upload, MapPin, Building, Car, FileCheck, QrCode, Send, UserCheck, 
  Calendar as CalendarIcon, Briefcase, Database, Zap, Globe, UserPlus, FileX, Plus
} from 'lucide-react';
import axios from 'axios';
import { 
  DriversTab, 
  CoursesTab, 
  ClassesTab, 
  CertificatesTab, 
  ReportsTab, 
  CommunicationTab, 
  SettingsTab 
} from './AdminEADTabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboardEAD = () => {
  // Estados de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados gerais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Estados do Dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalDrivers: 1247,
    certifiedDrivers: 892,
    avgProgress: 75,
    approvalRate: 87,
    pendingCertifications: 23,
    activeCourses: 4,
    lastMonthGrowth: 12
  });

  // Estados de Motoristas
  const [drivers, setDrivers] = useState([]);
  const [driverModal, setDriverModal] = useState({ 
    show: false, 
    driver: {
      name: '', cpf: '', cnh: '', license_number: '', city: '', phone: '', email: '', photo: null,
      status: 'pending', course_progress: 0, documents_status: 'pending'
    }
  });
  const [selectedDrivers, setSelectedDrivers] = useState([]);

  // Estados de Cursos
  const [courses, setCourses] = useState([
    { id: '1', name: 'Direção Defensiva', hours: 8, status: 'active', enrolled: 456 },
    { id: '2', name: 'Relações Humanas', hours: 14, status: 'active', enrolled: 423 },
    { id: '3', name: 'Primeiros Socorros', hours: 2, status: 'active', enrolled: 389 },
    { id: '4', name: 'Legislação de Trânsito', hours: 8, status: 'active', enrolled: 445 },
    { id: '5', name: 'Mecânica Básica', hours: 4, status: 'active', enrolled: 234 }
  ]);

  // Estados de Turmas
  const [classes, setClasses] = useState([]);
  const [classModal, setClassModal] = useState({ 
    show: false, 
    class: { name: '', city: '', start_date: '', end_date: '', max_students: 50 }
  });

  // Estados de Certificados
  const [certificates, setCertificates] = useState([]);
  const [certificateModal, setCertificateModal] = useState({ show: false, driverId: null });

  // Estados de Relatórios
  const [reportFilters, setReportFilters] = useState({
    city: 'all',
    course: 'all',
    period: 'month',
    status: 'all'
  });

  // Estados de Comunicação
  const [notifications, setNotifications] = useState([]);
  const [messageModal, setMessageModal] = useState({ 
    show: false, 
    type: 'individual', // individual, group, all
    recipients: [],
    subject: '',
    message: ''
  });

  // Estados do AdminDashboard antigo integrados
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminStats, setAdminStats] = useState({});
  const [cities, setCities] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUserModal, setAdminUserModal] = useState({ show: false, user: null, isEdit: false });
  const [adminPasswordModal, setAdminPasswordModal] = useState({ 
    show: false, userId: null, username: '', newPassword: '', showPassword: false 
  });
  const [deleteUserModal, setDeleteUserModal] = useState({ show: false, userId: null, username: '' });
  
  // Estados para gestão de vídeos (do painel antigo)
  const [modules, setModules] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [videoModal, setVideoModal] = useState({ 
    show: false, 
    video: { title: '', description: '', youtube_url: '', module_id: '', duration_minutes: 0 } 
  });
  const [moduleModal, setModuleModal] = useState({ 
    show: false, 
    module: { name: '', description: '', duration_hours: 0, color: '#3b82f6' } 
  });
  const [deleteVideoModal, setDeleteVideoModal] = useState({ show: false, videoId: null, videoTitle: '' });
  const [videoLoadingStates, setVideoLoadingStates] = useState({});

  // Estados para cursos com preços
  const [coursesWithPrices, setCoursesWithPrices] = useState([]);
  const [courseModal, setCourseModal] = useState({ show: false, course: null });
  const [editPriceModal, setEditPriceModal] = useState({ show: false, courseId: null, currentPrice: 0 });
  const [deleteCourseModal, setDeleteCourseModal] = useState({ show: false, courseId: null, courseName: '' });

  // Estados para descontos e relatórios
  const [discounts, setDiscounts] = useState([]);
  const [discountModal, setDiscountModal] = useState({ show: false, discount: null });
  const [cityStatsData, setCityStatsData] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular login admin EAD
      if (loginData.username === 'admin' && loginData.password === 'admin123') {
        setIsAuthenticated(true);
        await loadAdminData();
      } else {
        alert('❌ Credenciais inválidas. Use admin/admin123 para demonstração.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      // Carregar dados dos motoristas (mock)
      const mockDrivers = [
        {
          id: '1', name: 'José Silva Santos', cpf: '123.456.789-00', cnh: '1234567890',
          license_number: 'TAX001', city: 'Vitória', phone: '(27) 99999-0001',
          email: 'jose@email.com', status: 'certified', course_progress: 100,
          documents_status: 'approved', last_access: '2024-09-19', photo: null
        },
        {
          id: '2', name: 'Maria Oliveira', cpf: '987.654.321-00', cnh: '0987654321',
          license_number: 'TAX002', city: 'Vila Velha', phone: '(27) 99999-0002',
          email: 'maria@email.com', status: 'in_progress', course_progress: 75,
          documents_status: 'pending', last_access: '2024-09-18', photo: null
        },
        {
          id: '3', name: 'Carlos Eduardo', cpf: '456.789.123-00', cnh: '4567891230',
          license_number: 'TAX003', city: 'Serra', phone: '(27) 99999-0003',
          email: 'carlos@email.com', status: 'pending', course_progress: 25,
          documents_status: 'rejected', last_access: '2024-09-17', photo: null
        }
      ];
      setDrivers(mockDrivers);

      // Carregar turmas (mock)
      const mockClasses = [
        {
          id: '1', name: 'Turma Vitória - Set/2024', city: 'Vitória',
          start_date: '2024-09-01', end_date: '2024-09-30', enrolled: 45, max_students: 50
        },
        {
          id: '2', name: 'Turma Vila Velha - Out/2024', city: 'Vila Velha',
          start_date: '2024-10-01', end_date: '2024-10-31', enrolled: 32, max_students: 40
        }
      ];
      setClasses(mockClasses);

      // Carregar certificados (mock)
      const mockCertificates = [
        {
          id: '1', driver_name: 'José Silva Santos', course: 'Direção Defensiva',
          issued_date: '2024-09-15', valid_until: '2025-09-15', verification_code: 'TAX001-2024-001'
        },
        {
          id: '2', driver_name: 'Maria Oliveira', course: 'Primeiros Socorros',
          issued_date: '2024-09-10', valid_until: '2025-09-10', verification_code: 'TAX002-2024-002'
        }
      ];
      setCertificates(mockCertificates);

      // Carregar notificações (mock)
      setNotifications([
        { id: 1, type: 'alert', message: '23 certificações vencem em 30 dias', time: '1 hora atrás' },
        { id: 2, type: 'info', message: 'Nova turma de Vila Velha criada', time: '2 horas atrás' },
        { id: 3, type: 'warning', message: '15 documentos pendentes de validação', time: '3 horas atrás' }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const handleCreateDriver = () => {
    // Simular criação de motorista
    const newDriver = {
      id: Date.now().toString(),
      ...driverModal.driver,
      created_at: new Date().toLocaleString()
    };
    setDrivers(prev => [...prev, newDriver]);
    setDriverModal({ 
      show: false, 
      driver: {
        name: '', cpf: '', cnh: '', license_number: '', city: '', phone: '', email: '', photo: null,
        status: 'pending', course_progress: 0, documents_status: 'pending'
      }
    });
  };

  const handleGenerateCertificate = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    const newCertificate = {
      id: Date.now().toString(),
      driver_name: driver.name,
      course: 'Curso Completo EAD Taxista',
      issued_date: new Date().toLocaleDateString(),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      verification_code: `TAX${driverId}-${new Date().getFullYear()}-${String(certificates.length + 1).padStart(3, '0')}`
    };

    setCertificates(prev => [...prev, newCertificate]);
    
    // Atualizar status do motorista
    setDrivers(prev => prev.map(d => 
      d.id === driverId ? { ...d, status: 'certified' } : d
    ));

    alert(`✅ Certificado gerado com sucesso!\nCódigo: ${newCertificate.verification_code}`);
  };

  const handleSendNotification = () => {
    // Simular envio de notificação
    alert(`📧 Notificação enviada com sucesso!\nDestinatários: ${messageModal.recipients.length || 'Todos'}\nAssunto: ${messageModal.subject}`);
    setMessageModal({ 
      show: false, 
      type: 'individual',
      recipients: [],
      subject: '',
      message: ''
    });
  };

  const exportReport = (format) => {
    // Simular exportação de relatório
    alert(`📊 Relatório sendo exportado em formato ${format.toUpperCase()}...\nAguarde o download iniciar.`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'certified': { variant: 'default', text: '✓ Certificado', className: 'bg-green-600' },
      'in_progress': { variant: 'secondary', text: '⏳ Em Progresso', className: 'bg-yellow-600' },
      'pending': { variant: 'outline', text: '⏸️ Pendente', className: 'bg-gray-500' },
      'expired': { variant: 'destructive', text: '⚠️ Expirado', className: 'bg-red-600' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>;
  };

  const getDocumentStatusBadge = (status) => {
    const statusConfig = {
      'approved': { variant: 'default', text: '✓ Aprovado', className: 'bg-green-600' },
      'pending': { variant: 'secondary', text: '⏳ Pendente', className: 'bg-yellow-600' },
      'rejected': { variant: 'destructive', text: '✗ Rejeitado', className: 'bg-red-600' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>;
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.cpf.includes(searchTerm) ||
                         driver.license_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && driver.last_access?.includes(new Date().toLocaleDateString().split('/')[2])) ||
                       (dateFilter === 'week' && new Date(driver.last_access) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesDate;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin EAD Taxistas</h1>
            <p className="text-blue-200">Sistema de Gestão Completo</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-white mb-2 block">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                placeholder="admin"
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
                  placeholder="admin123"
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
                'Entrar no Sistema'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
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
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin EAD Taxistas</h1>
                <p className="text-sm text-gray-500">Sistema de Gestão Completo</p>
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
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Administrador</span>
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
            <TabsTrigger value="drivers">
              <Users className="h-4 w-4 mr-2" />
              Motoristas
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Cursos
            </TabsTrigger>
            <TabsTrigger value="classes">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Turmas
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="h-4 w-4 mr-2" />
              Certificados
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="communication">
              <MessageCircle className="h-4 w-4 mr-2" />
              Comunicação
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Geral */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Taxistas</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalDrivers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{dashboardStats.lastMonthGrowth}% do mês passado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificados</CardTitle>
                  <Award className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.certifiedDrivers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((dashboardStats.certifiedDrivers / dashboardStats.totalDrivers) * 100)}% do total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.avgProgress}%</div>
                  <p className="text-xs text-muted-foreground">
                    Taxa de aprovação: {dashboardStats.approvalRate}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.pendingCertifications}</div>
                  <p className="text-xs text-muted-foreground">
                    Certificações vencendo
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos e Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progresso por Cidade</CardTitle>
                  <CardDescription>Distribuição de taxistas certificados por município</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Viana'].map((city, index) => {
                      const progress = [87, 76, 82, 69, 55][index];
                      return (
                        <div key={city} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{city}</span>
                            <span className="text-sm text-gray-500">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertas e Notificações</CardTitle>
                  <CardDescription>Itens que precisam de atenção</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'alert' ? 'bg-red-100' :
                        notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        {notification.type === 'alert' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
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
            </div>

            {/* Últimos Acessos */}
            <Card>
              <CardHeader>
                <CardTitle>Últimos Acessos</CardTitle>
                <CardDescription>Atividade recente dos taxistas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.slice(0, 5).map((driver) => (
                    <div key={driver.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {driver.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{driver.name}</p>
                          <p className="text-sm text-gray-500">{driver.city} • {driver.license_number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{driver.last_access}</p>
                        {getStatusBadge(driver.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestão de Motoristas */}
          <DriversTab 
            drivers={drivers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            filteredDrivers={filteredDrivers}
            setDriverModal={setDriverModal}
            getStatusBadge={getStatusBadge}
            getDocumentStatusBadge={getDocumentStatusBadge}
            handleGenerateCertificate={handleGenerateCertificate}
            selectedDrivers={selectedDrivers}
            setSelectedDrivers={setSelectedDrivers}
          />

          {/* Gestão de Cursos */}
          <CoursesTab courses={courses} setCourses={setCourses} />

          {/* Gestão de Turmas */}
          <ClassesTab 
            classes={classes}
            setClassModal={setClassModal}
            classModal={classModal}
            setClasses={setClasses}
          />

          {/* Certificados */}
          <CertificatesTab 
            certificates={certificates}
            drivers={drivers}
            handleGenerateCertificate={handleGenerateCertificate}
          />

          {/* Relatórios */}
          <ReportsTab 
            reportFilters={reportFilters}
            setReportFilters={setReportFilters}
            exportReport={exportReport}
          />

          {/* Comunicação */}
          <CommunicationTab 
            messageModal={messageModal}
            setMessageModal={setMessageModal}
            handleSendNotification={handleSendNotification}
            drivers={drivers}
            notifications={notifications}
          />

          {/* Configurações */}
          <SettingsTab />

          {/* Modal de Novo Motorista */}
          {driverModal.show && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Novo Motorista</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="driver-name">Nome Completo</Label>
                    <Input
                      id="driver-name"
                      value={driverModal.driver.name}
                      onChange={(e) => setDriverModal(prev => ({
                        ...prev,
                        driver: { ...prev.driver, name: e.target.value }
                      }))}
                      placeholder="Nome completo do motorista"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driver-cpf">CPF</Label>
                    <Input
                      id="driver-cpf"
                      value={driverModal.driver.cpf}
                      onChange={(e) => setDriverModal(prev => ({
                        ...prev,
                        driver: { ...prev.driver, cpf: e.target.value }
                      }))}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driver-cnh">CNH</Label>
                    <Input
                      id="driver-cnh"
                      value={driverModal.driver.cnh}
                      onChange={(e) => setDriverModal(prev => ({
                        ...prev,
                        driver: { ...prev.driver, cnh: e.target.value }
                      }))}
                      placeholder="Número da CNH"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driver-license">Número do Alvará</Label>
                    <Input
                      id="driver-license"
                      value={driverModal.driver.license_number}
                      onChange={(e) => setDriverModal(prev => ({
                        ...prev,
                        driver: { ...prev.driver, license_number: e.target.value }
                      }))}
                      placeholder="TAX001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driver-city">Cidade</Label>
                    <select 
                      id="driver-city"
                      className="w-full p-2 border rounded-lg"
                      value={driverModal.driver.city}
                      onChange={(e) => setDriverModal(prev => ({
                        ...prev,
                        driver: { ...prev.driver, city: e.target.value }
                      }))}
                    >
                      <option value="">Selecione a cidade</option>
                      <option value="Vitória">Vitória</option>
                      <option value="Vila Velha">Vila Velha</option>
                      <option value="Serra">Serra</option>
                      <option value="Cariacica">Cariacica</option>
                      <option value="Viana">Viana</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="driver-phone">Telefone</Label>
                    <Input
                      id="driver-phone"
                      value={driverModal.driver.phone}
                      onChange={(e) => setDriverModal(prev => ({
                        ...prev,
                        driver: { ...prev.driver, phone: e.target.value }
                      }))}
                      placeholder="(27) 99999-0000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="driver-email">Email</Label>
                    <Input
                      id="driver-email"
                      type="email"
                      value={driverModal.driver.email}
                      onChange={(e) => setDriverModal(prev => ({
                        ...prev,
                        driver: { ...prev.driver, email: e.target.value }
                      }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setDriverModal({ 
                      show: false, 
                      driver: {
                        name: '', cpf: '', cnh: '', license_number: '', city: '', phone: '', email: '', photo: null,
                        status: 'pending', course_progress: 0, documents_status: 'pending'
                      }
                    })}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateDriver}>
                    Cadastrar Motorista
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

export default AdminDashboardEAD;