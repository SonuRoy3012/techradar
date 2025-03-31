"use client";

import React, { useState, useEffect, useRef } from 'react';
import { XGBoostChatModel } from '@/lib/models/XGBoostChatModel';

// Legacy Simple ML model for the chatbot - replaced with XGBoostChatModel
/* class SimpleChatbotModel {
  private responses: Record<string, string>;
  private fallbackResponses: string[];

  constructor() {
    // Initial training data
    this.responses = {
      "hello": "Hi there! How can I help you today?",
      "hi": "Hello! How can I assist you?",
      "how are you": "I'm just a bot, but I'm functioning well! How can I help you?",
      "help": "I can help you with product information, store locations, and basic troubleshooting. What do you need?",
      "bye": "Goodbye! Feel free to chat again if you need assistance.",
      "thank you": "You're welcome! Is there anything else I can help with?",
      "thanks": "You're welcome! Is there anything else I can help with?",
      "product": "We offer smartphones, laptops, and accessories. Which category are you interested in?",
      "smartphone": "We have the latest models from Apple, Samsung, and other brands. Would you like specific information?",
      "laptop": "Our laptop collection includes gaming, business, and everyday use models. What are you looking for?",
      "store": "You can find our stores in major cities. Use the store locator on the customer dashboard to find the nearest one.",
      "price": "Prices vary by product. You can check specific prices on the product pages or visit a store near you.",
      "discount": "We regularly offer discounts and promotions. Check the offers section for current deals.",
      "warranty": "Most products come with a standard 1-year warranty. Extended warranty options are available at checkout.",
      "return policy": "We offer a 30-day return policy for most products, provided they're in original condition with packaging."
    };

    this.fallbackResponses = [
      "I'm not sure I understand. Could you rephrase that?",
      "I don't have information on that yet. Can I help with something else?",
      "I'm still learning! Could you try asking something else?",
      "I don't have an answer for that. Would you like to know about our products or stores instead?"
    ];
  }

  // Train the model with new data
  train(input: string, response: string): void {
    const normalizedInput = input.toLowerCase().trim();
    this.responses[normalizedInput] = response;
  }

  // Get a response based on input
  getResponse(input: string): string {
    const normalizedInput = input.toLowerCase().trim();
    
    // Direct match
    if (this.responses[normalizedInput]) {
      return this.responses[normalizedInput];
    }
    
    // Partial match (simple keyword matching)
    for (const key in this.responses) {
      if (normalizedInput.includes(key)) {
        return this.responses[key];
      }
    }
    
    // Fallback response
    return this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
  }
} */

interface ChatBotProps {
  onClose: () => void;
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! I'm TechBot. How can I help you today?", isUser: false, timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [trainingInput, setTrainingInput] = useState("");
  const [trainingResponse, setTrainingResponse] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotModel = useRef(new XGBoostChatModel());

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Get bot response
    setTimeout(() => {
      const botResponse = chatbotModel.current.getResponse(input);
      const botMessage: Message = {
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500); // Small delay to simulate thinking
    
    setInput("");
  };

  const handleTrainModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingInput.trim() || !trainingResponse.trim()) return;
    
    // Train the model
    chatbotModel.current.train(trainingInput, trainingResponse);
    
    // Reset training form
    setTrainingInput("");
    setTrainingResponse("");
    setIsTraining(false);
    
    // Confirmation message
    setMessages(prev => [
      ...prev, 
      { 
        text: "I've learned a new response! Try asking me about it.", 
        isUser: false, 
        timestamp: new Date() 
      }
    ]);
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-blue-100 z-[9999] flex flex-col max-h-[500px]" style={{ opacity: 1, visibility: 'visible' }}>
      <div className="p-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-t-lg flex justify-between items-center">
        <h3 className="font-medium">TechBot Assistant</h3>
        <button onClick={onClose} className="text-white hover:text-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-blue-50/50">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-3 ${msg.isUser ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                msg.isUser 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-blue-100 rounded-tl-none text-black'
              }`}
              style={{ color: msg.isUser ? 'white' : 'black', fontWeight: 'normal' }}
            >
              {msg.text}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {isTraining ? (
        <div className="p-3 border-t border-blue-100">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Train TechBot</h4>
          <form onSubmit={handleTrainModel} className="space-y-2">
            <input
              type="text"
              value={trainingInput}
              onChange={(e) => setTrainingInput(e.target.value)}
              placeholder="When I say this..."
              className="w-full p-2 border border-blue-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              type="text"
              value={trainingResponse}
              onChange={(e) => setTrainingResponse(e.target.value)}
              placeholder="You should respond with..."
              className="w-full p-2 border border-blue-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsTraining(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-3 border-t border-blue-100">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsTraining(true)}
              className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              title="Train the chatbot"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;