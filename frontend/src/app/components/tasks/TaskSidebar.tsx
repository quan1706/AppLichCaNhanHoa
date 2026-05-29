'use client';

import { ChevronDown } from 'lucide-react';
import { GLASS2, BORDER, MUTED, TEXT, BLUE, RED, ORANGE } from './tasksUtils';

const FILTERS = [
  { id: 'academic', label: 'Học tập',   color: BLUE },
  { id: 'work',     label: 'Công việc', color: RED },
  { id: 'fitness',  label: 'Thể hình',  color: ORANGE },
];

interface Props {
  filters: Record<string, boolean>;
  onToggleFilter: (id: string) => void;
}

export function TaskSidebar({ filters, onToggleFilter }: Props) {
  return (
    <div style={{
      width: 280, minWidth: 280,
      background: GLASS2, backdropFilter: 'blur(16px)',
      borderLeft: `1px solid ${BORDER}`,
      padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {/* ── Category Filter ── */}
      <div>
        <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
          Danh mục
        </div>
        {FILTERS.map(f => (
          <div key={f.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: `1px solid ${BORDER}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: f.color, boxShadow: `0 0 6px ${f.color}` }} />
              <span style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{f.label}</span>
            </div>
            {/* Toggle switch */}
            <div
              onClick={() => onToggleFilter(f.id)}
              style={{
                width: 42, height: 22, borderRadius: 11, cursor: 'pointer',
                backgroundColor: filters[f.id] ? f.color : 'rgba(255,255,255,0.08)',
                position: 'relative', transition: 'background-color 0.25s',
                boxShadow: filters[f.id] ? `0 0 10px ${f.color}60` : 'none',
              }}
            >
              <div style={{
                position: 'absolute', top: 2,
                left: filters[f.id] ? 21 : 2,
                width: 18, height: 18, borderRadius: '50%',
                backgroundColor: '#fff', transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Priority ── */}
      <div>
        <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Độ ưu tiên</div>
        {['Tất cả', 'Chỉ Khẩn Cấp', 'Hạn Tuần Này', 'Đang thực hiện'].map((p, idx) => (
          <div key={p} style={{
            padding: '10px 14px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
            background: idx === 1 ? `rgba(255,92,0,0.1)` : 'rgba(255,255,255,0.02)',
            border: `1px solid ${idx === 1 ? 'rgba(255,92,0,0.3)' : BORDER}`,
            color: idx === 1 ? ORANGE : MUTED, fontSize: 12, fontWeight: 600,
            transition: 'all 0.2s',
          }}>
            {p}
          </div>
        ))}
      </div>

      {/* ── Sort ── */}
      <div>
        <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Sắp xếp</div>
        <div style={{
          padding: '10px 14px', borderRadius: 8,
          background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        }}>
          <span style={{ color: TEXT, fontSize: 12 }}>Theo hạn chót (Gần nhất)</span>
          <ChevronDown size={13} color={MUTED} />
        </div>
      </div>

      {/* ── Mini bar chart ── */}
      <div style={{
        padding: '16px', borderRadius: 14,
        background: 'rgba(96,165,250,0.05)',
        border: `1px solid rgba(96,165,250,0.12)`,
      }}>
        <div style={{ color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
          Hoàn thành/tuần
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 54 }}>
          {[40, 60, 20, 80, 55, 90, 30].map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%', height: h * 0.54, borderRadius: 3,
                background: i === 5 ? `linear-gradient(180deg, ${BLUE}, rgba(96,165,250,0.3))` : 'rgba(255,255,255,0.08)',
                boxShadow: i === 5 ? `0 0 8px rgba(96,165,250,0.5)` : 'none',
                transition: 'height 0.4s ease',
              }} />
              <span style={{ color: MUTED, fontSize: 9 }}>{['T2','T3','T4','T5','T6','T7','CN'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
