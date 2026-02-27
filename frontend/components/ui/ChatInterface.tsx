'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch History we tested earlier
    api.get('/tickets/chat-history').then(res => setMessages(res.data));
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await api.post('/tickets/ask-ai', { prompt: input });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
      setInput('');
    } catch (err) {
      console.error("AI Error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl bg-white border rounded-lg shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-gray-400">Gemini is thinking...</p>}
      </div>
      <div className="p-4 border-t flex gap-2">
        <input 
          className="flex-1 p-2 border rounded" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about ASTU..."
        />
        <button onClick={sendMessage} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}