import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Award,
  User,
  Lock,
  Eye,
  Download,
  Video,
  FileText,
  BarChart3
} from 'lucide-react';

const StudentPortal = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // URL do backend
  const API = process.env.REACT_APP_BACKEND_URL;

  const modules = [
    {
      id: 1,
      title: 'Relações Humanas',
      duration: '14h',
      progress: 0,
      status: 'locked',
      description: 'Imagem do taxista na sociedade, condições físicas e emocionais'
    },
    {
      id: 2,
      title: 'Direção Defensiva',
      duration: '8h',
      progress: 0,
      status: 'locked',
      description: 'Conceitos de direção defensiva e prevenção de acidentes'
    },
    {
      id: 3,
      title: 'Primeiros Socorros',
      duration: '2h',
      progress: 0,
      status: 'locked',
      description: 'Procedimentos de emergência e cuidados básicos'
    },
    {
      id: 4,
      title: 'Mecânica Básica',
      duration: '4h',
      progress: 0,
      status: 'locked',
      description: 'Funcionamento do motor e manutenção preventiva'
    }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    try {
      // Validar com o backend
      const response = await axios.post(`${API}/api/auth/login`, {
        email: loginData.email.toLowerCase().trim(),
        password: loginData.password
      });
      
      if (response.data.success) {
        setUserInfo(response.data.user);
        setIsLoggedIn(true);
        console.log('Login realizado com sucesso:', response.data.user.name);
      } else {
        setLoginError('Email ou senha incorretos');
      }
      
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response) {
        // Erro do servidor
        if (error.response.status === 401) {
          setLoginError('Email ou senha incorretos');
        } else if (error.response.status === 403) {
          setLoginError('Acesso negado. Verifique se seu pagamento foi confirmado.');
        } else {
          setLoginError('Erro no servidor. Tente novamente.');
        }
      } else {
        // Erro de conexão
        setLoginError('Erro de conexão. Verifique sua internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
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
                  }}
                  placeholder="seu@email.com"
                  required
                  className={loginError ? 'border-red-500' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => {
                    setLoginData({...loginData, password: e.target.value});
                    setLoginError(''); // Limpar erro ao digitar
                  }}
                  placeholder="Sua senha temporária"
                  required
                  className={loginError ? 'border-red-500' : ''}
                />
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
              
              <div className="text-center text-sm text-gray-600">
                <p>Problemas para acessar?</p>
                <Button variant="link" className="p-0 h-auto">
                  Recuperar senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
                <p className="text-sm text-gray-600">Bem-vindo, José Silva</p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={() => setIsLoggedIn(false)}
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

        {/* Aviso de Pagamento */}
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

        {/* Módulos do Curso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      module.status === 'locked' ? 'bg-gray-100' : 
                      module.status === 'active' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {module.status === 'locked' ? (
                        <Lock className="h-6 w-6 text-gray-400" />
                      ) : module.status === 'active' ? (
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
                    module.status === 'active' ? 'default' : 'default'
                  }>
                    {module.status === 'locked' ? 'Bloqueado' :
                     module.status === 'active' ? 'Disponível' : 'Concluído'}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPortal;