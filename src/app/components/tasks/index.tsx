'use client';

import { useState, useEffect } from 'react';
import { Filter, Plus, X, Link as LinkIcon, FileText, UploadCloud, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, QUAN_UUID } from '../../lib/supabaseClient';
import { BG, BLUE, TEXT, MUTED, Task, ORANGE, BORDER } from './tasksUtils';
import { TaskStats } from './TaskStats';
import { TaskRow } from './TaskRow';
import { TaskSidebar } from './TaskSidebar';

// Helper to parse Supabase tasks data to UI Task structure
function mapDbDeadlineToTask(db: any): Task {
  const title = db.title || '';
  const category = db.category || 'Chung';
  const code = category.toUpperCase().trim();
  const name = title;

  // Calculate days left
  const dueTime = new Date(db.deadline).getTime();
  const nowTime = new Date().getTime();
  const diffDays = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));

  // Format due date to localized Vietnamese format
  const dateObj = new Date(db.deadline);
  const dueFormatted = dateObj.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    id: db.id,
    code,
    name,
    course: code,
    due: dueFormatted,
    daysLeft: isNaN(diffDays) ? 0 : diffDays,
    status: db.is_done ? 'done' : 'pending',
    starred: !!db.is_starred,
    notes: '',
  };
}

export function Screen2Tasks({ onChangeTab }: { onChangeTab?: (tab: any) => void }) {
  // App Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, boolean>>({ academic: true, work: true, fitness: true });
  
  // Add Task Modal Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newIsStarred, setNewIsStarred] = useState(false);
  const [newSubmissionType, setNewSubmissionType] = useState<'CMS' | 'class'>('CMS');
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);

  const toggleFilter = (id: string) => setFilters(p => ({ ...p, [id]: !p[id] }));

  // 1. Fetch Tasks
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data: dbTasks, error: taskErr } = await supabase
        .from('tasks')
        .select('*')
        .eq('profile_id', QUAN_UUID)
        .order('deadline', { ascending: true });

      if (taskErr) throw taskErr;

      let allTasks: Task[] = [];
      if (dbTasks) {
        allTasks = dbTasks.map(mapDbDeadlineToTask);
      }
      
      setTasks(allTasks);

    } catch (err) {
      console.error('Lỗi nạp dữ liệu:', err);
      toast.error('Không thể tải danh sách công việc! 💅');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Toggle Task Complete Status
  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    const isDone = newStatus === 'done';

    // Optimistic UI Update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_done: isDone })
        .eq('id', id);

      if (error) throw error;
      toast.success(isDone ? 'Chúc mừng! Đã hoàn thành công việc! 🎉' : 'Đã đưa công việc về trạng thái chưa làm.');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi đồng bộ dữ liệu!');
      // Rollback on failure
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: task.status } : t));
    }
  };

  // 3. Toggle Star/Priority Status
  const toggleStar = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStarred = !task.starred;

    // Optimistic UI Update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, starred: newStarred } : t));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_starred: newStarred })
        .eq('id', id);

      if (error) throw error;
      toast.success(newStarred ? 'Đã thêm sao ưu tiên cho công việc! 🌟' : 'Đã bỏ sao ưu tiên.');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi đồng bộ mức độ ưu tiên!');
      // Rollback on failure
      setTasks(prev => prev.map(t => t.id === id ? { ...t, starred: task.starred } : t));
    }
  };

  // 3.5 Delete Task
  const deleteTask = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa deadline này?')) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      toast.success('Đã xóa deadline thành công!');
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa!');
    }
  };

  // 4. Create Task
  const handleAddTask = async () => {
    if (!newTitle.trim()) {
      toast.error('Vui lòng nhập tên công việc!');
      return;
    }
    if (!newDueDate) {
      toast.error('Vui lòng chọn thời gian hạn chót!');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('tasks').insert({
        profile_id: QUAN_UUID,
        title: newTitle.trim(),
        category: newCategory.trim() || 'Chung',
        deadline: new Date(newDueDate).toISOString(),
        is_done: false,
        is_starred: newIsStarred,
      });

      if (error) throw error;
      toast.success('Đã lên lịch deadline mới thành công! 🚀');
      setShowAddModal(false);
      
      // Reset form controls
      setNewTitle('');
      setNewCategory('');
      setNewDueDate('');
      setNewLink('');
      setNewNotes('');
      setNewIsStarred(false);

      // Reload
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối cơ sở dữ liệu khi tạo Task!');
    } finally {
      setIsSaving(false);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const aDone = a.status === 'done';
    const bDone = b.status === 'done';

    if (aDone && !bDone) return 1;
    if (!aDone && bDone) return -1;

    const aStar = a.starred;
    const bStar = b.starred;

    if (aStar && !bStar) return -1;
    if (!aStar && bStar) return 1;

    return a.daysLeft - b.daysLeft;
  });

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: BG, overflow: 'hidden', fontFamily: 'Inter,sans-serif', position: 'relative' }}>
      
      {/* Dynamic spinner & Responsive CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(96, 165, 250, 0.1);
          border-radius: 50%;
          border-top-color: #60A5FA;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive Mobile Layout cho Tasks */
        @media (max-width: 768px) {
          .tasks-body-container {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .task-sidebar {
            display: none !important;
            width: 100% !important;
            min-width: 100% !important;
            border-left: none !important;
            border-top: 1px solid rgba(96,165,250,0.12) !important;
            padding-bottom: 80px !important; /* Tránh đè lên Bottom Nav */
          }
          .task-sidebar.show-mobile {
            display: flex !important;
          }
          .tasks-list-container {
            overflow-x: auto !important;
            padding: 16px !important;
            flex: none !important; /* Prevent shrinking to 0 height */
          }
          .tasks-table-min-width {
            min-width: 100% !important;
          }
          .tasks-table-header {
            display: none !important;
          }
          .task-row {
            display: flex !important;
            flex-wrap: wrap !important;
            padding: 16px 12px !important;
            gap: 8px !important;
          }
          .task-row > div {
            margin-bottom: 2px;
          }
          /* Checkbox */
          .task-row > div:nth-child(1) {
            flex: 0 0 24px !important;
          }
          /* Name */
          .task-row > div:nth-child(2) {
            flex: 1 1 calc(100% - 60px) !important;
          }
          /* Course */
          .task-row > div:nth-child(3) {
            flex: 0 0 100% !important;
            padding-left: 36px !important;
            font-size: 11px !important;
            opacity: 0.8;
          }
          /* Due Date */
          .task-row > div:nth-child(4) {
            flex: 0 0 auto !important;
            padding-left: 36px !important;
          }
          /* Status */
          .task-row > div:nth-child(5) {
            flex: 1 1 auto !important;
            display: flex;
            align-items: center;
          }
          /* Star */
          .task-row > div:nth-child(6) {
            position: absolute !important;
            top: 12px !important;
            right: 12px !important;
          }
          .tasks-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 16px !important;
            gap: 16px !important;
          }
          .tasks-header-title span {
            font-size: 18px !important;
          }
          .tasks-header-actions {
            width: 100% !important;
            justify-content: space-between !important;
          }
        }
      `}} />

      {/* ── Header ── */}
      <div className="tasks-header" style={{
        padding: '20px 28px', flexShrink: 0, background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="tasks-header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: BLUE, boxShadow: `0 0 10px rgba(96,165,250,0.8)` }} />
            <span style={{ color: TEXT, fontSize: 20, fontWeight: 800 }}>Quản lý Deadline & Công việc</span>
          </div>
          <div style={{ color: MUTED, fontSize: 12, marginTop: 4, paddingLeft: 14 }}>Sắp xếp theo: Ưu tiên & Khẩn cấp ⚡</div>
        </div>
        <div className="tasks-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => setShowSidebarMobile(!showSidebarMobile)}
            style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10,
            background: showSidebarMobile ? `rgba(96,165,250,0.25)` : `rgba(96,165,250,0.1)`, 
            border: `1px solid rgba(96,165,250,0.25)`,
            color: BLUE, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <Filter size={13} /> {showSidebarMobile ? 'Đóng bộ lọc' : 'Bộ lọc'}
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
      <div className="tasks-body-container" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Task List */}
        <div className="tasks-list-container" style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          <TaskStats tasks={tasks} />

          {/* Table headers */}
          <div className="tasks-table-min-width tasks-table-header" style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 130px 110px 120px 80px',
            gap: 12, padding: '6px 16px', marginBottom: 6,
            color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
          }}>
            <div /> <div>Công việc</div> <div>Môn học</div> <div>Hạn chót</div> <div>Trạng thái</div> <div style={{ textAlign: 'center' }}>Hành động</div>
          </div>

          {/* Dynamic Content Loader */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '60px 0', alignItems: 'center', justifyContent: 'center' }}>
              <div className="premium-spinner" />
              <span style={{ color: MUTED, fontSize: 12 }}>Đang đồng bộ dữ liệu với Supabase Cloud...</span>
            </div>
          ) : sortedTasks.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 40 }}>🎉</span>
              <span style={{ color: TEXT, fontSize: 14, fontWeight: 700, marginTop: 12 }}>Tuyệt vời! Không còn deadline nào chưa hoàn thành</span>
              <span style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>Hãy tận hưởng ngày rảnh rỗi hoặc tập Cardio đốt calo nhé! 💪</span>
            </div>
          ) : (
            sortedTasks.map((task, idx) => (
              <TaskRow
                key={task.id}
                task={task}
                idx={idx}
                isDone={task.status === 'done'}
                isStarred={!!task.starred}
                onToggle={toggleTask}
                onToggleStar={toggleStar}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>

        {/* Sidebar */}
        <TaskSidebar filters={filters} onToggleFilter={toggleFilter} className={showSidebarMobile ? 'show-mobile' : ''} />
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
                <input 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="VD: Báo cáo Lab 4..." 
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, outline: 'none' }} 
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Môn học / Phân loại</label>
                  <input 
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="VD: PRJ301" 
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, outline: 'none' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Hạn chót (Deadline)</label>
                  <input 
                    type="datetime-local" 
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, outline: 'none', colorScheme: 'dark' }} 
                  />
                </div>
              </div>

              {/* Extra Details */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
                  <LinkIcon size={12} /> Link tài liệu / Bài tập
                </label>
                <input 
                  value={newLink}
                  onChange={e => setNewLink(e.target.value)}
                  placeholder="https://docs.google.com/..." 
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
                  <FileText size={12} /> Ghi chú thêm (Không bắt buộc)
                </label>
                <textarea 
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  rows={2} 
                  placeholder="Cần nộp bản cứng cho thầy vào sáng thứ 2..." 
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 13, outline: 'none', resize: 'none' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Priority */}
                <div>
                  <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Ưu tiên quan trọng</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => setNewIsStarred(false)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${!newIsStarred ? 'rgba(96,165,250,0.3)' : BORDER}`,
                        background: !newIsStarred ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.03)',
                        color: !newIsStarred ? BLUE : MUTED, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Bình thường
                    </button>
                    <button 
                      onClick={() => setNewIsStarred(true)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${newIsStarred ? 'rgba(234,179,8,0.3)' : BORDER}`,
                        background: newIsStarred ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.03)',
                        color: newIsStarred ? '#EAB308' : MUTED, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Gắn sao 🌟
                    </button>
                  </div>
                </div>

                {/* Submission Type */}
                <div>
                  <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Hình thức nộp</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => setNewSubmissionType('CMS')}
                      style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${newSubmissionType === 'CMS' ? 'rgba(96,165,250,0.3)' : BORDER}`, background: newSubmissionType === 'CMS' ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.03)', color: newSubmissionType === 'CMS' ? BLUE : MUTED, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <UploadCloud size={13} /> CMS
                    </button>
                    <button 
                      onClick={() => setNewSubmissionType('class')}
                      style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${newSubmissionType === 'class' ? 'rgba(96,165,250,0.3)' : BORDER}`, background: newSubmissionType === 'class' ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.03)', color: newSubmissionType === 'class' ? BLUE : MUTED, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <Users size={13} /> Tại lớp
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddTask}
                disabled={isSaving}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 8, marginTop: 10,
                  background: BLUE, border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 16px rgba(96,165,250,0.4)', opacity: isSaving ? 0.7 : 1
                }}
              >
                {isSaving ? 'Đang tạo...' : 'Tạo Deadline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
