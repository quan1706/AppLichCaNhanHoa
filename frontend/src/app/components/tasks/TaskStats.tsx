'use client';

import { Task, TEXT, MUTED, BLUE, ORANGE, GREEN, BORDER } from './tasksUtils';

export function TaskStats({ tasks = [] }: { tasks?: Task[] }) {
  const totalCount = tasks.length;
  const urgentCount = tasks.filter(t => t.status !== 'done' && t.daysLeft <= 1).length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const stats = [
    { label: 'Tổng', count: totalCount, sub: 'công việc', color: TEXT },
    { label: 'Khẩn cấp', count: urgentCount, sub: 'cần làm ngay', color: ORANGE },
    { label: 'Đã xong', count: doneCount, sub: 'hoàn thành', color: GREEN },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: 'rgba(18,18,18,0.6)', backdropFilter: 'blur(12px)',
          border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          <div style={{ color: s.color, fontSize: 32, fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>
            {s.count}
          </div>
          <div style={{ color: TEXT, fontSize: 13, fontWeight: 700 }}>{s.label}</div>
          <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
