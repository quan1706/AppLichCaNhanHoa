'use client';

import { TEXT, MUTED } from './nutritionUtils';

interface Props {
  size: number;
  value: number;
  max: number;
  color: string;
  label: string;
  sublabel: string;
  thickness?: number;
}

export function DonutRing({ size, value, max, color, label, sublabel, thickness = 10 }: Props) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value / max, 1));
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)',
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <span style={{ color: TEXT, fontSize: size * 0.17, fontWeight: 800, lineHeight: 1 }}>{label}</span>
        <span style={{ color: MUTED, fontSize: size * 0.1, lineHeight: 1 }}>{sublabel}</span>
      </div>
    </div>
  );
}
