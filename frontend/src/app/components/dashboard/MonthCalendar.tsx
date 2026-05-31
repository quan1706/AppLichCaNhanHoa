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
    const day = cell.fullDate.getDay(); // 0: CN, 1: T2, etc.
    const date = cell.fullDate;
    
    // Lọc các lịch trùng ngày trong tuần từ database (lịch lặp lại hàng tuần hoặc theo ngày cụ thể)
    const dbToday = dbSchedules.filter(item => {
      // Nếu có specific_date, chỉ hiển thị đúng ngày đó
      if (item.specific_date) {
        const sDate = new Date(item.specific_date);
        return sDate.getFullYear() === date.getFullYear() && 
               sDate.getMonth() === date.getMonth() && 
               sDate.getDate() === date.getDate();
      }

      // Nếu không có specific_date, kiểm tra lặp theo mảng days
      if (Array.isArray(item.days)) {
        const isDayMatch = item.days.includes(day);
        if (!isDayMatch) return false;

        // Logic lọc nâng cao cho lịch học FPTU học kì Summer 2026
        if (item.type === 'class' || item.title.includes('học') || item.title.includes('FPTU')) {
          // 1. Chỉ áp dụng đến hết tháng 7/2026 (sau 31/07/2026 sẽ tự động ẩn)
          const limitDate = new Date(2026, 6, 31, 23, 59, 59); // Lưu ý: Tháng 7 trong JS là index 6
          if (date > limitDate) return false;
        }

        // 2. Nghỉ ngơi cả tuần từ 6/7/2026 đến 12/7/2026 (không render bất kỳ lịch lặp lại nào)
        const startBreak = new Date(2026, 6, 6, 0, 0, 0); // 6 tháng 7
        const endBreak = new Date(2026, 6, 12, 23, 59, 59); // 12 tháng 7
        if (date >= startBreak && date <= endBreak) return false;

        return true;
      }
      return false;
    });

    const mapped = dbToday.map(item => ({
      title: item.title,
      type: (item.type === 'workout' ? 'workout' : 'fixed') as CEvent['type'],
      sh: 0,
      eh: 0
    }));

    return mapped;
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
