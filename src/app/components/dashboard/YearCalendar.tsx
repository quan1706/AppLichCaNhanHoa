'use client';

import { CARD, ORANGE, MUTED, BORDER, TEXT, GREEN } from './calendarUtils';

export function YearCalendar({ year }: { year: number }) {
  const months = [
    { name: 'Tháng 1',  days: 31, completed: 20 },
    { name: 'Tháng 2',  days: new Date(year, 2, 0).getDate(), completed: 18 },
    { name: 'Tháng 3',  days: 31, completed: 25 },
    { name: 'Tháng 4',  days: 30, completed: 22 },
    { name: 'Tháng 5',  days: 31, completed: 27, current: year === 2026 },
    { name: 'Tháng 6',  days: 30, completed: 0,  future: year >= 2026 },
    { name: 'Tháng 7',  days: 31, completed: 0,  future: year >= 2026 },
    { name: 'Tháng 8',  days: 31, completed: 0,  future: year >= 2026 },
    { name: 'Tháng 9',  days: 30, completed: 0,  future: year >= 2026 },
    { name: 'Tháng 10', days: 31, completed: 0,  future: year >= 2026 },
    { name: 'Tháng 11', days: 30, completed: 0,  future: year >= 2026 },
    { name: 'Tháng 12', days: 31, completed: 0,  future: year >= 2026 },
  ];

  const getDotColor = (mIdx: number, dIdx: number): string => {
    if (year > 2026 || (year === 2026 && mIdx > 4)) return '#2A2A2A';
    const seed = (mIdx * 31 + dIdx) % 7;
    if (seed === 0) return ORANGE;
    if (seed === 1 || seed === 3) return 'rgba(229,62,62,0.5)';
    if (seed === 2 || seed === 5) return 'rgba(255,92,0,0.4)';
    return '#2A2A2A';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: 20, gap: 14 }}>
      {/* Legend */}
      <div style={{
        display: 'flex', gap: 16, padding: '10px 14px',
        backgroundColor: CARD, borderRadius: 10, border: `1px solid ${BORDER}`,
        fontSize: 11.5, color: TEXT, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontWeight: 700, color: ORANGE, marginRight: 4 }}>BẢN ĐỒ KỶ LUẬT {year}:</span>
        {[
          { color: ORANGE,                    label: 'Kỷ luật vàng' },
          { color: 'rgba(255,92,0,0.4)',      label: 'Uống đủ nước' },
          { color: 'rgba(229,62,62,0.5)',     label: 'Lịch cố định' },
          { color: '#2A2A2A',                 label: 'Ngày nghỉ'    },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color }} />
            <span style={{ color: MUTED }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 12, flex: 1 }}>
        {months.map((m, mIdx) => (
          <div key={m.name} style={{
            backgroundColor: (m as any).current ? 'rgba(255,92,0,0.02)' : CARD,
            borderRadius: 12, padding: 12,
            border: `1px solid ${(m as any).current ? ORANGE : BORDER}`,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {/* Month header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: (m as any).current ? ORANGE : TEXT, fontSize: 13, fontWeight: 700 }}>{m.name}</span>
              {!(m as any).future && (
                <span style={{ color: MUTED, fontSize: 9.5, fontWeight: 600 }}>
                  Đạt: <strong style={{ color: ORANGE }}>{m.completed}d</strong>
                </span>
              )}
            </div>

            {/* Day dots */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, justifyContent: 'center' }}>
              {Array.from({ length: m.days }).map((_, dIdx) => (
                <div key={dIdx} title={`Ngày ${dIdx + 1}/${mIdx + 1}`} style={{
                  width: 11, height: 11, borderRadius: '50%',
                  backgroundColor: getDotColor(mIdx, dIdx + 1),
                  margin: 'auto',
                }} />
              ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', paddingTop: 6, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: MUTED, fontSize: 9.5 }}>{m.days} ngày</span>
              {(m as any).current ? (
                <span style={{ color: ORANGE, fontSize: 8, fontWeight: 800, padding: '2px 4px', backgroundColor: 'rgba(255,92,0,0.1)', borderRadius: 4 }}>HIỆN TẠI</span>
              ) : (m as any).future ? (
                <span style={{ color: MUTED, fontSize: 8 }}>CHƯA ĐẦY ĐỦ</span>
              ) : (
                <span style={{ color: GREEN, fontSize: 8, fontWeight: 700 }}>XONG</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
