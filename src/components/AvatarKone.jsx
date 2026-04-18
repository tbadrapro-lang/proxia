import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AvatarKone() {
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Bonjour ! Je suis Koné, l'agent IA Proxia 👋 Comment puis-je vous aider ?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const show = setTimeout(() => setShowBubble(true), 3000);
    const hide = setTimeout(() => setShowBubble(false), 9000);
    const interval = setInterval(() => {
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 6000);
    }, 15000);
    return () => { clearTimeout(show); clearTimeout(hide); clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || 'Désolé, une erreur est survenue.' }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Je suis temporairement indisponible. Appelez-nous au 06 74 31 45 75.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bulle "Besoin d'aide ?" */}
      <AnimatePresence>
        {showBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            className="fixed bottom-44 right-4 md:bottom-28 md:right-6 z-50 bg-white rounded-2xl rounded-br-sm shadow-lg px-4 py-2 text-sm font-medium text-gray-800 border border-violet-100"
          >
            Besoin d&apos;aide ? 👋
            <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-white border-b border-r border-violet-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar personnage animé */}
      <motion.button
        onClick={() => { setOpen(!open); setShowBubble(false); }}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50 focus:outline-none"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Anneau pulse */}
        <div className="absolute inset-0 rounded-full bg-violet-400 animate-ping opacity-20" />
        {/* Avatar */}
        <motion.div
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-violet-400 shadow-lg shadow-violet-500/40"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#F59E0B)' }}
        >
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <defs>
              <radialGradient id="bg-grad" cx="45%" cy="40%">
                <stop offset="0%" stopColor="#1a0533" />
                <stop offset="100%" stopColor="#0a0118" />
              </radialGradient>
              <radialGradient id="eye-grad">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#7C3AED" />
              </radialGradient>
            </defs>
            <circle cx="40" cy="40" r="40" fill="url(#bg-grad)" />
            <circle cx="40" cy="40" r="36" fill="none" stroke="#7C3AED" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.6" className="ring-rotate" style={{ transformOrigin: '40px 40px' }} />
            <circle cx="40" cy="40" r="32" fill="none" stroke="#F59E0B" strokeWidth="0.3" strokeDasharray="2 10" opacity="0.4" style={{ animation: 'ring-rotate 12s linear infinite reverse', transformOrigin: '40px 40px' }} />
            <path d="M25 18 L40 12 L55 18" stroke="#F59E0B" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
            <circle cx="40" cy="12" r="2.5" fill="#F59E0B" opacity="0.9" />
            <circle cx="25" cy="18" r="1.5" fill="#F59E0B" opacity="0.6" />
            <circle cx="55" cy="18" r="1.5" fill="#F59E0B" opacity="0.6" />
            <line x1="20" y1="35" x2="15" y2="35" stroke="#06B6D4" strokeWidth="0.8" opacity="0.5" />
            <circle cx="14" cy="35" r="1.5" fill="#06B6D4" opacity="0.7" />
            <line x1="60" y1="35" x2="65" y2="35" stroke="#06B6D4" strokeWidth="0.8" opacity="0.5" />
            <circle cx="66" cy="35" r="1.5" fill="#06B6D4" opacity="0.7" />
            <ellipse cx="40" cy="52" rx="22" ry="18" fill="#4A2C6E" opacity="0.8" />
            <ellipse cx="40" cy="34" rx="16" ry="18" fill="#5B3A7E" />
            <ellipse cx="40" cy="33" rx="13" ry="14" fill="#7C4DAA" />
            <ellipse cx="33" cy="30" rx="5" ry="5.5" fill="white" opacity="0.95" />
            <ellipse cx="47" cy="30" rx="5" ry="5.5" fill="white" opacity="0.95" />
            <ellipse cx="33" cy="31" rx="3" ry="3.5" fill="url(#eye-grad)" />
            <ellipse cx="47" cy="31" rx="3" ry="3.5" fill="url(#eye-grad)" />
            <circle cx="32" cy="30" r="1" fill="white" opacity="0.9" />
            <circle cx="46" cy="30" r="1" fill="white" opacity="0.9" />
            <path d="M38 35 Q40 38 42 35" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4" />
            <path d="M33 41 Q40 47 47 41" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85" />
            <rect x="27" y="22" width="26" height="3" fill="white" opacity="0.05" rx="1" />
            <rect x="27" y="35" width="26" height="2" fill="white" opacity="0.04" rx="1" />
            <circle cx="37" cy="23" r="1" fill="#06B6D4" opacity="0.6" />
            <circle cx="40" cy="22" r="1.2" fill="#7C3AED" opacity="0.8" />
            <circle cx="43" cy="23" r="1" fill="#06B6D4" opacity="0.6" />
          </svg>
        </motion.div>
      </motion.button>

      {/* Panel chatbot */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-44 right-4 md:bottom-24 md:right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-violet-100 flex flex-col overflow-hidden"
            style={{ maxHeight: '420px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-violet-600">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-violet-300">
                <svg viewBox="0 0 80 80" className="w-full h-full">
                  <defs>
                    <radialGradient id="bg2" cx="45%" cy="40%">
                      <stop offset="0%" stopColor="#2D1154" />
                      <stop offset="100%" stopColor="#150829" />
                    </radialGradient>
                  </defs>
                  <circle cx="40" cy="40" r="40" fill="url(#bg2)" />
                  <path d="M25 18 L40 12 L55 18" stroke="#F59E0B" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
                  <circle cx="40" cy="12" r="2.5" fill="#F59E0B" opacity="0.9" />
                  <ellipse cx="40" cy="52" rx="22" ry="18" fill="#3D2060" opacity="0.8" />
                  <ellipse cx="40" cy="33" rx="13" ry="14" fill="#6B3D99" />
                  <ellipse cx="33" cy="30" rx="5" ry="5.5" fill="white" opacity="0.95" />
                  <ellipse cx="47" cy="30" rx="5" ry="5.5" fill="white" opacity="0.95" />
                  <ellipse cx="33" cy="31" rx="3" ry="3.5" fill="#06B6D4" />
                  <ellipse cx="47" cy="31" rx="3" ry="3.5" fill="#06B6D4" />
                  <circle cx="32" cy="30" r="1" fill="white" opacity="0.9" />
                  <circle cx="46" cy="30" r="1" fill="white" opacity="0.9" />
                  <path d="M33 41 Q40 47 47 41" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.85" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Koné — Agent IA</p>
                <p className="text-violet-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />En ligne
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-lg leading-none">×</button>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2" style={{ minHeight: '200px' }}>
              {messages.map((m, i) => (
                <div key={i} className={`text-xs px-3 py-2 rounded-xl max-w-[85%] ${
                  m.role === 'assistant' ? 'bg-gray-100 text-gray-800 self-start' : 'bg-violet-600 text-white self-end'
                }`}>
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="bg-gray-100 rounded-xl px-3 py-2 self-start flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 block"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ delay: i * 0.15, repeat: Infinity, duration: 0.6 }} />
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2 px-3 py-3 border-t border-gray-100">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Posez votre question..."
                className="flex-1 text-xs border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:border-violet-400" />
              <button onClick={send}
                className="w-8 h-8 rounded-full bg-violet-600 text-white text-sm flex items-center justify-center hover:bg-violet-700">
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
