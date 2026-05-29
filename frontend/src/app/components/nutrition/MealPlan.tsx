'use client';

import { useState } from 'react';
import { DonutRing } from './DonutRing';
import { DAYS_MEALS, ORANGE, GREEN, BLUE, GLASS, BORDER, MUTED, TEXT } from './nutritionUtils';

export function MealPlan() {
  const [activeDay, setActiveDay] = useState(0);
  const day = DAYS_MEALS[activeDay];

  return (
    <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', borderRight: `1px solid ${BORDER}` }}>
      {/* ── KPI Donut rings ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
        <div style={{
          background: GLASS, backdropFilter: 'blur(12px)', borderRadius: 14,
          border: '1px solid rgba(255,92,0,0.15)', padding: '18px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <DonutRing size={90} value={day.kcal} max={2000} color={ORANGE} label={`${day.kcal}`} sublabel="kcal" />
          <span style={{ color: MUTED, fontSize: 11, fontWeight: 600 }}>Calo hôm nay</span>
        </div>
        <div style={{
          background: GLASS, backdropFilter: 'blur(12px)', borderRadius: 14,
          border: '1px solid rgba(34,197,94,0.15)', padding: '18px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <DonutRing size={90} value={day.protein} max={138} color={GREEN} label={`${day.protein}g`} sublabel="/ 138g" />
          <span style={{ color: MUTED, fontSize: 11, fontWeight: 600 }}>Protein hôm nay</span>
        </div>
        <div style={{
          background: GLASS, backdropFilter: 'blur(12px)', borderRadius: 14,
          border: '1px solid rgba(96,165,250,0.15)', padding: '18px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <DonutRing size={90} value={2800} max={3500} color={BLUE} label="2800ml" sublabel="/ 3500ml" />
          <span style={{ color: MUTED, fontSize: 11, fontWeight: 600 }}>Nước hôm nay</span>
        </div>
      </div>

      {/* ── Day tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {DAYS_MEALS.map((d, i) => (
          <button key={d.day} onClick={() => setActiveDay(i)} style={{
            flex: 1, padding: '7px 0', borderRadius: 10, cursor: 'pointer',
            background: activeDay === i ? ORANGE : 'rgba(255,255,255,0.04)',
            border: `1px solid ${activeDay === i ? ORANGE : BORDER}`,
            color: activeDay === i ? '#fff' : MUTED,
            fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
            boxShadow: activeDay === i ? `0 0 12px rgba(255,92,0,0.4)` : 'none',
          }}>
            {d.day}
          </button>
        ))}
      </div>

      {/* ── Meal detail ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: TEXT, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
          Chi tiết — {day.day}
          <span style={{ color: ORANGE, marginLeft: 10, fontSize: 13 }}>🔥 {day.kcal} kcal</span>
        </div>
        {day.meals.map(m => (
          <div key={m.type} style={{
            padding: '14px 16px', borderRadius: 12, marginBottom: 8,
            background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${m.color}18`, border: `1px solid ${m.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: m.color, fontSize: 12, fontWeight: 900 }}>
                {m.type === 'S' ? '🌅' : m.type === 'T' ? '☀️' : '🌙'}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {m.type === 'S' ? 'Bữa Sáng' : m.type === 'T' ? 'Bữa Trưa' : 'Bữa Tối'}
              </div>
              <div style={{ color: TEXT, fontSize: 13, marginTop: 2 }}>{m.desc}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800 }}>{m.kcal} kcal</div>
              <div style={{ color: GREEN, fontSize: 11, marginTop: 2 }}>🥩 {m.protein}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Weekly overview mini ── */}
      <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
        Tổng quan 7 ngày
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {DAYS_MEALS.map((d, i) => (
          <div key={d.day} onClick={() => setActiveDay(i)} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
            background: activeDay === i ? 'rgba(255,92,0,0.08)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${activeDay === i ? 'rgba(255,92,0,0.35)' : BORDER}`,
            transition: 'all 0.2s',
          }}>
            <div style={{ color: activeDay === i ? ORANGE : MUTED, fontSize: 11, fontWeight: 700 }}>{d.day}</div>
            <div style={{ color: MUTED, fontSize: 9, marginTop: 2 }}>{d.kcal}</div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(d.kcal/2000)*100}%`, background: activeDay === i ? ORANGE : 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
