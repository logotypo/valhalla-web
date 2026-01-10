
import React, { useState, useRef, useEffect } from 'react';
import { getOdinAdvice } from '../services/geminiService';

const OdinAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'odin'; text: string }[]>([
    { role: 'odin', text: 'Saludos, superviviente. Soy el Oráculo de Odín. ¿Qué buscas saber del Valhalla?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const response = await getOdinAdvice(userText);
    setMessages(prev => [...prev, { role: 'odin', text: response || '' }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="w-80 md:w-96 bg-surface-dark border-2 border-primary/30 shadow-2xl rounded-lg overflow-hidden flex flex-col animate-in slide-in-from-bottom-4">
          <div className="bg-primary p-4 flex justify-between items-center">
            <h3 className="font-display font-bold text-black uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">visibility</span>
              Oráculo de Odín
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-black/60 hover:text-black">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-4 bg-[#0c0c0c]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-md text-sm leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-accent-red text-white font-bold' 
                  : 'bg-surface-accent border border-primary/20 text-gray-200 font-body'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-accent border border-primary/20 p-3 rounded-md animate-pulse">
                  <div className="flex gap-1">
                    <div className="size-1.5 bg-primary rounded-full"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                    <div className="size-1.5 bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/5 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Habla con el Oráculo..."
              className="flex-grow bg-black/50 border border-primary/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
            <button 
              onClick={handleSend}
              className="bg-primary text-black px-3 py-2 rounded hover:bg-primary-hover transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="size-16 bg-primary rounded-full shadow-[0_0_30px_rgba(242,185,13,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-black group"
        >
          <span className="material-symbols-outlined text-black text-4xl group-hover:animate-pulse">visibility</span>
          <div className="absolute -top-1 -right-1 size-5 bg-accent-red rounded-full border-2 border-black animate-bounce flex items-center justify-center">
            <span className="text-[10px] font-black text-white">!</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default OdinAssistant;
