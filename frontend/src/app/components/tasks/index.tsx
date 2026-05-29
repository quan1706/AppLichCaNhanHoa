'use client';

import { useState } from 'react';
import { Filter, Plus, X, Link as LinkIcon, FileText, UploadCloud, Users } from 'lucide-react';
import { BG, BLUE, TEXT, MUTED, Task, ORANGE, BORDER } from './tasksUtils';
import { TaskStats } from './TaskStats';
import { TaskRow } from './TaskRow';
import { TaskSidebar } from './TaskSidebar';

const MOCK_TASKS: Task[] = [
  { id: 't1', code: 'SE17B01', name: 'Kỹ thuật phần mềm – Bài tập 3',       course: 'SE17B01', due: '01/06/2026', daysLeft: 1,  status: 'pending', link: 'https://docs.google.com/...' },
  { id: 't2', code: 'SE17B03', name: 'Báo cáo Lab – Kiểm thử hệ thống',     course: 'SE17B01', due: '04/06/2026', daysLeft: 4,  status: 'pending' },
  { id: 't3', code: 'PRM392',  name: 'Dự án di động – Demo Sprint 2',        course: 'PRM392',  due: '08/06/2026', daysLeft: 8,  status: 'pending', starred: true },
  { id: 't4', code: 'MAD101',  name: 'Toán học cho CNTT – Bài kiểm tra 3',  course: 'MAD101',  due: '12/06/2026', daysLeft: 12, status: 'pending' },
  { id: 't5', code: 'PRJ301',  name: 'Demo dự án nhóm – Bảo vệ cuối kỳ',   course: 'PRJ301',  due: '15/06/2026', daysLeft: 15, status: 'pending' },
  { id: 't6', code: 'SSB301',  name: 'Kỹ năng doanh nghiệp – Case Study',   course: 'SSB301',  due: '18/06/2026', daysLeft: 18, status: 'done' },
  { id: 't7', code: 'NLP302',  name: 'Xử lý ngôn ngữ – Bản nháp nghiên cứu', course: 'NLP302', due: '22/06/2026', daysLeft: 22, status: 'done' },
];

export function Screen2Tasks({ onChangeTab }: { onChangeTab?: (tab: any) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({ t6: true, t7: true });
  const [starred, setStarred] = useState<Record<string, boolean>>({ t3: true });
  const [filters, setFilters] = useState<Record<string, boolean>>({ academic: true, work: true, fitness: true });
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleTask = (id: string) => setChecked(p => ({ ...p, [id]: !p[id] }));
  const toggleStar = (id: string) => setStarred(p => ({ ...p, [id]: !p[id] }));
  const toggleFilter = (id: string) => setFilters(p => ({ ...p, [id]: !p[id] }));

  const sortedTasks = [...MOCK_TASKS].sort((a, b) => {
    const aDone = a.status === 'done' || checked[a.id];
    const bDone = b.status === 'done' || checked[b.id];

    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;

    const aStar = starred[a.id];
    const bStar = starred[b.id];

    if (aStar && !bStar) return -1;
    if (!aStar && bStar) return 1;

    return a.daysLeft - b.daysLeft;
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: BG, overflow: 'hidden', fontFamily: 'Inter,sans-serif', position: 'relative' }}>
      
      {/* ── Header ── */}
      <div style={{
        padding: '20px 28px', flexShrink: 0, background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: BLUE, boxShadow: `0 0 10px rgba(96,165,250,0.8)` }} />
            <span style={{ color: TEXT, fontSize: 20, fontWeight: 800 }}>Quản lý Deadline & Công việc</span>
          </div>
          <div style={{ color: MUTED, fontSize: 12, marginTop: 4, paddingLeft: 14 }}>Sắp xếp theo: Ưu tiên & Khẩn cấp ⚡</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10,
            background: `rgba(96,165,250,0.1)`, border: `1px solid rgba(96,165,250,0.25)`,
            color: BLUE, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <Filter size={13} /> Bộ lọc
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10,
              background: `linear-gradient(135deg, ${BLUE}, #3B82F6)`, border: 'none',
              color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 0 16px rgba(96,165,250,0.4)', transition: 'all 0.2s',
            }}
          >
            <Plus size={14} /> Thêm Deadline
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Task List */}
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          <TaskStats />

          {/* Table headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 130px 110px 120px 60px',
            gap: 12, padding: '6px 16px', marginBottom: 6,
            color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
          }}>
            <div /> <div>Công việc</div> <div>Môn học</div> <div>Hạn chót</div> <div>Trạng thái</div> <div style={{ textAlign: 'center' }}>Ưu tiên</div>
          </div>

          {/* Table rows */}
          {sortedTasks.map((task, idx) => (
            <TaskRow
              key={task.id}
              task={task}
              idx={idx}
              isDone={task.status === 'done' || !!checked[task.id]}
              isStarred={!!starred[task.id]}
              onToggle={toggleTask}
              onToggleStar={toggleStar}
            />
          ))}
        </div>

        {/* Sidebar */}
        <TaskSidebar filters={filters} onToggleFilter={toggleFilter} />
      </div>

      {/* ── Add Modal Overlay ── */}
      {showAddModal && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            width: 520, background: 'rgba(18,18,18,0.95)', border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ color: TEXT, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, boxShadow: '0 0 8px rgba(96,165,250,0.8)' }} />
                Thêm Deadline Mới
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: MUTED }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Basic Info */}
              <div>
                <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Tên công việc / Task</label>
                <input placeholder="VD: Báo cáo Lab 4..." style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, outline: 'none' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Môn học / Phân loại</label>
                  <input placeholder="VD: PRJ301" style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Hạn chót (Deadline)</label>
                  <input type="datetime-local" style={{ width: '100%', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, outline: 'none', colorScheme: 'dark' }} />
                </div>
              </div>

              {/* Extra Details */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
                  <LinkIcon size={12} /> Link tài liệu / Bài tập
                </label>
                <input placeholder="https://docs.google.com/..." style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
                  <FileText size={12} /> Ghi chú thêm (Không bắt buộc)
                </label>
                <textarea rows={2} placeholder="Cần nộp bản cứng cho thầy vào sáng thứ 2..." style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, outline: 'none', resize: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Priority */}
                <div>
                  <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Ưu tiên quan trọng</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Bình thường', 'Gắn sao 🌟'].map((lvl, i) => (
                      <button key={lvl} style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${i === 1 ? 'rgba(234,179,8,0.3)' : BORDER}`,
                        background: i === 1 ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.03)',
                        color: i === 1 ? '#EAB308' : MUTED, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>{lvl}</button>
                    ))}
                  </div>
                </div>

                {/* Submission Type */}
                <div>
                  <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Hình thức nộp</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)', color: TEXT, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <UploadCloud size={13} /> CMS
                    </button>
                    <button style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent', color: MUTED, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Users size={13} /> Tại lớp
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowAddModal(false)}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 8, marginTop: 10,
                  background: BLUE, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(96,165,250,0.4)',
                }}
              >
                Tạo Deadline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
