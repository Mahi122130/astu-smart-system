'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Send, Bot, User } from 'lucide-react';

export default function AskAIPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/tickets/chat-history').then(res => setMessages(res.data));
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const res = await api.post('/tickets/ask-ai', { prompt: input });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-800 shadow-sm'}`}>
              {m.role === 'user' ? <User size={20}/> : <Bot size={20}/>}
            </div>
            <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-slate-700 shadow-sm rounded-tl-none'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-slate-400 animate-pulse flex items-center gap-2"><Bot size={14}/> Gemini is typing...</div>}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 bg-white border-t flex gap-4">
        <input className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline