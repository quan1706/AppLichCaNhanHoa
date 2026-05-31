import { useState, useEffect } from 'react';
import { ORANGE, MUTED, BORDER, TEXT, GLASS } from './settingsUtils';

export function NInput({ label, value, onChange, unit, type = 'text', icon, neon = ORANGE }: {
  label: string; value: string | number; onChange?: (v: string) => void; unit?: string; type?: string; icon?: React.ReactNode; neon?: string;
}) {
  const [localVal, setLocalVal] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // Keep local state in sync when value from parent changes
  useEffect(() => {
    setLocalVal(String(value));
  }, [value]);

  const displayVal = onChange ? String(value) : localVal;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalVal(newVal);
    if (onChange) {
      onChange(newVal);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', color: focused ? neon : MUTED,
        fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 7,
        transition: 'color 0.2s',
      }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${focused ? neon : BORDER}`,
        borderRadius: 10, overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? `0 0 0 3px ${neon}18, 0 0 16px ${neon}20` : 'none',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: focused ? `linear-gradient(90deg, transparent, ${neon}, transparent)` : 'transparent',
          transition: 'background 0.3s',
        }} />
        {icon && <div style={{ padding: '0 12px', color: focused ? neon : MUTED, transition: 'color 0.2s', flexShrink: 0 }}>{icon}</div>}
        <input
          type={type} value={displayVal} onChange={handleChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, padding: icon ? '11px 12px 11px 0' : '11px 14px',
            background: 'transparent', border: 'none', outline: 'none',
            color: focused ? '#fff' : '#CCC',
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit', colorScheme: 'dark',
          }}
        />
        {unit && (
          <div style={{
            padding: '11px 14px', background: 'rgba(0,0,0,0.3)',
            borderLeft: `1px solid ${BORDER}`, color: focused ? neon : MUTED,
            fontSize: 12, fontWeight: 700, flexShrink: 0, transition: 'color 0.2s',
          }}>{unit}</div>
        )}
      </div>
    </div>
  );
}

export function NToggle({ on, color = ORANGE }: { on: boolean; color?: string }) {
  const [active, setActive] = useState(on);
  return (
    <div onClick={() => setActive(p => !p)} style={{
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
      background: active ? color : 'rgba(255,255,255,0.08)',
      position: 'relative', transition: 'background 0.25s',
      boxShadow: active ? `0 0 10px ${color}60` : 'none', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2, left: active ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 1px 5px rgba(0,0,0,0.5)',
      }} />
    </div>
  );
}

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export function DaySelector({ selected, onToggle, color = ORANGE }: { selected: number[]; onToggle: (i: number) => void; color?: string }) {
  return (
    <div className="settings-flex-wrap" style={{ display: 'flex', gap: 6 }}>
      {DAYS_SHORT.map((d, i) => {
        const active = selected.includes(i);
        return (
          <button key={d} onClick={() => onToggle(i)} style={{
            flex: '1 1 auto', minWidth: 40, height: 38, borderRadius: 9, cursor: 'pointer',
            background: active ? `${color}20` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${active ? color : BORDER}`,
            color: active ? color : MUTED,
            fontSize: 10, fontWeight: 700,
            transition: 'all 0.2s',
            boxShadow: active ? `0 0 8px ${color}40` : 'none',
          }}>{d}</button>
        );
      })}
    </div>
  );
}

export function SectionCard({ title, subtitle, icon, neon = ORANGE, children }: {
  title: string; subtitle?: string; icon: React.ReactNode; neon?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: GLASS, backdropFilter: 'blur(12px)',
      borderRadius: 16, padding: 24,
      border: `1px solid rgba(255,255,255,0.05)`,
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${neon}18`, border: `1px solid ${neon}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ color: TEXT, fontSize: 14, fontWeight: 700 }}>{title}</div>
          {subtitle && <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
