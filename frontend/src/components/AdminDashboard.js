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
  Activity
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdminData();
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
    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (id, status) => {
    try {
      await axios.put(`${API}/subscriptions/${id}/status`, null, {
        params: { status }
      });
      fetchAdminData(); // Recarregar dados
      alert('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">EAD Taxista ES - Gestão Completa</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_subscriptions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Taxa de conversão: {stats.conversion_rate || 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_users || 0}</div>
              <p className="text-xs text-muted-foreground">
                Usuários com acesso liberado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_subscriptions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando confirmação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificados Emitidos</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed_users || 0}</div>
              <p className="text-xs text-muted-foreground">
                Cursos concluídos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="subscriptions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subscriptions">Inscrições</TabsTrigger>
            <TabsTrigger value="users">Alunos</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="certificates">Certificados</TabsTrigger>
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
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscriptions.map((subscription) => (
                        <tr key={subscription.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{subscription.name}</td>
                          <td className="p-2 text-gray-600">{subscription.email}</td>
                          <td className="p-2 text-gray-600">{subscription.phone}</td>
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
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateSubscriptionStatus(subscription.id, 'paid')}
                              >
                                Confirmar Pagamento
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateSubscriptionStatus(subscription.id, 'active')}
                              >
                                Ativar
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

          {/* Alunos */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Alunos</CardTitle>
                <CardDescription>Visualize e gerencie alunos matriculados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Alunos Cadastrados: {users.length}</h3>
                  <p className="text-gray-600">Sistema de gestão de alunos em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pagamentos */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Controle de Pagamentos</CardTitle>
                <CardDescription>Monitore pagamentos e confirmações PIX</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{stats.paid_subscriptions || 0}</div>
                      <p className="text-sm text-gray-600">Pagamentos Confirmados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Activity className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{stats.pending_subscriptions || 0}</div>
                      <p className="text-sm text-gray-600">Aguardando Confirmação</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">{stats.conversion_rate || 0}%</div>
                      <p className="text-sm text-gray-600">Taxa de Conversão</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificados */}
          <TabsContent value="certificates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Certificados</CardTitle>
                <CardDescription>Emissão e controle de certificados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Certificados Emitidos: {stats.completed_users || 0}</h3>
                  <p className="text-gray-600">Sistema de certificação automática ativo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Analytics</CardTitle>
                <CardDescription>Análise detalhada de desempenho</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resumo Geral</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total de Inscrições:</span>
                          <span className="font-medium">{stats.total_subscriptions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Alunos Ativos:</span>
                          <span className="font-medium">{stats.active_users || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cursos Concluídos:</span>
                          <span className="font-medium">{stats.completed_users || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de Conversão:</span>
                          <span className="font-medium">{stats.conversion_rate || 0}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button className="w-full" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar Relatório Completo
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar Relatório por Email
                        </Button>
                        <Button className="w-full" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Gerar Gráficos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;