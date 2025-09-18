import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
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
  User
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [stats, setStats] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentStats, setPaymentStats] = useState({});
  
  // Estados para as novas funcionalidades
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [regionStats, setRegionStats] = useState({});
  const [paymentChartData, setPaymentChartData] = useState([]);

  // Novos estados para funcionalidades administrativas
  const [discountModal, setDiscountModal] = useState({ show: false, userId: null, discount: 0 });
  const [bonusModal, setBonusModal] = useState({ show: false, userId: null });
  const [resetPasswordModal, setResetPasswordModal] = useState({ show: false, userId: null, newPassword: '' });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated, dateFilter]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Sistema de autenticação simples
    if (loginData.username === 'admin' && loginData.password === 'admin@123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
    } else {
      alert('Credenciais inválidas! Use: admin / admin@123');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    setLoginData({ username: '', password: '' });
  };

  // Verificar se já está logado ao carregar
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminAuthenticated');
    if (isLoggedIn === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, subscriptionsRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/subscriptions`),
        axios.get(`${API}/users`)
      ]);
      
      setStats(statsRes.data);
      setSubscriptions(subscriptionsRes.data);
      setUsers(usersRes.data);
      
      // Calcular estatísticas de pagamento
      calculatePaymentStats(subscriptionsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePaymentStats = (subscriptions) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayPaid = 0, weekPaid = 0, monthPaid = 0;
    let todayRevenue = 0, weekRevenue = 0, monthRevenue = 0;
    const coursePrice = 150; // Preço padrão do curso

    subscriptions.forEach(sub => {
      const subDate = new Date(sub.subscription_date);
      
      if (sub.status === 'paid' || sub.status === 'active') {
        const revenue = sub.discount ? coursePrice * (1 - sub.discount / 100) : coursePrice;
        
        if (subDate >= today) {
          todayPaid++;
          todayRevenue += revenue;
        }
        if (subDate >= thisWeekStart) {
          weekPaid++;
          weekRevenue += revenue;
        }
        if (subDate >= thisMonthStart) {
          monthPaid++;
          monthRevenue += revenue;
        }
      }
    });

    setPaymentStats({
      today: { paid: todayPaid, revenue: todayRevenue },
      week: { paid: weekPaid, revenue: weekRevenue },
      month: { paid: monthPaid, revenue: monthRevenue }
    });
  };

  const updateSubscriptionStatus = async (id, status, options = {}) => {
    try {
      const params = { status };
      if (options.discount) params.discount = options.discount;
      if (options.bonus) params.bonus = true;
      
      await axios.put(`${API}/subscriptions/${id}/status`, null, { params });
      fetchAdminData();
      alert('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const applyDiscount = async () => {
    if (discountModal.discount > 0 && discountModal.discount <= 100) {
      await updateSubscriptionStatus(discountModal.userId, 'active', { 
        discount: discountModal.discount 
      });
      setDiscountModal({ show: false, userId: null, discount: 0 });
    }
  };

  const applyBonus = async () => {
    await updateSubscriptionStatus(bonusModal.userId, 'active', { bonus: true });
    setBonusModal({ show: false, userId: null });
  };

  const resetUserPassword = async () => {
    if (resetPasswordModal.newPassword.length >= 6) {
      try {
        await axios.put(`${API}/users/${resetPasswordModal.userId}/reset-password`, {
          newPassword: resetPasswordModal.newPassword
        });
        alert('Senha alterada com sucesso!');
        setResetPasswordModal({ show: false, userId: null, newPassword: '' });
      } catch (error) {
        alert('Erro ao alterar senha');
      }
    } else {
      alert('A senha deve ter pelo menos 6 caracteres');
    }
  };

  // Função para excluir usuário
  const deleteUser = async () => {
    try {
      await axios.delete(`${API}/subscriptions/${deleteModal.user.id}`);
      await fetchAdminData();
      setDeleteModal({ show: false, user: null });
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  // Função para carregar dados de região (simulado)
  const loadRegionData = () => {
    // Simular dados de região do ES
    const cities = [
      'Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Viana', 
      'Guarapari', 'Cachoeiro de Itapemirim', 'Linhares', 
      'São Mateus', 'Colatina', 'Aracruz', 'Nova Venécia'
    ];
    
    const regionData = cities.reduce((acc, city) => {
      acc[city] = Math.floor(Math.random() * 50) + 5; // Simular usuários por cidade
      return acc;
    }, {});
    
    setRegionStats(regionData);
  };

  // Função para carregar dados de pagamento (simulado)
  const loadPaymentChartData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const data = months.map((month, index) => ({
      month,
      pagamentos: Math.floor(Math.random() * 100) + 20,
      receita: Math.floor(Math.random() * 15000) + 3000
    }));
    
    setPaymentChartData(data);
  };

  const getFilteredSubscriptions = () => {
    let filtered = subscriptions.filter(sub =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(sub => {
        const subDate = new Date(sub.subscription_date);
        
        switch (dateFilter) {
          case 'today':
            return subDate >= today;
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return subDate >= weekStart;
          case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return subDate >= monthStart;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
            <CardDescription>
              Acesso restrito - EAD Taxista ES
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  placeholder="admin"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="Sua senha"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                <Unlock className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
            <p className="text-gray-600">EAD Taxista ES - Gestão Completa</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <Lock className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Filtros de Data */}
        <div className="mb-6 flex gap-2">
          <Button 
            variant={dateFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setDateFilter('all')}
          >
            Todos
          </Button>
          <Button 
            variant={dateFilter === 'today' ? 'default' : 'outline'}
            onClick={() => setDateFilter('today')}
          >
            Hoje
          </Button>
          <Button 
            variant={dateFilter === 'week' ? 'default' : 'outline'}
            onClick={() => setDateFilter('week')}
          >
            Esta Semana
          </Button>
          <Button 
            variant={dateFilter === 'month' ? 'default' : 'outline'}
            onClick={() => setDateFilter('month')}
          >
            Este Mês
          </Button>
        </div>

        {/* Stats Cards com Valores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats.today?.paid || 0}</div>
              <p className="text-xs text-green-600">
                R$ {(paymentStats.today?.revenue || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Semana</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats.week?.paid || 0}</div>
              <p className="text-xs text-blue-600">
                R$ {(paymentStats.week?.revenue || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Mês</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats.month?.paid || 0}</div>
              <p className="text-xs text-purple-600">
                R$ {(paymentStats.month?.revenue || 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_subscriptions || 0}</div>
              <p className="text-xs text-gray-600">
                Todas as inscrições
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="subscriptions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subscriptions">Inscrições</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="discounts">Descontos & Bônus</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Inscrições */}
          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestão de Inscrições</CardTitle>
                    <CardDescription>
                      Gerencie todas as inscrições e status de pagamento
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar inscrições..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Telefone</th>
                        <th className="text-left p-2">Placa</th>
                        <th className="text-left p-2">Alvará</th>
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Valor</th>
                        <th className="text-left p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredSubscriptions().map((subscription) => (
                        <tr key={subscription.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{subscription.name}</td>
                          <td className="p-2 text-gray-600">{subscription.email}</td>
                          <td className="p-2 text-gray-600">{subscription.phone}</td>
                          <td className="p-2 text-gray-600 font-mono">{subscription.car_plate || '-'}</td>
                          <td className="p-2 text-gray-600">{subscription.license_number || '-'}</td>
                          <td className="p-2 text-gray-600">
                            {new Date(subscription.subscription_date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-2">
                            <Badge 
                              variant={
                                subscription.status === 'pending' ? 'secondary' :
                                subscription.status === 'paid' ? 'default' :
                                subscription.status === 'active' ? 'default' : 'secondary'
                              }
                            >
                              {subscription.status === 'pending' ? 'Pendente' :
                               subscription.status === 'paid' ? 'Pago' :
                               subscription.status === 'active' ? 'Ativo' : subscription.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <span className={subscription.discount ? 'text-green-600' : ''}>
                              R$ {subscription.discount ? 
                                (150 * (1 - subscription.discount / 100)).toFixed(2) : 
                                '150,00'
                              }
                              {subscription.discount && (
                                <Badge variant="outline" className="ml-1 text-xs">
                                  -{subscription.discount}%
                                </Badge>
                              )}
                              {subscription.bonus && (
                                <Badge variant="outline" className="ml-1 text-xs bg-yellow-100">
                                  GRÁTIS
                                </Badge>
                              )}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1 flex-wrap">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateSubscriptionStatus(subscription.id, 'paid')}
                              >
                                Confirmar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setDiscountModal({ show: true, userId: subscription.id, discount: 0 })}
                              >
                                <Percent className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setBonusModal({ show: true, userId: subscription.id })}
                              >
                                <Gift className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setResetPasswordModal({ show: true, userId: subscription.id, newPassword: '' })}
                              >
                                <Key className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => setDeleteModal({ show: true, user: subscription })}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outros Tabs (Pagamentos, Descontos, Relatórios) */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="font-bold text-2xl text-green-600">
                      R$ {(paymentStats.month?.revenue || 0).toFixed(2)}
                    </h3>
                    <p>Receita do Mês</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-2xl text-blue-600">
                      {stats.paid_subscriptions || 0}
                    </h3>
                    <p>Pagamentos Confirmados</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-bold text-2xl text-yellow-600">
                      {stats.pending_subscriptions || 0}
                    </h3>
                    <p>Aguardando Pagamento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discounts">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Descontos e Bonificações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Use os botões de ação na aba "Inscrições" para aplicar descontos ou bonificações individuais.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Detalhados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Estatísticas Gerais</h4>
                    <p>Total de Inscrições: {stats.total_subscriptions || 0}</p>
                    <p>Pagamentos Confirmados: {stats.paid_subscriptions || 0}</p>
                    <p>Taxa de Conversão: {stats.conversion_rate || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais */}
        {discountModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Aplicar Desconto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Desconto (%)</Label>
                  <Input
                    type="number"
                    max="100"
                    min="0"
                    value={discountModal.discount}
                    onChange={(e) => setDiscountModal({...discountModal, discount: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={applyDiscount}>Aplicar</Button>
                  <Button variant="outline" onClick={() => setDiscountModal({ show: false, userId: null, discount: 0 })}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {bonusModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Bonificar Aluno</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Deseja liberar acesso gratuito para este aluno?</p>
                <div className="flex gap-2">
                  <Button onClick={applyBonus}>Confirmar</Button>
                  <Button variant="outline" onClick={() => setBonusModal({ show: false, userId: null })}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {resetPasswordModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Reset de Senha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nova Senha</Label>
                  <Input
                    type="password"
                    value={resetPasswordModal.newPassword}
                    onChange={(e) => setResetPasswordModal({...resetPasswordModal, newPassword: e.target.value})}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={resetUserPassword}>Alterar</Button>
                  <Button variant="outline" onClick={() => setResetPasswordModal({ show: false, userId: null, newPassword: '' })}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;