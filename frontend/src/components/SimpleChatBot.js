import React, { useState } from 'react';
import { Button } from './ui/button';

const SimpleChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    console.log('Chat toggle clicked, isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleChat}
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700"
            data-testid="simple-chat-button"
          >
            💬
          </Button>
        </div>
      )}

      {/* Chat Window Simples */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-white border rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">TaxiBot</h3>
            <Button onClick={toggleChat} className="text-xs p-1">✕</Button>
          </div>
          <div className="h-64 bg-gray-50 p-2 rounded mb-4">
            <p>Olá! Sou o TaxiBot. Como posso ajudar?</p>
          </div>
          <input 
            type="text" 
            placeholder="Digite sua mensagem..." 
            className="w-full p-2 border rounded"
            data-testid="simple-chat-input"
          />
        </div>
      )}
    </>
  );
};

export default SimpleChatBot;