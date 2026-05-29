'use client';

import { CheckCheck } from 'lucide-react';
import { Message, ORANGE, TEXT, BORDER, MUTED } from './chatbotUtils';

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${ORANGE}, #FF3D00)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13 }}>🤖</span>
      </div>
      <div style={{
        background: 'rgba(30,30,30,0.9)', backdropFilter: 'blur(8px)',
        borderRadius: '14px 14px 14px 3px', padding: '12px 16px',
        border: `1px solid ${BORDER}`,
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', backgroundColor: ORANGE,
            animation: `dotBounce 0.6s ease ${i * 0.15}s infinite alternate`,
          }} />
        ))}
      </div>
    </div>
  );
}

export function ChatMessage({ msg }: { msg: Message }) {
  if (msg.from === 'bot') {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, animation: `countUp 0.3s ease both` }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${ORANGE}, #FF3D00)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 13 }}>🤖</span>
        </div>
        <div style={{ maxWidth: '78%' }}>
          <div style={{
            background: 'rgba(28,28,28,0.9)', backdropFilter: 'blur(8px)',
            borderRadius: '14px 14px 14px 3px', padding: '12px 14px',
            color: TEXT, fontSize: 13, lineHeight: 1.6,
            border: `1px solid ${BORDER}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}>
            {msg.text}
          </div>
          {msg.hasActions && (
            <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
              <button style={{
                flex: 1, padding: '10px 0', borderRadius: 22,
                background: `linear-gradient(135deg, ${ORANGE}, #FF3D00)`,
                border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 0 12px rgba(255,92,0,0.4)', whiteSpace: 'nowrap',
              }}>🥛 Đã uống 500ml</button>
              <button style={{
                flex: 1, padding: '10px 0', borderRadius: 22,
                background: 'transparent', border: `1.5px solid ${ORANGE}`,
                color: ORANGE, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>⏰ Nhắc lại 10p</button>
            </div>
          )}
          <div style={{ color: MUTED, fontSize: 10, marginTop: 4, paddingLeft: 4 }}>{msg.time}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 5, animation: `countUp 0.3s ease both` }}>
      <div style={{ maxWidth: '72%' }}>
        <div style={{
          background: `linear-gradient(135deg, ${ORANGE}ee, #FF3D00cc)`,
          borderRadius: '14px 14px 3px 14px',
          padding: '12px 14px', color: '#fff', fontSize: 13, lineHeight: 1.6,
          boxShadow: '0 0 16px rgba(255,92,0,0.3)',
        }}>
          {msg.text}
        </div>
        <div style={{ color: MUTED, fontSize: 10, marginTop: 4, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          <span>{msg.time}</span>
          <CheckCheck size={13} color={ORANGE} />
        </div>
      </div>
    </div>
  );
}
