import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ChatFeed = ({ messages, isLoading }) => {
  const containerRef = useRef(null);
  const endRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Antigravity GSAP animation for new messages
  useEffect(() => {
    const el = containerRef.current.lastElementChild;
    if (el) {
      gsap.fromTo(el, 
        { y: 20, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-5 pb-6 pr-2" ref={containerRef}>
      {messages.map((m, i) => (
        <div 
          key={i} 
          className={`px-5 py-4 max-w-[85%] leading-relaxed tracking-tight break-words ${
            m.role === 'user' 
              ? 'bg-groww-teal text-white rounded-2xl rounded-tr-sm self-end shadow-md font-medium' 
              : 'bg-groww-gray text-groww-dark rounded-2xl rounded-tl-sm self-start shadow-sm'
          }`}
        >
          {m.content}
        </div>
      ))}
      {isLoading && (
        <div className="bg-groww-gray rounded-2xl rounded-tl-sm self-start px-5 py-4 text-groww-text-muted text-sm animate-pulse tracking-wide shadow-sm">
          Generating response...
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};

export default ChatFeed;
