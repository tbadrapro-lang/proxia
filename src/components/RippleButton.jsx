import { useState } from 'react';

export default function RippleButton({ children, onClick, className = '' }) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
    onClick?.();
  };

  return (
    <button onClick={handleClick} className={`relative overflow-hidden ${className}`}>
      {children}
      {ripples.map(r => (
        <span key={r.id} style={{ left: r.x, top: r.y }}
          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white/30 rounded-full animate-ping pointer-events-none" />
      ))}
    </button>
  );
}
