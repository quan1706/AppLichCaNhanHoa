'use client';

import { Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { CARD, ORANGE, MUTED, BORDER, TEXT } from './calendarUtils';

interface Props {
  aiPrompt: string;
  setAiPrompt: (val: string) => void;
  isSendingAi: boolean;
  onSendAi: () => void;
  viewMode: 'week' | 'month' | 'year';
  setViewMode: (mode: 'week' | 'month' | 'year') => void;
  navLabel: string;
  onPrevTime: () => void;
  onNextTime: () => void;
  onGoToday: () => void;
}

export function DashboardHeader({
  aiPrompt, setAiPrompt, isSendingAi, onSendAi,
  viewMode, setViewMode, navLabel,
  onPrevTime, onNextTime, onGoToday,
}: Props) {
  return (
    <>
      {/* ── Top Header ── */}
      <div style={{ padding: '14px 24px', backgroundColor: CARD, borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ color: TEXT, fontSize: 18, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>
              DASHBOARD <span style={{ color: ORANGE }}>KỶ LUẬT</span>
            </h1>
            <div style={{ padding: '4px 10px', backgroundColor: 'rgba(255,92,0,0.1)', borderRadius: 20, color: ORANGE, fontSize: 11, fontWeight: 700 }}>
              Mục tiêu: 78kg
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10, border: `1px solid ${BORDER}` }}>
            {[
              { id: 'week', label: 'Tuần' },
              { id: 'month', label: 'Tháng' },
              { id: 'year', label: 'Năm' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as any)}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  backgroundColor: viewMode === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: viewMode === tab.id ? TEXT : MUTED,
                  fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Input Bar */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSendAi()}
            placeholder="Ví dụ: 'Thêm 250ml nước', 'Có deadline môn PRM392', 'Lên lịch đá bóng 5h chiều nay'..."
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
              color: TEXT, fontSize: 13, outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,92,0,0.5)'}
            onBlur={e => e.target.style.borderColor = BORDER}
          />
          <button
            onClick={onSendAi}
            disabled={isSendingAi}
            style={{
              padding: '0 20px', borderRadius: 8,
              backgroundColor: ORANGE, border: 'none',
              color: TEXT, fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: isSendingAi ? 'wait' : 'pointer',
              opacity: isSendingAi ? 0.7 : 1, transition: 'all 0.2s',
            }}
          >
            <Send size={13} /> {isSendingAi ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>

      {/* ── Time Navigation Bar (inside calendar area but shared logic) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, paddingRight: 20, flexShrink: 0, padding: '16px 20px 0 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: TEXT, fontSize: 15, fontWeight: 700 }}>{navLabel}</span>
          <span style={{ color: MUTED, fontSize: 10, fontWeight: 600, padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
            {viewMode === 'week' ? 'Chế độ Tuần' : viewMode === 'month' ? 'Chế độ Tháng' : 'Chế độ Năm'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={onPrevTime} style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: CARD, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT }}>
            <ChevronLeft size={14} />
          </button>
          <button onClick={onGoToday} style={{ padding: '5px 12px', borderRadius: 8, backgroundColor: 'transparent', border: `1px solid ${ORANGE}`, color: ORANGE, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            Hôm nay
          </button>
          <button onClick={onNextTime} style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: CARD, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
