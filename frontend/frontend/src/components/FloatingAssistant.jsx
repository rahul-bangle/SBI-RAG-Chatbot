import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minus, Maximize2 } from 'lucide-react';
import gsap from 'gsap';
import axios from 'axios';
import { useBackendStatus } from '../hooks/useBackendStatus';
import API_BASE_URL from '../api';

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your SBI Mutual Fund Facts-Only assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const backendStatus = useBackendStatus();
  
  const chatRef = useRef(null);
  const feedRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(chatRef.current, 
        { scale: 0.8, opacity: 0, y: 50 }, 
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/chat`, { query: input });
      setMessages(prev => [...prev, { role: 'bot', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "I'm having trouble connecting to the data engine. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div 
          ref={chatRef}
          className="w-[calc(100vw-32px)] sm:w-[400px] h-[550px] md:h-[600px] bg-white rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-100 mb-4 md:mb-6"
        >
          {/* Header */}
          <div className="bg-white border-b border-[#EBEBF0] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-groww-dark">
                <div className="w-8 h-8 rounded-full border-2 border-groww-teal flex items-center justify-center">
                   <span className="text-groww-teal font-bold text-xs uppercase">S</span>
                </div>
                <div>
                   <h4 className="font-bold text-sm">SBI MF Assistant</h4>
                   <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        backendStatus.status === 'online' ? 'bg-green-400' :
                        backendStatus.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-[10px] text-groww-text-muted font-medium capitalize">
                        {backendStatus.status === 'checking' ? 'Connecting...' : backendStatus.status}
                      </span>
                   </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-groww-gray rounded-full text-groww-text-muted transition-colors">
                    <X size={18} />
                </button>
            </div>
          </div>

          {/* Feed */}
          <div ref={feedRef} className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-4 bg-gray-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] md:text-[14px] leading-relaxed tracking-tight shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-groww-teal text-white rounded-tr-sm font-medium' 
                    : 'bg-groww-gray text-groww-dark rounded-tl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm text-gray-400 text-xs animate-pulse font-medium uppercase tracking-widest">
                  Analyzing document chunks...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Ask about SBI Mutual Funds..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full bg-groww-gray border-none rounded-xl py-3.5 md:py-4 px-5 pr-12 text-sm outline-none focus:ring-1 focus:ring-groww-teal transition-all placeholder:text-gray-400 font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-groww-teal text-white rounded-lg disabled:opacity-50 transition-all hover:bg-[#00B889] active:scale-95 shadow-md shadow-groww-teal/20"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[9px] md:text-[10px] text-center text-gray-400 mt-3 font-bold uppercase tracking-widest">
                Source: official amfi & sbimf.com · 2026
            </p>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 z-[101] ${isOpen ? 'bg-red-500 rotate-90' : 'bg-groww-teal'}`}
      >
        {isOpen ? <X size={isOpen ? 24 : 28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default FloatingAssistant;
