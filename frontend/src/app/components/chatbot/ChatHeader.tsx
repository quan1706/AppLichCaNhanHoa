'use client';

import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { ORANGE, TEXT, BG, BORDER, MUTED } from './chatbotUtils';

export function ChatHeader() {
  return (
    <div style={{
      background: 'rgba(14,14,14,0.95)', backdropFilter: 'blur(16px)',
      padding: '10px 16px', borderBottom: `1px solid ${BORDER}`,
      flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
        <ArrowLeft size={20} color={ORANGE} />
      </button>

      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: `linear-gradient(135deg, ${ORANGE}, #FF3D00)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${ORANGE}`,
          boxShadow: `0 0 16px rgba(255,92,0,0.6)`,
          animation: 'neonPulse 3s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 20 }}>🤖</span>
        </div>
        <div style={{
          position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: '50%',
          background: '#22C55E', border: `2px solid ${BG}`,
          boxShadow: '0 0 6px rgba(34,197,94,0.8)',
          animation: 'ledBlink 2s ease-in-out infinite',
        }} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ color: TEXT, fontSize: 14, fontWeight: 800 }}>tamquan 🤖</div>
        <div style={{ color: '#22C55E', fontSize: 11, marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'ledBlink 2s infinite' }} />
          đang hoạt động
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {[Phone, Video, MoreVertical].map((Icon, i) => (
          <button key={i} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <Icon size={18} color={i < 2 ? ORANGE : MUTED} style={i < 2 ? { filter: 'drop-shadow(0 0 4px rgba(255,92,0,0.6))' } : {}} />
          </button>
        ))}
      </div>
    </div>
  );
}
