'use client';

import { useState, useRef, useEffect } from 'react';
import { BG, CARD, ORANGE, MUTED, BORDER, TEXT, Message, INITIAL_MESSAGES, QUICK_CHIPS } from './chatbotUtils';
import { ChatHeader } from './ChatHeader';
import { ChatMessage, TypingIndicator } from './ChatMessages';
import { ChatInput } from './ChatInput';

export function Screen5Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text?: string) => {
    const content = text || input.trim();
    if (!content) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    setMessages(prev => [...prev, { id: `m${Date.now()}`, from: 'user', text: content, time }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        id: `m${Date.now()}_bot`, from: 'bot',
        text: 'Đã nhận thông tin rồi! Để tôi cập nhật lịch cho anh Quân ngay! 🔥 Thực ra làm biếng lắm nhưng thôi kệ!',
        time,
      }]);
    }, 1400);
  };

  return (
    <div style={{
      width: 393, minWidth: 393, height: 1024, flexShrink: 0,
      background: BG, display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter,sans-serif', position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
        width: 300, height: 200, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,92,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Status bar */}
      <div style={{ height: 44, backgroundColor: CARD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ color: TEXT, fontSize: 12, fontWeight: 700 }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill={TEXT}>
            <rect x="0" y="4" width="3" height="8" rx="0.5"/>
            <rect x="4.5" y="2.5" width="3" height="9.5" rx="0.5"/>
            <rect x="9" y="0.5" width="3" height="11.5" rx="0.5"/>
            <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" opacity="0.3"/>
          </svg>
          <span style={{ color: TEXT, fontSize: 12, fontWeight: 600 }}>87%</span>
        </div>
      </div>

      <ChatHeader />

      {/* Date separator */}
      <div style={{ textAlign: 'center', padding: '10px 0', flexShrink: 0 }}>
        <span style={{ color: MUTED, fontSize: 11, fontWeight: 600, padding: '4px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
          Hôm nay, 29 tháng 5
        </span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      <div style={{ padding: '10px 14px 0', flexShrink: 0, display: 'flex', gap: 7, overflowX: 'auto' }}>
        {QUICK_CHIPS.map(chip => (
          <button key={chip} onClick={() => send(chip)} style={{
            padding: '6px 12px', borderRadius: 20, whiteSpace: 'nowrap',
            background: 'rgba(255,92,0,0.08)', border: '1px solid rgba(255,92,0,0.25)',
            color: ORANGE, fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            transition: 'all 0.2s',
          }}>{chip}</button>
        ))}
      </div>

      <ChatInput input={input} setInput={setInput} onSend={() => send()} />
    </div>
  );
}
