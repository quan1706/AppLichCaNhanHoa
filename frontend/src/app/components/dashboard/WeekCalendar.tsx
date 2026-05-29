'use client';

import {
  BG, CARD, ORANGE, MUTED, BORDER, TEXT,
  START_H, PX_PER_H, HOURS,
  CEvent, getEventsForDay, parseTimeToHours, formatTime,
} from './calendarUtils';

interface WeekDay {
  short: string;
  date: number;
  fullDate: Date;
  today: boolean;
}

interface Props {
  weekDays: WeekDay[];
  dbSchedules: any[];
}

function getCombinedEvents(date: Date, dbSchedules: any[]): CEvent[] {
  const fixed = getEventsForDay(date);

  const dbToday = dbSchedules.filter(item => {
    const t = new Date(item.start_time);
    return t.getFullYear() === date.getFullYear() &&
           t.getMonth()    === date.getMonth()    &&
           t.getDate()     === date.getDate();
  });

  const mapped: CEvent[] = dbToday.map(item => {
    const startD = new Date(item.start_time);
    const endD   = new Date(item.end_time);
    return {
      title: item.title,
      sub:   `${formatTime(startD.getHours(), startD.getMinutes())}–${formatTime(endD.getHours(), endD.getMinutes())}`,
      type:  item.type === 'fitness' ? 'workout' : 'fixed',
      sh:    parseTimeToHours(item.start_time),
      eh:    parseTimeToHours(item.end_time),
      col:   0,
      cols:  1,
    };
  });

  return [...fixed, ...mapped];
}

export function WeekCalendar({ weekDays, dbSchedules }: Props) {
  const calH = HOURS.length * PX_PER_H;

  return (
    <>
      {/* ── Day headers ── */}
      <div style={{ display: 'flex', marginLeft: 52, marginBottom: 0, flexShrink: 0 }}>
        {weekDays.map(d => (
          <div key={d.short} style={{
            flex: 1, textAlign: 'center', paddingBottom: 6,
            borderBottom: `2px solid ${d.today ? ORANGE : BORDER}`,
          }}>
            <div style={{ color: d.today ? ORANGE : MUTED, fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              {d.short}
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', margin: '4px auto 0',
              backgroundColor: d.today ? ORANGE : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: d.today ? '#fff' : TEXT, fontSize: 12.5, fontWeight: d.today ? 700 : 400 }}>
                {d.date}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Time grid ── */}
      <div style={{ position: 'relative', display: 'flex', marginTop: 6 }}>
        {/* Time labels */}
        <div style={{ width: 52, flexShrink: 0 }}>
          {HOURS.map(h => (
            <div key={h} style={{ height: PX_PER_H, display: 'flex', alignItems: 'flex-start', paddingTop: 0 }}>
              <span style={{ color: MUTED, fontSize: 9.5, fontWeight: 500 }}>
                {h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day, di) => {
          const events = getCombinedEvents(day.fullDate, dbSchedules);
          return (
            <div key={day.short} style={{
              flex: 1, position: 'relative', height: calH,
              borderLeft: `1px solid ${BORDER}`,
              backgroundColor: day.today ? 'rgba(255,92,0,0.02)' : 'transparent',
            }}>
              {/* Hour lines */}
              {HOURS.map(h => (
                <div key={h} style={{
                  position: 'absolute', left: 0, right: 0,
                  top: (h - START_H) * PX_PER_H,
                  borderTop: `1px solid ${h === START_H ? 'transparent' : BORDER}`,
                  opacity: 0.5,
                }} />
              ))}

              {/* Events */}
              {events.map((ev, ei) => {
                const top    = (ev.sh - START_H) * PX_PER_H;
                const height = Math.max((ev.eh - ev.sh) * PX_PER_H - 2, 20);
                const col    = ev.col ?? 0;
                const cols   = ev.cols ?? 1;
                const isFixed = ev.type === 'fixed';

                return (
                  <div key={ei} style={{
                    position: 'absolute',
                    top: top + 1, height,
                    left:  `${(col / cols) * 100}%`,
                    width: `${(1 / cols) * 100 - 1}%`,
                    borderRadius: 6,
                    backgroundColor: isFixed ? 'rgba(229,62,62,0.14)' : 'rgba(255,92,0,0.12)',
                    border:          isFixed ? '1px solid rgba(229,62,62,0.4)' : '1px solid rgba(255,92,0,0.45)',
                    padding: '4px 6px', overflow: 'hidden', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = isFixed ? 'rgba(229,62,62,0.22)' : 'rgba(255,92,0,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = isFixed ? 'rgba(229,62,62,0.14)' : 'rgba(255,92,0,0.12)'; }}
                  >
                    <div style={{ color: isFixed ? '#F87171' : '#FFA066', fontSize: 10, fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ev.title}
                    </div>
                    {height > 25 && ev.sub && (
                      <div style={{ color: isFixed ? 'rgba(248,113,113,0.75)' : 'rgba(255,160,102,0.8)', fontSize: 8.5, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.sub}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
