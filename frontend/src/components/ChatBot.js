import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Minimize2,
  Maximize2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Olá! 👋 Sou o TaxiBot, seu assistente virtual do EAD Taxista ES. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  
  // Avatar do bot
  const botAvatarUrl = "https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxmcmllbmRseSUyMGNoYXRib3QlMjBhdmF0YXJ8ZW58MHx8fHwxNzU4MjE3MTk3fDA&ixlib=rb-4.1.0&q=85";
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        session_id: sessionId,
        message: userMessage.content
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        timestamp: new Date(response.data.timestamp)
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Desculpe, ocorreu um erro. Tente novamente ou entre em contato com suporte@sindtaxi-es.org',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleChat = () => {
    console.log('Toggling chat, current isOpen:', isOpen);
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Sugestões rápidas
  const quickSuggestions = [
    "Como funcionam os cursos EAD?",
    "Quais cursos são obrigatórios?",
    "Como é o certificado?",
    "Esqueci minha senha",
    "Qual o valor do curso?",
    "Quanto tempo dura o curso?",
    "O certificado é válido em todo Brasil?"
  ];

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  console.log('ChatBot render - isOpen:', isOpen, 'isMinimized:', isMinimized);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse flex items-center justify-center"
          data-testid="chat-toggle-button"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
          <div style={{ 
            position: 'absolute', 
            top: '-8px', 
            left: '-8px', 
            backgroundColor: '#ef4444', 
            color: 'white', 
            fontSize: '12px', 
            borderRadius: '50%', 
            width: '20px', 
            height: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            animation: 'bounce 1s infinite'
          }}>
            💬
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border"
          style={{ 
            position: 'relative',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-1 rounded-full">
                  <img 
                    src={botAvatarUrl} 
                    alt="TaxiBot Avatar" 
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="bg-blue-500 p-2 rounded-full hidden items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">TaxiBot</h3>
                  <p className="text-sm opacity-90">Assistente EAD Taxista ES</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMinimize}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8 rounded"
                  style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={toggleChat}
                  className="text-white hover:bg-white/20 p-1 h-8 w-8 rounded"
                  style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="p-0">
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border-2 border-green-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <img 
                            src={botAvatarUrl} 
                            alt="TaxiBot" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentNode.classList.add('bg-green-600');
                              e.target.parentNode.innerHTML = '<svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
                            }}
                          />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 opacity-70 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-green-600 flex items-center justify-center overflow-hidden">
                        <img 
                          src={botAvatarUrl} 
                          alt="TaxiBot" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add('bg-green-600');
                            e.target.parentNode.innerHTML = '<svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
                          }}
                        />
                      </div>
                      <div className="bg-gray-100 rounded-lg rounded-bl-none p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">TaxiBot está digitando...</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-gray-500 mb-2">Sugestões rápidas:</p>
                  <div className="flex flex-wrap gap-1">
                    {quickSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="text-xs h-6 px-2 bg-gray-100 hover:bg-blue-50 border border-gray-200 rounded"
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{ cursor: 'pointer' }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t p-4">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Digite sua mensagem..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 text-sm p-2 border border-gray-300 rounded"
                    data-testid="chat-input"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-4 py-2 rounded text-white disabled:opacity-50"
                    data-testid="chat-send-button"
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Para suporte técnico: 📧 suporte@sindtaxi-es.org
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;