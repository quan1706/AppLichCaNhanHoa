'use client';

import { Send, Mic } from 'lucide-react';
import { ORANGE, TEXT, BORDER, MUTED } from './chatbotUtils';

interface Props {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
}

export function ChatInput({ input, setInput, onSend }: Props) {
  return (
    <div style={{
      padding: '10px 14px 24px',
      background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)',
      borderTop: `1px solid ${BORDER}`, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 10, marginTop: 8,
    }}>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)',
        borderRadius: 24, padding: '4px 16px',
        border: `1px solid ${input ? 'rgba(255,92,0,0.3)' : BORDER}`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: input ? '0 0 12px rgba(255,92,0,0.1)' : 'none',
      }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSend()}
          placeholder="Nhắn tin cho tamquan..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: TEXT, fontSize: 14, padding: '8px 0', fontFamily: 'inherit',
          }}
        />
      </div>
      <button style={{
        width: 40, height: 40, borderRadius: '50%', border: 'none',
        background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Mic size={17} color={MUTED} />
      </button>
      <button onClick={onSend} style={{
        width: 44, height: 44, borderRadius: '50%', border: 'none',
        background: input.trim() ? `linear-gradient(135deg, ${ORANGE}, #FF3D00)` : 'rgba(255,255,255,0.05)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: input.trim() ? '0 0 16px rgba(255,92,0,0.5)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        transform: input.trim() ? 'scale(1.1)' : 'scale(1)',
        flexShrink: 0,
      }}>
        <Send size={18} color={input.trim() ? '#fff' : MUTED} style={{ marginLeft: 2 }} />
      </button>
    </div>
  );
}
