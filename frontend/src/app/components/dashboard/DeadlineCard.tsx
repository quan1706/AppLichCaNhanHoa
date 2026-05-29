'use client';

import { AlertCircle, Clock } from 'lucide-react';
import { CARD2, ORANGE, MUTED, BORDER, TEXT, BG, DbDeadline } from './calendarUtils';

interface Props {
  items: DbDeadline[];
}

export function DeadlineCard({ items }: Props) {
  // Process DB data, enrich with days remaining
  const processed = items.map(item => {
    const due      = new Date(item.due_date);
    const diffDays = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
    const codeMatch = item.title.match(/^([A-Za-z0-9]+)/);
    return {
      code:   codeMatch ? codeMatch[1] : 'DL',
      name:   item.title.replace(/^([A-Za-z0-9]+)\s*[:-]\s*/, ''),
      days:   diffDays,
      urgent: diffDays <= 3,
      status: item.status,
    };
  }).filter(i => i.status !== 'done').slice(0, 3);

  // Fallback mock data when DB is empty
  const displayItems = processed.length > 0 ? processed : [
    { code: 'SE17B01', name: 'Bài tập Kỹ thuật phần mềm', days: 2,  urgent: true  },
    { code: 'SE17B03', name: 'Báo cáo Lab – Kiểm thử',    days: 5,  urgent: false },
    { code: 'PRM392',  name: 'Phát triển Di động – Demo', days: 9,  urgent: false },
  ];

  return (
    <div style={{ backgroundColor: CARD2, borderRadius: 16, padding: '14px 16px', border: `1px solid ${BORDER}`, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={15} color={ORANGE} />
          <span style={{ color: TEXT, fontSize: 13, fontWeight: 700 }}>Deadline khẩn cấp</span>
        </div>
        <span style={{ color: ORANGE, fontSize: 9, fontWeight: 700, padding: '2px 6px', backgroundColor: 'rgba(255,92,0,0.12)', borderRadius: 20 }}>
          {displayItems.length} môn
        </span>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {displayItems.map((item, idx) => (
          <div key={idx} style={{
            padding: '8px 10px', borderRadius: 10,
            backgroundColor: item.urgent ? 'rgba(255,92,0,0.04)' : BG,
            border: `1px solid ${item.urgent ? 'rgba(255,92,0,0.2)' : BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ color: item.urgent ? ORANGE : TEXT, fontSize: 11.5, fontWeight: 700 }}>{item.code}</div>
              <div style={{ color: MUTED, fontSize: 10.5, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                {item.name}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              <Clock size={11} color={item.urgent ? ORANGE : MUTED} />
              <span style={{ color: item.urgent ? ORANGE : MUTED, fontSize: 10.5, fontWeight: 700 }}>
                {item.days < 0 ? 'Quá hạn' : `Còn ${item.days} ngày`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
