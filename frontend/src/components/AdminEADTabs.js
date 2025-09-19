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
  Calendar as CalendarIcon, Briefcase, Database, Zap, Globe, UserPlus, FileX, Plus
} from 'lucide-react';

// Aba de Gestão de Motoristas
export const DriversTab = ({ 
  drivers, 
  searchTerm, 
  setSearchTerm, 
  dateFilter, 
  setDateFilter, 
  filteredDrivers,
  setDriverModal,
  getStatusBadge,
  getDocumentStatusBadge,
  handleGenerateCertificate,
  selectedDrivers,
  setSelectedDrivers
}) => (
  <TabsContent value="drivers" className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestão de Motoristas</CardTitle>
            <CardDescription>Cadastro e acompanhamento de taxistas</CardDescription>
          </div>
          <Button onClick={() => setDriverModal({ 
            show: true, 
            driver: {
              name: '', cpf: '', cnh: '', license_number: '', city: '', phone: '', email: '', photo: null,
              status: 'pending', course_progress: 0, documents_status: 'pending'
            }
          })}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Motorista
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, CPF ou alvará..."
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

        {/* Lista de Motoristas */}
        <div className="space-y-4">
          {filteredDrivers.map((driver) => (
            <div key={driver.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedDrivers.includes(driver.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDrivers(prev => [...prev, driver.id]);
                      } else {
                        setSelectedDrivers(prev => prev.filter(id => id !== driver.id));
                      }
                    }}
                    className="rounded"
                  />
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{driver.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{driver.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>📄 {driver.cpf}</span>
                      <span>🚗 {driver.license_number}</span>
                      <span>📍 {driver.city}</span>
                      <span>📞 {driver.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Progresso: {driver.course_progress}%</div>
                    <Progress value={driver.course_progress} className="w-24 h-2" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    {getStatusBadge(driver.status)}
                    {getDocumentStatusBadge(driver.documents_status)}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {driver.course_progress === 100 && driver.status !== 'certified' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleGenerateCertificate(driver.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Award className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ações em Massa */}
        {selectedDrivers.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedDrivers.length} motorista(s) selecionado(s)</span>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </TabsContent>
);

// Aba de Gestão de Cursos
export const CoursesTab = ({ courses, setCourses }) => (
  <TabsContent value="courses" className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestão de Cursos</CardTitle>
            <CardDescription>Controle de conteúdo e carga horária</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>{course.hours}h de carga horária</CardDescription>
                  </div>
                  <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                    {course.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Inscritos:</span>
                    <span className="font-semibold">{course.enrolled}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Conteúdo
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

// Aba de Turmas
export const ClassesTab = ({ classes, setClassModal, classModal, setClasses }) => (
  <TabsContent value="classes" className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestão de Turmas</CardTitle>
            <CardDescription>Organização por município e período</CardDescription>
          </div>
          <Button onClick={() => setClassModal({ 
            show: true, 
            class: { name: '', city: '', start_date: '', end_date: '', max_students: 50 }
          })}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Turma
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{classItem.name}</CardTitle>
                    <CardDescription>📍 {classItem.city}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {classItem.enrolled}/{classItem.max_students}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Início:</span>
                      <p className="font-medium">{new Date(classItem.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Término:</span>
                      <p className="font-medium">{new Date(classItem.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Ocupação</span>
                      <span>{Math.round((classItem.enrolled / classItem.max_students) * 100)}%</span>
                    </div>
                    <Progress value={(classItem.enrolled / classItem.max_students) * 100} className="h-2" />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Alunos
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
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

// Aba de Certificados
export const CertificatesTab = ({ certificates, drivers, handleGenerateCertificate }) => (
  <TabsContent value="certificates" className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Certificados</CardTitle>
        <CardDescription>Emissão e validação de certificações</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Certificados Emitidos */}
          <div>
            <h3 className="font-semibold mb-4">Certificados Emitidos</h3>
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{cert.driver_name}</h4>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>📜 {cert.course}</span>
                          <span>📅 Emitido: {cert.issued_date}</span>
                          <span>⏰ Válido até: {cert.valid_until}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-mono">{cert.verification_code}</p>
                        <Badge variant="default" className="bg-green-600">Válido</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pendentes de Certificação */}
          <div>
            <h3 className="font-semibold mb-4">Pendentes de Certificação</h3>
            <div className="space-y-4">
              {drivers.filter(d => d.course_progress === 100 && d.status !== 'certified').map((driver) => (
                <div key={driver.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{driver.name}</h4>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>📄 {driver.cpf}</span>
                          <span>🏙️ {driver.city}</span>
                          <span>✅ Curso 100% concluído</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleGenerateCertificate(driver.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Gerar Certificado
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

// Aba de Relatórios
export const ReportsTab = ({ reportFilters, setReportFilters, exportReport }) => (
  <TabsContent value="reports" className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Relatórios e Análises</CardTitle>
        <CardDescription>Exportação de dados para órgãos reguladores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Cidade</Label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={reportFilters.city}
                onChange={(e) => setReportFilters(prev => ({ ...prev, city: e.target.value }))}
              >
                <option value="all">Todas</option>
                <option value="vitoria">Vitória</option>
                <option value="vila-velha">Vila Velha</option>
                <option value="serra">Serra</option>
                <option value="cariacica">Cariacica</option>
              </select>
            </div>
            <div>
              <Label>Curso</Label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={reportFilters.course}
                onChange={(e) => setReportFilters(prev => ({ ...prev, course: e.target.value }))}
              >
                <option value="all">Todos</option>
                <option value="direcao-defensiva">Direção Defensiva</option>
                <option value="primeiros-socorros">Primeiros Socorros</option>
                <option value="legislacao">Legislação</option>
              </select>
            </div>
            <div>
              <Label>Período</Label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={reportFilters.period}
                onChange={(e) => setReportFilters(prev => ({ ...prev, period: e.target.value }))}
              >
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="quarter">Último Trimestre</option>
                <option value="year">Último Ano</option>
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={reportFilters.status}
                onChange={(e) => setReportFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">Todos</option>
                <option value="certified">Certificados</option>
                <option value="in_progress">Em Progresso</option>
                <option value="pending">Pendentes</option>
              </select>
            </div>
          </div>

          {/* Tipos de Relatório */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Relatório Geral</h3>
                <p className="text-sm text-gray-600 mb-4">Estatísticas gerais de taxistas e certificações</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => exportReport('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportReport('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Por Município</h3>
                <p className="text-sm text-gray-600 mb-4">Dados agrupados por cidade</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => exportReport('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportReport('csv')}>
                    <Database className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Certificações</h3>
                <p className="text-sm text-gray-600 mb-4">Lista de motoristas aptos para alvará</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => exportReport('pdf')}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportReport('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

// Aba de Comunicação
export const CommunicationTab = ({ 
  messageModal, 
  setMessageModal, 
  handleSendNotification,
  drivers,
  notifications 
}) => (
  <TabsContent value="communication" className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Enviar Notificação</CardTitle>
          <CardDescription>Comunicação com motoristas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipo de Envio</Label>
            <select 
              className="w-full p-2 border rounded-lg"
              value={messageModal.type}
              onChange={(e) => setMessageModal(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="individual">Individual</option>
              <option value="group">Por Cidade</option>
              <option value="all">Todos os Motoristas</option>
            </select>
          </div>

          <div>
            <Label>Assunto</Label>
            <Input
              value={messageModal.subject}
              onChange={(e) => setMessageModal(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Assunto da mensagem"
            />
          </div>

          <div>
            <Label>Mensagem</Label>
            <textarea
              className="w-full p-2 border rounded-lg h-32"
              value={messageModal.message}
              onChange={(e) => setMessageModal(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Digite sua mensagem aqui..."
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSendNotification} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Enviar Notificação
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alertas Automáticos</CardTitle>
          <CardDescription>Notificações programadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Certificação Vencendo</h4>
                  <p className="text-sm text-gray-600">30 dias antes do vencimento</p>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Curso Incompleto</h4>
                  <p className="text-sm text-gray-600">Lembrete após 7 dias de inatividade</p>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Documentos Pendentes</h4>
                  <p className="text-sm text-gray-600">Lembrete diário</p>
                </div>
                <Badge variant="secondary">Pausado</Badge>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Alertas
          </Button>
        </CardContent>
      </Card>
    </div>
  </TabsContent>
);

// Aba de Configurações
export const SettingsTab = () => (
  <TabsContent value="settings" className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome da Instituição</Label>
            <Input defaultValue="Sindicato dos Taxistas do ES" />
          </div>
          
          <div>
            <Label>Email de Contato</Label>
            <Input defaultValue="admin@sindtaxi-es.org" />
          </div>
          
          <div>
            <Label>Telefone</Label>
            <Input defaultValue="(27) 3333-4444" />
          </div>

          <div>
            <Label>Logo da Instituição</Label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Alterar Logo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Aprovação Automática de Certificados</Label>
              <p className="text-sm text-gray-600">Gerar certificados automaticamente ao completar 100%</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações por Email</Label>
              <p className="text-sm text-gray-600">Enviar alertas por email</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Backup Automático</Label>
              <p className="text-sm text-gray-600">Backup diário dos dados</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div>
            <Label>Validade Padrão dos Certificados</Label>
            <select className="w-full p-2 border rounded-lg">
              <option value="12">12 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  </TabsContent>
);