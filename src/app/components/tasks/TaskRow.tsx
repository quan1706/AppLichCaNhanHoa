'use client';

import { Check, Star } from 'lucide-react';
import { Task, ORANGE, MUTED, BLUE, GREEN, BORDER, TEXT } from './tasksUtils';

interface Props {
  task: Task;
  idx: number;
  isDone: boolean;
  isStarred: boolean;
  onToggle: (id: string) => void;
  onToggleStar: (id: string) => void;
}

export function TaskRow({ task, idx, isDone, isStarred, onToggle, onToggleStar }: Props) {
  // Khẩn cấp nếu chưa xong và thời gian còn <= 1 ngày
  const isUrgent = !isDone && task.daysLeft <= 1;
  
  return (
    <div className="tasks-table-min-width task-row" style={{
      display: 'grid', gridTemplateColumns: '32px 1fr 130px 110px 120px 60px',
      gap: 12, padding: '16px', marginBottom: 8,
      background: 'rgba(18,18,18,0.4)', borderRadius: 12,
      border: `1px solid ${isUrgent ? 'rgba(255,92,0,0.3)' : BORDER}`,
      alignItems: 'center', transition: 'all 0.2s',
      opacity: isDone ? 0.6 : 1,
      boxShadow: isUrgent ? '0 0 16px rgba(255,92,0,0.1)' : 'none',
      position: 'relative',
    }}>
      {/* 1. Checkbox */}
      <div 
        onClick={() => onToggle(task.id)}
        style={{
          width: 18, height: 18, borderRadius: 4, cursor: 'pointer',
          border: `1.5px solid ${isDone ? GREEN : isUrgent ? ORANGE : MUTED}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isDone ? 'rgba(34,197,94,0.1)' : 'transparent',
        }}
      >
        {isDone && <Check size={12} color={GREEN} strokeWidth={4} />}
      </div>
      
      {/* 2. Công việc */}
      <div>
        <div style={{ color: isDone ? MUTED : TEXT, fontSize: 13, fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none' }}>
          {task.name}
        </div>
        <div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>{task.code} {task.link && `· Cầm link`}</div>
      </div>
      
      {/* 3. Môn học */}
      <div style={{ color: MUTED, fontSize: 12, fontWeight: 500 }}>{task.course}</div>
      
      {/* 4. Hạn chót */}
      <div>
        <div style={{ color: isDone ? MUTED : TEXT, fontSize: 12, fontWeight: 700 }}>{task.due}</div>
        <div style={{ color: isUrgent ? ORANGE : MUTED, fontSize: 10, marginTop: 2 }}>Còn {task.daysLeft} ngày</div>
      </div>
      
      {/* 5. Trạng thái */}
      <div>
        <span style={{
          padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
          background: isDone ? 'rgba(34,197,94,0.1)' : isUrgent ? 'rgba(255,92,0,0.1)' : 'rgba(255,255,255,0.05)',
          color: isDone ? GREEN : isUrgent ? ORANGE : MUTED,
          border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : isUrgent ? 'rgba(255,92,0,0.2)' : BORDER}`,
        }}>
          {isDone ? 'ĐÃ XONG' : isUrgent ? 'KHẨN CẤP 🔥' : 'CHƯA LÀM'}
        </span>
      </div>

      {/* 6. Ưu tiên (Star) */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
         <button 
            onClick={() => onToggleStar(task.id)}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: isStarred ? 'rgba(234,179,8,0.1)' : 'transparent',
              transition: 'background-color 0.2s',
            }}
          >
            <Star size={18} fill={isStarred ? "#EAB308" : "transparent"} color={isStarred ? "#EAB308" : MUTED} />
          </button>
      </div>
    </div>
  );
}
