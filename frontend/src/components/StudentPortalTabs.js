import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { TabsContent } from './ui/tabs';
import {
  Play, Download, Calendar, MessageCircle, CreditCard, User, 
  FileText, Trophy, Clock, CheckCircle, AlertCircle, Camera, Key
} from 'lucide-react';

export const ContentTab = ({ 
  selectedModule, 
  moduleVideos, 
  handleVideoSelect, 
  handleStartQuiz, 
  userProgress, 
  formatDuration 
}) => (
  <TabsContent value="content" className="space-y-6">
    {!selectedModule ? (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Selecione uma Disciplina</h3>
            <p className="text-gray-500">Vá para a aba "Disciplinas" e escolha um módulo para estudar</p>
          </div>
        </CardContent>
      </Card>
    ) : (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedModule.color }}></div>
                  {selectedModule.name}
                </CardTitle>
                <CardDescription>{selectedModule.description}</CardDescription>
              </div>
              <Button onClick={() => handleStartQuiz(selectedModule.id)}>
                <Trophy className="h-4 w-4 mr-2" />
                Fazer Quiz
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {moduleVideos.map((video, index) => {
            const isWatched = userProgress[selectedModule.id]?.videos_watched?.includes(video.id);
            
            return (
              <Card key={video.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${video.youtube_id}/default.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button 
                      size="lg" 
                      className="bg-white/20 backdrop-blur-sm border-white/30"
                      onClick={() => handleVideoSelect(video)}
                    >
                      <Play className="h-6 w-6 mr-2" />
                      Assistir
                    </Button>
                  </div>
                  {isWatched && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white p-1 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{video.title}</h3>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDuration(video.duration_minutes)}</span>
                    <span>{isWatched ? '✅ Assistido' : '⏱️ Pendente'}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </>
    )}
  </TabsContent>
);

export const GradesTab = ({ modules, userProgress }) => (
  <TabsContent value="grades" className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Notas</CardTitle>
        <CardDescription>Acompanhe seu desempenho nas avaliações</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules.map((module) => {
            const progress = userProgress[module.id];
            return (
              <div key={module.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{module.name}</h3>
                  <Badge variant={progress?.quiz_passed ? "default" : "secondary"}>
                    {progress?.quiz_passed ? "Aprovado" : "Pendente"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nota do Quiz:</span>
                    <p className="font-medium">
                      {progress?.quiz_score !== null ? `${progress.quiz_score}/100` : 'Não realizado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">
                      {progress?.quiz_passed ? '✅ Aprovado' : '⏳ Pendente'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Data:</span>
                    <p className="font-medium">
                      {progress?.quiz_score ? new Date().toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Estatísticas Gerais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">8.5</div>
            <p className="text-sm text-gray-600">Média Geral</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2/4</div>
            <p className="text-sm text-gray-600">Módulos Aprovados</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">75%</div>
            <p className="text-sm text-gray-600">Progresso Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

export const CalendarTab = () => (
  <TabsContent value="calendar" className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Calendário Acadêmico</CardTitle>
        <CardDescription>Datas importantes e prazos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <h3 className="font-semibold">Prazo Final do Curso</h3>
            <p className="text-sm text-gray-600">31 de Dezembro, 2024</p>
            <p className="text-xs text-blue-600">90 dias restantes</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <h3 className="font-semibold">Quiz de Legislação</h3>
            <p className="text-sm text-gray-600">Disponível até 15 de Dezembro</p>
            <p className="text-xs text-yellow-600">Pendente</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <h3 className="font-semibold">Certificado</h3>
            <p className="text-sm text-gray-600">Liberado após conclusão de todos os módulos</p>
            <p className="text-xs text-green-600">50% concluído</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

export const SupportTab = ({ chatMessages, newMessage, setNewMessage, handleSendMessage }) => (
  <TabsContent value="support" className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Chat com Suporte</CardTitle>
          <CardDescription>Tire suas dúvidas em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 border rounded-lg p-4 overflow-y-auto bg-gray-50">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Inicie uma conversa</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div key={message.id} className={`mb-3 ${message.sender === 'student' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-2 rounded-lg max-w-xs ${
                      message.sender === 'student' ? 'bg-blue-600 text-white' : 'bg-white border'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Enviar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ - Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-1">Como acessar os vídeos offline?</h3>
            <p className="text-xs text-gray-600">Os vídeos devem ser assistidos online. Você pode pausar e retomar quando quiser.</p>
          </div>
          <div className="border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-1">Quantas tentativas tenho no quiz?</h3>
            <p className="text-xs text-gray-600">Você tem 3 tentativas para cada quiz. A maior nota será considerada.</p>
          </div>
          <div className="border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-1">Como obter o certificado?</h3>
            <p className="text-xs text-gray-600">Complete todos os módulos com nota mínima 7.0 para liberar o certificado.</p>
          </div>
          <div className="border rounded-lg p-3">
            <h3 className="font-semibold text-sm mb-1">Problemas técnicos?</h3>
            <p className="text-xs text-gray-600">Entre em contato pelo chat ou email: suporte@sindtaxi-es.org</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </TabsContent>
);

export const FinancialTab = ({ user }) => (
  <TabsContent value="financial" className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Situação Financeira</CardTitle>
        <CardDescription>Acompanhe seus pagamentos e comprovantes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Curso EAD Taxista ES</h3>
              <p className="text-sm text-gray-600">Pagamento único</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">R$ 150,00</p>
              <Badge variant="default" className="bg-green-600">✅ Pago</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Baixar Comprovante
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Declaração de Matrícula
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

export const ProfileTab = ({ 
  profileData, 
  user, 
  handlePhotoUpload, 
  setChangePasswordModal, 
  accessHistory, 
  activityHistory 
}) => (
  <TabsContent value="profile" className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna 1: Foto e Dados Básicos */}
      <Card>
        <CardHeader>
          <CardTitle>Foto e Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload de Foto */}
          <div className="text-center">
            <div className="relative inline-block">
              {profileData?.photo ? (
                <img 
                  src={profileData.photo} 
                  alt="Foto do perfil" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center border-4 border-blue-100">
                  <span className="text-white text-2xl font-medium">
                    {profileData?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="h-4 w-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">Clique na câmera para alterar</p>
          </div>

          {/* Informações Básicas */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome Completo</label>
              <p className="mt-1 p-2 border rounded-lg bg-gray-50">{profileData?.name || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 p-2 border rounded-lg bg-gray-50">{profileData?.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <p className="mt-1 p-2 border rounded-lg bg-gray-50">{profileData?.phone || '-'}</p>
            </div>
          </div>

          {/* Botão Trocar Senha */}
          <Button 
            onClick={() => setChangePasswordModal({ 
              show: true, 
              currentPassword: '', 
              newPassword: '', 
              confirmPassword: '',
              showCurrentPassword: false,
              showNewPassword: false,
              showConfirmPassword: false
            })}
            className="w-full"
            variant="outline"
          >
            <Key className="h-4 w-4 mr-2" />
            Alterar Senha
          </Button>
        </CardContent>
      </Card>

      {/* Coluna 2: Dados Profissionais */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Profissionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Cidade</label>
            <p className="mt-1 p-2 border rounded-lg bg-gray-50">{profileData?.city || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Placa do Veículo</label>
            <p className="mt-1 p-2 border rounded-lg bg-gray-50">{profileData?.car_plate || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Número do Alvará</label>
            <p className="mt-1 p-2 border rounded-lg bg-gray-50">{profileData?.license_number || '-'}</p>
          </div>

          {/* Estatísticas do Perfil */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Estatísticas de Desempenho</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm text-gray-600">Tempo de Estudo</span>
                <span className="font-bold text-blue-600">24h</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm text-gray-600">Progresso Total</span>
                <span className="font-bold text-green-600">75%</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm text-gray-600">Média Geral</span>
                <span className="font-bold text-purple-600">8.5</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coluna 3: Histórico de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityHistory.map((activity) => (
              <div key={activity.id} className="border-l-4 border-blue-500 pl-3 py-2">
                <p className="font-medium text-sm">{activity.action}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                  <span>{activity.module}</span>
                  <span>{activity.date}</span>
                </div>
                {activity.score && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 inline-block">
                    Nota: {activity.score}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Histórico de Acessos */}
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Acessos</CardTitle>
        <CardDescription>Registro dos últimos acessos ao portal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Ação</th>
                <th className="text-left py-2">Data/Hora</th>
                <th className="text-left py-2">IP</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {accessHistory.map((access) => (
                <tr key={access.id} className="border-b">
                  <td className="py-2">{access.action}</td>
                  <td className="py-2">{access.date}</td>
                  <td className="py-2">{access.ip}</td>
                  <td className="py-2">
                    <Badge variant="default" className="bg-green-600">
                      ✅ Sucesso
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);