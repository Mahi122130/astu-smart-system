'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Send, MessageSquare, Bot, User, Plus } from 'lucide-react';

export default function AskAIPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      console.log('Fetching chat history...');
      const res = await api.get('/tickets/chat-history');
      setHistory(res.data);
      setMessages(res.data); // Display full conversation
      console.log('Chat history fetched successfully:', res.data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setLoading(true);
    setInput('');

    try {
      console.log('Sending message to AI:', input);
      const res = await api.post('/tickets/ask-ai', { prompt: input });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer }]);
      console.log('AI response received:', res.data.answer);
      fetchHistory(); // Refresh sidebar history
    } catch (err) {
      console.error('Error sending message to AI:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Mini Sidebar for History */}
      <div className="w-64 bg-white rounded-2xl border border-slate-200 flex flex-col hidden lg:flex">
        <div className="p-4 border-b font-bold text-slate-700 flex items-center gap-2">
          <MessageSquare size={18} /> Chat History
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history.filter(h => h.role === 'assistant').slice(-10).map((h, i) => (
            <div key={i} className="p-3 text-xs text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer truncate">
              {h.content}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-full ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'}`}>
                {m.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-slate-700 shadow-sm rounded-tl-none'}`}>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200 focus-within:ring-2 ring-blue-500 transition">
            <input 
              className="flex-1 bg-transparent border-none outline-none px-2 text-sm"
              placeholder="How do I pay my registration fees?" 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={loading} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
              <Send size={18}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}