'use client';

import { BG, CARD, ORANGE, MUTED, BORDER, TEXT, CEvent, getEventsForDay } from './calendarUtils';

interface Props {
  year: number;
  month: number;
  dbSchedules?: any[];
}

export function MonthCalendar({ year, month, dbSchedules = [] }: Props) {
  const firstDay      = new Date(year, month, 1);
  const dayOfWeek     = firstDay.getDay();
  const prefixDays    = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const gridStart     = new Date(year, month, 1 - prefixDays);

  const weeks = Array.from({ length: 5 }, (_, wIdx) =>
    Array.from({ length: 7 }, (_, dIdx) => {
      const offset  = wIdx * 7 + dIdx;
      const d       = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + offset);
      const active  = d.getMonth() === month;
      const today   = d.toDateString() === new Date().toDateString() ||
                      (d.getFullYear() === 2026 && d.getMonth() === 4 && d.getDate() === 29);
      return { d: d.getDate(), active, today, fullDate: d };
    })
  );

  const getEventsForCell = (cell: { active: boolean; fullDate: Date }): CEvent[] => {
    if (!cell.active) return [];
    const fixed = getEventsForDay(cell.fullDate);
    const db    = dbSchedules
      .filter(item => {
        const t = new Date(item.start_time);
        return t.getFullYear() === cell.fullDate.getFullYear() &&
               t.getMonth()    === cell.fullDate.getMonth()    &&
               t.getDate()     === cell.fullDate.getDate();
      })
      .map(item => ({ title: item.title, type: (item.type === 'fitness' ? 'workout' : 'fixed') as CEvent['type'] }));
    return [...fixed, ...db];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: 20 }}>
      {/* Day headers */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, paddingBottom: 10 }}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(h => (
          <div key={h} style={{ flex: 1, textAlign: 'center', color: MUTED, fontSize: 12, fontWeight: 700 }}>{h}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, borderLeft: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, marginTop: 8 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flex: 1, minHeight: 100 }}>
            {week.map((cell, di) => {
              const evs = getEventsForCell(cell);
              return (
                <div key={di} style={{
                  flex: 1, borderRight: `1px solid ${BORDER}`, borderTop: `1px solid ${BORDER}`,
                  backgroundColor: cell.today ? 'rgba(255,92,0,0.03)' : cell.active ? CARD : 'transparent',
                  opacity: cell.active ? 1 : 0.35,
                  padding: 8, display: 'flex', flexDirection: 'column', gap: 6,
                  cursor: 'pointer', transition: 'background-color 0.2s',
                  border: cell.today ? `1px solid ${ORANGE}` : undefined,
                }}>
                  {/* Date number */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      color: cell.today ? '#fff' : cell.active ? TEXT : MUTED,
                      fontSize: 13, fontWeight: cell.today ? 800 : 500,
                      width: 24, height: 24, borderRadius: '50%',
                      backgroundColor: cell.today ? ORANGE : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {cell.d}
                    </span>
                    {cell.today && <span style={{ color: ORANGE, fontSize: 9, fontWeight: 700 }}>HÔM NAY</span>}
                  </div>

                  {/* Event chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'hidden' }}>
                    {evs.map((ev, ei) => (
                      <div key={ei} style={{
                        fontSize: 9.5, fontWeight: 600, padding: '3px 6px', borderRadius: 4,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        backgroundColor: ev.type === 'fixed' ? 'rgba(229,62,62,0.15)' : 'rgba(255,92,0,0.15)',
                        border:          ev.type === 'fixed' ? '1px solid rgba(229,62,62,0.3)' : '1px solid rgba(255,92,0,0.3)',
                        color:           ev.type === 'fixed' ? '#F87171' : ORANGE,
                      }}>
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
