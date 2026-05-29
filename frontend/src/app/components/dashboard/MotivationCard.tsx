'use client';

import { Clock } from 'lucide-react';
import { CARD2, ORANGE, MUTED, BORDER, TEXT, GREEN, AiLog } from './calendarUtils';

// ─── Motivation Quote Card ────────────────────────────────────────────────────
export function MotivationCard({ quote }: { quote: string }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12,
      backgroundColor: 'rgba(255,92,0,0.03)',
      border: '1.5px dashed rgba(255,92,0,0.2)',
      color: ORANGE, fontSize: 11, lineHeight: 1.5,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        TAMQUAN ĐANG NÓI 💬
      </div>
      <div>"{quote}"</div>
    </div>
  );
}

// ─── AI Activity Log Card ─────────────────────────────────────────────────────
export function AiActivityLog({ logs }: { logs: AiLog[] }) {
  const badgeColor = (status: AiLog['status']) => {
    if (status === 'success') return GREEN;
    if (status === 'error')   return '#EF4444';
    if (status === 'info')    return '#60A5FA';
    return ORANGE;
  };

  return (
    <div style={{
      backgroundColor: CARD2, borderRadius: 16, padding: '12px 14px',
      border: `1px solid ${BORDER}`, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex', flexDirection: 'column', gap: 8,
      flexShrink: 0, height: 140, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: `1px solid ${BORDER}`, paddingBottom: 6 }}>
        <Clock size={13} color={ORANGE} />
        <span style={{ color: TEXT, fontSize: 12, fontWeight: 700 }}>Nhật ký hoạt động AI</span>
      </div>

      {/* Log entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
        {logs.length === 0 ? (
          <div style={{ color: MUTED, fontSize: 10, textAlign: 'center', marginTop: 16, fontStyle: 'italic' }}>
            Chưa có hoạt động nào được ghi nhận hôm nay.
          </div>
        ) : logs.map((log, idx) => (
          <div key={idx} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            fontSize: 10, paddingBottom: 4,
            borderBottom: idx < logs.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ color: TEXT, fontWeight: 600 }}>{log.action}</span>
              <span style={{ color: MUTED, fontSize: 9.5 }}>{log.details}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
              <span style={{ color: MUTED, fontSize: 8.5 }}>{log.time}</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: badgeColor(log.status) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
