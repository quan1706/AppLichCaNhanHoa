'use client';

import { Flame } from 'lucide-react';
import { BG, CARD2, ORANGE, MUTED, BORDER, TEXT, GREEN } from './calendarUtils';

interface Props {
  water: number;
  onAddWater: (amount: number) => void;
}

export function HealthCard({ water, onAddWater }: Props) {
  const currentWeight = 92;
  const targetWeight  = 78;
  const currentDiff   = 92 - 91.4;
  const weightPct     = (currentDiff / (currentWeight - targetWeight)) * 100;

  // SVG water ring
  const waterGoal    = 3500;
  const r            = 42;
  const circ         = 2 * Math.PI * r;
  const waterPct     = Math.min(water / waterGoal, 1);
  const dashoffset   = circ * (1 - waterPct);

  return (
    <div style={{
      backgroundColor: CARD2, borderRadius: 16, padding: '16px 18px', marginBottom: 14,
      border: '1px solid rgba(255,92,0,0.18)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Flame size={15} color={ORANGE} />
        <span style={{ color: TEXT, fontSize: 13, fontWeight: 700 }}>Thể hình & Dinh dưỡng Kỷ luật</span>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {/* Left col: weight + calo + protein */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Weight bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: TEXT, fontWeight: 600 }}>
                Cân nặng: <strong style={{ color: ORANGE }}>91.4 kg</strong>
              </span>
              <span style={{ color: MUTED }}>Mục tiêu: 78 kg</span>
            </div>
            <div style={{ height: 6, backgroundColor: BG, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(weightPct, 8)}%`, borderRadius: 3, backgroundColor: ORANGE }} />
            </div>
          </div>

          {/* Calo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}` }}>
            <span style={{ color: MUTED, fontSize: 11 }}>Calo thâm hụt:</span>
            <span style={{ color: TEXT, fontSize: 12, fontWeight: 700 }}>
              1,200 <span style={{ color: MUTED, fontSize: 9 }}>/ 1,600 kcal</span>
            </span>
          </div>

          {/* Protein */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}` }}>
            <span style={{ color: MUTED, fontSize: 11 }}>Lượng đạm nạp:</span>
            <span style={{ color: GREEN, fontSize: 12, fontWeight: 700 }}>
              118g <span style={{ color: MUTED, fontSize: 9 }}>/ 130g</span>
            </span>
          </div>
        </div>

        {/* Right col: SVG water ring */}
        <div style={{ width: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 90, height: 90 }}>
            <svg width={90} height={90} viewBox="0 0 90 90">
              <circle cx={45} cy={45} r={r} fill="none" stroke={BORDER} strokeWidth={8} />
              <circle
                cx={45} cy={45} r={r} fill="none"
                stroke={ORANGE} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={dashoffset}
                transform="rotate(-90 45 45)"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
              <text x={45} y={44} textAnchor="middle" fill={TEXT}  fontSize={15} fontWeight={800} fontFamily="Inter,sans-serif">{water}</text>
              <text x={45} y={58} textAnchor="middle" fill={MUTED} fontSize={9}  fontFamily="Inter,sans-serif">/ 3500 ml</text>
              <text x={45} y={70} textAnchor="middle" fill={ORANGE} fontSize={8} fontWeight={700} fontFamily="Inter,sans-serif">
                {Math.round(waterPct * 100)}%
              </text>
            </svg>
          </div>

          {/* Quick add buttons */}
          <div style={{ display: 'flex', gap: 6, width: '100%', marginTop: 8 }}>
            <button onClick={() => onAddWater(250)} style={{ flex: 1, minHeight: 36, padding: '4px 0', borderRadius: 8, backgroundColor: ORANGE, border: 'none', color: TEXT, fontSize: 10, fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 6px rgba(255,92,0,0.2)' }}>
              +250ml
            </button>
            <button onClick={() => onAddWater(500)} style={{ flex: 1, minHeight: 36, padding: '4px 0', borderRadius: 8, backgroundColor: 'transparent', border: `1px solid ${ORANGE}`, color: ORANGE, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
              +500
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
