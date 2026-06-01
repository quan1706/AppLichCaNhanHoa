'use client';

import { Check, Star, Trash2, Edit2 } from 'lucide-react';
import { Task, ORANGE, MUTED, BLUE, GREEN, BORDER, TEXT } from './tasksUtils';
import { useState, useEffect } from 'react';

interface Props {
  task: Task;
  idx: number;
  isDone: boolean;
  isStarred: boolean;
  onToggle: (id: string) => void;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
}

function TaskNotePopup({ note, onClose }: { note: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 520,
          maxWidth: '92vw',
          background: 'rgba(18,18,18,0.95)',
          border: `1px solid ${BORDER}`,
          borderRadius: 14,
          padding: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ color: TEXT, fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Ghi chú công việc</div>
        <div style={{ color: MUTED, fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: '60vh', overflowY: 'auto' }}>
          {note}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${BORDER}`,
              color: TEXT,
              padding: '8px 16px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export function TaskRow({ task, idx, isDone, isStarred, onToggle, onToggleStar, onDelete, onEdit }: Props) {
  const [showNotePopup, setShowNotePopup] = useState(false);
  
  // Khẩn cấp nếu chưa xong và thời gian còn <= 1 ngày
  const isUrgent = !isDone && task.daysLeft <= 1;
  
  return (
    <div className="tasks-table-min-width task-row" style={{
      display: 'grid', gridTemplateColumns: '32px 1fr 180px 130px 110px 120px 80px',
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
      
      {/* 3. Note */}
      <div style={{ minWidth: 0 }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (task.notes) setShowNotePopup(true);
          }}
          style={{
            width: '100%',
            maxWidth: 180,
            padding: '0px 0',
            background: 'transparent',
            border: 'none',
            color: MUTED,
            fontSize: 11.5,
            fontWeight: 600,
            cursor: task.notes ? 'pointer' : 'default',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={task.notes || ''}
        >
          {task.notes ? task.notes : '—'}
        </button>
      </div>
      
      {/* 4. Môn học */}
      <div style={{ color: MUTED, fontSize: 12, fontWeight: 500 }}>{task.course}</div>
      
      {/* 5. Hạn chót */}
      <div>
        <div style={{ color: isDone ? MUTED : TEXT, fontSize: 12, fontWeight: 700 }}>{task.due}</div>
        <div style={{ color: isUrgent ? ORANGE : MUTED, fontSize: 10, marginTop: 2 }}>
          {task.daysLeft < 0 ? `Quá hạn ${Math.abs(task.daysLeft)} ngày` : task.daysLeft === 0 ? 'Hôm nay' : `Còn ${task.daysLeft} ngày`}
        </div>
      </div>
      
      {/* 5. Trạng thái */}
      <div>
        <span style={{
          padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
          background: isDone ? 'rgba(34,197,94,0.1)' : isUrgent ? 'rgba(255,92,0,0.1)' : 'rgba(255,255,255,0.05)',
          color: isDone ? GREEN : isUrgent ? ORANGE : MUTED,
          border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : isUrgent ? 'rgba(255,92,0,0.2)' : BORDER}`,
        }}>
          {isDone ? 'ĐÃ XONG' : (!isDone && task.daysLeft < 0) ? 'QUÁ HẠN 🚨' : isUrgent ? 'KHẨN CẤP 🔥' : 'CHƯA LÀM'}
        </span>
      </div>

      {/* Popup note */}
      {showNotePopup && task.notes && (
        <TaskNotePopup note={task.notes} onClose={() => setShowNotePopup(false)} />
      )}

      {/* 6. Hành động */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>

          <button 
            onClick={() => onEdit?.(task)}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(96,165,250,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Edit2 size={16} color={MUTED} />
          </button>
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
            <Star size={16} fill={isStarred ? "#EAB308" : "transparent"} color={isStarred ? "#EAB308" : MUTED} />
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Trash2 size={16} color="#EF4444" />
          </button>
      </div>
    </div>
  );
}
