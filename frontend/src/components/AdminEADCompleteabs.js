import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { TabsContent } from './ui/tabs';
import {
  Users, BookOpen, Award, TrendingUp, Eye, EyeOff, Edit, Play, Download, Search, Filter,
  Mail, Phone, Calendar, DollarSign, BarChart3, PieChart, Activity, Lock, Unlock,
  Gift, Percent, RefreshCw, Key, User, AlertCircle, CheckCircle, Clock, ChevronLeft,
  ChevronRight, MessageCircle, FileText, HelpCircle, Star, Trophy, Target, Bookmark,
  Volume2, Settings, CreditCard, Receipt, GraduationCap, Shield, Bell, Home, LogOut, 
  Camera, Upload, MapPin, Building, Car, FileCheck, QrCode, Send, UserCheck, 
  Calendar as CalendarIcon, Briefcase, Database, Zap, Globe, UserPlus, FileX, Plus,
  Trash2
} from 'lucide-react';

// Aba de Inscrições
export const SubscriptionsTab = ({ 
  subscriptions,
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  handleDeleteUser,
  handleApplyDiscount,
  handleResetStudentPassword,
  handleClearFields
}) => (
  <TabsContent value="subscriptions" className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestão de Inscrições
        </CardTitle>
        <CardDescription>
          Visualização e gerenciamento de todas as inscrições no sistema - Descontos, Doações e Reset de Senhas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={dateFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={dateFilter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('today')}
            >
              Hoje
            </Button>
            <Button
              variant={dateFilter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateFilter('week')}
            >
              Semana
            </Button>
          </div>
        </div>

        {/* Lista de Inscrições */}
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{subscription.name?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{subscription.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>📧 {subscription.email}</span>
                      <span>📞 {subscription.phone}</span>
                      <span>🏙️ {subscription.city}</span>
                      <span>🚗 {subscription.license_number}</span>
                    </div>
                    {subscription.discount_applied && (
                      <div className="mt-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          💰 Desconto: {subscription.discount_type === 'percentage' ? `${subscription.discount_value}%` : `R$ ${subscription.discount_value}`}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge 
                      variant={subscription.payment_status === 'paid' ? 'default' : 'secondary'}
                      className={subscription.payment_status === 'paid' ? 'bg-green-600' : 'bg-yellow-600'}
                    >
                      {subscription.payment_status === 'paid' ? '✅ Pago' : '⏳ Pendente'}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      {subscription.discount_applied ? (
                        <>
                          <span className="line-through text-gray-400">R$ 150,00</span>
                          <span className="ml-2 font-bold text-green-600">R$ {subscription.final_price || '0,00'}</span>
                        </>
                      ) : (
                        `R$ ${subscription.payment_value || '150,00'}`
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" title="Visualizar">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      title="Aplicar Desconto/Doação"
                      onClick={() => handleApplyDiscount(subscription.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Gift className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      title="Reset de Senha"
                      onClick={() => handleResetStudentPassword(subscription.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      title="Limpar Campos"
                      onClick={() => handleClearFields(subscription.id)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      title="Excluir"
                      onClick={() => handleDeleteUser(subscription.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

// Aba de Pagamentos
export const PaymentsTab = ({ paymentStats, adminStats, dateFilter, setDateFilter }) => (
  <TabsContent value="payments" className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {(adminStats.totalRevenue || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {adminStats.paidSubscriptions || 0} pagamentos confirmados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {(adminStats.monthlyRevenue || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreference">
            +12% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {(adminStats.weeklyRevenue || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Meta semanal: R$ 1.000
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          <Activity className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {(adminStats.dailyRevenue || 0).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {Math.floor((adminStats.dailyRevenue || 0) / 150)} novos pagamentos
          </p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Receita por Cidade</CardTitle>
        <CardDescription>Distribuição de pagamentos por município</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentStats.map((stat) => (
            <div key={stat.city} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{stat.city}</span>
                <div className="text-right">
                  <span className="font-bold">R$ {stat.revenue.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 ml-2">({stat.paid} pagos)</span>
                </div>
              </div>
              <Progress value={(stat.paid / (stat.paid + stat.pending)) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

// Aba de Gráficos
export const ChartsTab = ({ cityStatsData }) => (
  <TabsContent value="charts" className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Cidade</CardTitle>
          <CardDescription>Distribuição de inscrições e pagamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cityStatsData.map((city) => (
              <div key={city.city} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{city.city}</span>
                  <span className="text-sm text-gray-500">{city.total} total</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-green-100 p-2 rounded">
                    <span className="text-green-800">Pagos: {city.paid}</span>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <span className="text-yellow-800">Pendentes: {city.pending}</span>
                  </div>
                </div>
                <Progress value={(city.paid / city.total) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
          <CardDescription>Indicadores principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round(cityStatsData.reduce((acc, city) => acc + (city.paid / city.total), 0) / cityStatsData.length * 100)}%
              </div>
              <p className="text-sm text-gray-600">Taxa de Conversão Média</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {cityStatsData.reduce((acc, city) => acc + city.paid, 0)}
                </div>
                <p className="text-sm text-gray-600">Total Pagos</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {cityStatsData.reduce((acc, city) => acc + city.pending, 0)}
                </div>
                <p className="text-sm text-gray-600">Total Pendentes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </TabsContent>
);

// Aba de Cidades
export const CitiesTab = ({ cities }) => (
  <TabsContent value="cities" className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas por Cidade</CardTitle>
        <CardDescription>Análise detalhada de inscrições e pagamentos por município</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Card key={city.city} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">{city.city}</CardTitle>
                <CardDescription>{city.total} inscrições totais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{city.paid}</div>
                      <p className="text-sm text-green-700">Pagos</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{city.pending}</div>
                      <p className="text-sm text-yellow-700">Pendentes</p>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">R$ {city.revenue.toLocaleString()}</div>
                    <p className="text-sm text-blue-700">Receita Total</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Conversão</span>
                      <span>{Math.round((city.paid / city.total) * 100)}%</span>
                    </div>
                    <Progress value={(city.paid / city.total) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

// Aba de Cursos com Preços
export const CoursesWithPricesTab = ({ 
  coursesWithPrices,
  setEditPriceModal,
  setDeleteCourseModal
}) => (
  <TabsContent value="courses" className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Cursos e Preços</CardTitle>
        <CardDescription>Controle de cursos disponíveis e valores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesWithPrices.map((course) => (
            <Card key={course.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.enrolled} inscritos</CardDescription>
                  </div>
                  <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                    {course.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">R$ {course.price}</div>
                    <p className="text-sm text-green-700">Valor do Curso</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setEditPriceModal({ show: true, courseId: course.id, currentPrice: course.price })}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Preço
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setDeleteCourseModal({ show: true, courseId: course.id, courseName: course.title })}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

// Aba de Vídeos
export const VideosTab = ({
  modules,
  selectedModule,
  setSelectedModule,
  videos,
  fetchModuleVideos,
  videoLoadingStates,
  setVideoModal,
  setModuleModal,
  setDeleteVideoModal,
  formatDuration
}) => (
  <TabsContent value="videos" className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna 1: Seleção de Módulo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Módulos do Curso
          </CardTitle>
          <CardDescription>Selecione um módulo para gerenciar seus vídeos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => setModuleModal({ show: true, module: { name: '', description: '', duration_hours: 0, color: '#3b82f6' } })}
            className="w-full mb-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Módulo
          </Button>
          
          {modules.map((module) => (
            <div 
              key={module.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedModule === module.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedModule(module.id);
                fetchModuleVideos(module.id);
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: module.color }}
                ></div>
                <div className="flex-1">
                  <h4 className="font-medium">{module.name}</h4>
                  <p className="text-sm text-gray-600">{module.video_count || 0} vídeos • {module.duration_hours}h</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Coluna 2 e 3: Lista de Vídeos */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Vídeos do Módulo
                </CardTitle>
                <CardDescription>
                  {selectedModule ? 
                    `Gerencie os vídeos do módulo selecionado` : 
                    'Selecione um módulo para ver seus vídeos'
                  }
                </CardDescription>
              </div>
              {selectedModule && (
                <Button onClick={() => setVideoModal({ 
                  show: true, 
                  video: { title: '', description: '', youtube_url: '', module_id: selectedModule, duration_minutes: 0 } 
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Vídeo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedModule ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Selecione um Módulo</h3>
                <p className="text-gray-500">Escolha um módulo na lista ao lado para ver e gerenciar seus vídeos</p>
              </div>
            ) : videoLoadingStates[selectedModule] ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando vídeos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum vídeo encontrado</h3>
                <p className="text-gray-500 mb-4">Este módulo ainda não possui vídeos</p>
                <Button onClick={() => setVideoModal({ 
                  show: true, 
                  video: { title: '', description: '', youtube_url: '', module_id: selectedModule, duration_minutes: 0 } 
                })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Vídeo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video, index) => (
                  <div key={video.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${video.youtube_id}/default.jpg`;
                          }}
                        />
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg mb-1">{video.title}</h4>
                            <p className="text-gray-600 text-sm mb-2">{video.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>#{index + 1}</span>
                              {video.duration_minutes && <span>{formatDuration(video.duration_minutes)}</span>}
                              <a 
                                href={video.youtube_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Ver no YouTube
                              </a>
                            </div>
                          </div>
                          
                          {/* Ações */}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(video.youtube_url, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setDeleteVideoModal({ show: true, videoId: video.id, videoTitle: video.title })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </TabsContent>
);

// Aba de Usuários Admin
export const AdminUsersTab = ({
  adminUsers,
  setAdminUserModal,
  setAdminPasswordModal,
  setDeleteUserModal
}) => (
  <TabsContent value="admin-users" className="space-y-4">
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Usuários Administrativos</CardTitle>
            <CardDescription>Gestão de acessos administrativos ao sistema</CardDescription>
          </div>
          <Button onClick={() => setAdminUserModal({ show: true, user: null, isEdit: false })}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário Admin
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {adminUsers.map((adminUser) => (
            <div key={adminUser.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{adminUser.full_name?.charAt(0) || 'A'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{adminUser.full_name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>👤 {adminUser.username}</span>
                      <span>🎭 {adminUser.role}</span>
                      <span>📅 {adminUser.created_at}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={adminUser.username === 'admin' ? 'destructive' : 'default'}
                    className={adminUser.username === 'admin' ? 'bg-red-600' : 'bg-blue-600'}
                  >
                    {adminUser.username === 'admin' ? '👑 Principal' : '👔 Admin'}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setAdminPasswordModal({ 
                        show: true, 
                        userId: adminUser.id, 
                        username: adminUser.username, 
                        newPassword: '', 
                        showPassword: false 
                      })}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    {adminUser.username !== 'admin' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setDeleteUserModal({ 
                          show: true, 
                          userId: adminUser.id, 
                          username: adminUser.username 
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);