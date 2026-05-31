'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CARD, ORANGE, MUTED, BORDER, TEXT } from './calendarUtils';

interface Props {
  navLabel: string;
  viewMode: 'week' | 'month' | 'year';
  onPrevTime: () => void;
  onNextTime: () => void;
  onGoToday: () => void;
}

export function TimeNavigation({ navLabel, viewMode, onPrevTime, onNextTime, onGoToday }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: TEXT, fontSize: 15, fontWeight: 700 }}>{navLabel}</span>
        <span style={{
          color: MUTED,
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 8px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
        }}>
          {viewMode === 'week' ? 'Chế độ Tuần' : viewMode === 'month' ? 'Chế độ Tháng' : 'Chế độ Năm'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={onPrevTime}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = CARD;
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: CARD,
            border: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: TEXT,
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={onGoToday}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = ORANGE;
            e.currentTarget.style.color = '#000';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = ORANGE;
            e.currentTarget.style.transform = 'scale(1)';
          }}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            backgroundColor: 'transparent',
            border: `1px solid ${ORANGE}`,
            color: ORANGE,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Hôm nay
        </button>

        <button
          onClick={onNextTime}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = CARD;
          }}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: CARD,
            border: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: TEXT,
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
