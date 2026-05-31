'use client';

import { useState } from 'react';
import { DonutRing } from './DonutRing';
import { ORANGE, GREEN, BLUE, GLASS, BORDER, MUTED, TEXT } from './nutritionUtils';

interface Props {
  mealPlans: any[];
}

const getDayName = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = d.getDay();
  return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day];
};

export function MealPlan({ mealPlans = [] }: Props) {
  const [activeDay, setActiveDay] = useState(() => {
    if (!mealPlans || mealPlans.length === 0) return 0;
    const today = new Date().toDateString();
    const todayIndex = mealPlans.findIndex(p => new Date(p.date).toDateString() === today);
    return todayIndex !== -1 ? todayIndex : 0;
  });
  const [isWeekView, setIsWeekView] = useState(false);

  if (!mealPlans || mealPlans.length === 0) {
    return (
      <div style={{ flex: 1, padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: `1px solid ${BORDER}` }}>
        <span style={{ color: MUTED, fontSize: 13, fontWeight: 600 }}>Chưa có thực đơn nào cho tuần này. Nhờ tamquan lên thực đơn ngay cưng ơi! 💅</span>
      </div>
    );
  }

  // Ensure activeDay is within bounds
  const safeActiveIndex = activeDay >= mealPlans.length ? 0 : activeDay;
  const dayPlan = mealPlans[safeActiveIndex];
  const dayName = getDayName(dayPlan.date);
  const mealsList = dayPlan.meals || [];

  return (
    <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', borderRight: `1px solid ${BORDER}` }}>
      {/* ── KPI Donut rings ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
        <div style={{
          background: GLASS, backdropFilter: 'blur(12px)', borderRadius: 14,
          border: '1px solid rgba(255,92,0,0.15)', padding: '18px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <DonutRing size={90} value={1600} max={2000} color={ORANGE} label={`~1600`} sublabel="kcal" />
          <span style={{ color: MUTED, fontSize: 11, fontWeight: 600 }}>Calo hôm nay</span>
        </div>
        <div style={{
          background: GLASS, backdropFilter: 'blur(12px)', borderRadius: 14,
          border: '1px solid rgba(34,197,94,0.15)', padding: '18px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <DonutRing size={90} value={138} max={138} color={GREEN} label={`~138g`} sublabel="/ 138g" />
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

      {/* ── Day tabs (Only in Week View) ── */}
      {isWeekView && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {mealPlans.map((p, i) => {
            const name = getDayName(p.date);
            return (
              <button key={p.id || p.date} onClick={() => setActiveDay(i)} style={{
                flex: 1, padding: '7px 0', borderRadius: 10, cursor: 'pointer',
                background: safeActiveIndex === i ? ORANGE : 'rgba(255,255,255,0.04)',
                border: `1px solid ${safeActiveIndex === i ? ORANGE : BORDER}`,
                color: safeActiveIndex === i ? '#fff' : MUTED,
                fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                boxShadow: safeActiveIndex === i ? `0 0 12px rgba(255,92,0,0.4)` : 'none',
              }}>
                {name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Meal detail ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ color: TEXT, fontSize: 14, fontWeight: 700 }}>
            Thực đơn hôm nay — {dayName}
            <span style={{ color: ORANGE, marginLeft: 10, fontSize: 13 }}>🔥 ~1600 kcal</span>
          </div>
          <button
            onClick={() => setIsWeekView(!isWeekView)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              background: isWeekView ? 'rgba(255,255,255,0.05)' : 'rgba(255,92,0,0.1)',
              color: isWeekView ? MUTED : ORANGE,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {isWeekView ? 'Thu gọn' : 'Xem cả tuần'}
          </button>
        </div>
        
        {/* Breakfast */}
        {dayPlan.meal_breakfast && (
          <div style={{
            padding: '14px 16px', borderRadius: 12, marginBottom: 8,
            background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FF5C0018', border: '1px solid #FF5C0030', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#FF5C00', fontSize: 12, fontWeight: 900 }}>🌅</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Bữa Sáng</div>
              <div style={{ color: TEXT, fontSize: 13, marginTop: 2 }}>{dayPlan.meal_breakfast}</div>
            </div>
          </div>
        )}

        {/* Lunch */}
        {dayPlan.meal_lunch && (
          <div style={{
            padding: '14px 16px', borderRadius: 12, marginBottom: 8,
            background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#22C55E18', border: '1px solid #22C55E30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#22C55E', fontSize: 12, fontWeight: 900 }}>☀️</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Bữa Trưa</div>
              <div style={{ color: TEXT, fontSize: 13, marginTop: 2 }}>{dayPlan.meal_lunch}</div>
            </div>
          </div>
        )}

        {/* Snack */}
        {dayPlan.meal_snack && (
          <div style={{
            padding: '14px 16px', borderRadius: 12, marginBottom: 8,
            background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F59E0B18', border: '1px solid #F59E0B30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 900 }}>🍎</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Bữa Xế (Snack)</div>
              <div style={{ color: TEXT, fontSize: 13, marginTop: 2 }}>{dayPlan.meal_snack}</div>
            </div>
          </div>
        )}

        {/* Dinner */}
        {dayPlan.meal_dinner && (
          <div style={{
            padding: '14px 16px', borderRadius: 12, marginBottom: 8,
            background: GLASS, backdropFilter: 'blur(8px)', border: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#3B82F618', border: '1px solid #3B82F630', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#3B82F6', fontSize: 12, fontWeight: 900 }}>🌙</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>Bữa Tối</div>
              <div style={{ color: TEXT, fontSize: 13, marginTop: 2 }}>{dayPlan.meal_dinner}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Weekly overview mini (Only in Week View) ── */}
      {isWeekView && (
        <>
          <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
            Tổng quan 7 ngày
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {mealPlans.map((p, i) => {
              const name = getDayName(p.date);
              return (
                <div key={p.id || p.date} onClick={() => setActiveDay(i)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  background: safeActiveIndex === i ? 'rgba(255,92,0,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${safeActiveIndex === i ? 'rgba(255,92,0,0.35)' : BORDER}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ color: safeActiveIndex === i ? ORANGE : MUTED, fontSize: 11, fontWeight: 700 }}>{name}</div>
                  <div style={{ color: MUTED, fontSize: 9, marginTop: 2 }}>~1600</div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `80%`, background: safeActiveIndex === i ? ORANGE : 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
