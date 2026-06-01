'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MessageCircle, X, Sparkles, ChevronLeft } from 'lucide-react';
import { supabase, QUAN_UUID } from '../../lib/supabaseClient';
import { BG, BORDER, AiLog } from './calendarUtils';

import { DashboardToolbar } from './DashboardHeader';
import { TimeNavigation } from './TimeNavigation';
import { AiChatPanel } from './AiChatPanel';
import { HealthCard } from './HealthCard';
import { DeadlineCard } from './DeadlineCard';
import { MotivationCard, AiActivityLog } from './MotivationCard';
import { WeekCalendar } from './WeekCalendar';
import { MonthCalendar } from './MonthCalendar';
import { YearCalendar } from './YearCalendar';

export type ChatMessage = {
  role: 'user' | 'ai';
  text: string;
  action?: 'confirm_add' | 'confirm_delete' | 'schedule_add' | 'schedule_delete' | null;
  payload?: any;
};

export function Screen1Dashboard({ onChangeTab, showAiChat, setShowAiChat }: { onChangeTab?: (tab: any) => void; showAiChat?: boolean; setShowAiChat?: (show: boolean) => void }) {
  // States
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [waterIntake, setWaterIntake] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSendingAi, setIsSendingAi] = useState(false);
  const [dbDeadlines, setDbDeadlines] = useState<any[]>([]);
  const [dbSchedules, setDbSchedules] = useState<any[]>([]);
  const [tamquanQuote, setTamquanQuote] = useState('Bắt đầu từ mốc 92kg cần sự kiên trì tuyệt đối. Giờ làm việc và giờ học FPTU đã cố định, hãy kỷ luật tập luyện các khung giờ còn lại! 💪');
  const [aiLogs, setAiLogs] = useState<AiLog[]>([]);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showAiChatModal, setShowAiChatModal] = useState(false);
  const [targetWeight, setTargetWeight] = useState<number | string>('78');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [editNotesContent, setEditNotesContent] = useState('');
  const [editScheduleTitle, setEditScheduleTitle] = useState('');
  const [editScheduleType, setEditScheduleType] = useState('class');
  const [editScheduleStartTime, setEditScheduleStartTime] = useState('');
  const [editScheduleEndTime, setEditScheduleEndTime] = useState('');
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);

  // Edit Deadline States
  const [selectedDeadline, setSelectedDeadline] = useState<any>(null);
  const [editDeadlineTitle, setEditDeadlineTitle] = useState('');
  const [editDeadlineDate, setEditDeadlineDate] = useState('');
  const [editDeadlineStatus, setEditDeadlineStatus] = useState('');
  const [isUpdatingDeadline, setIsUpdatingDeadline] = useState(false);

  // Add Schedule Form States
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleType, setNewScheduleType] = useState('class');
  const [newScheduleStartTime, setNewScheduleStartTime] = useState('08:00');
  const [newScheduleEndTime, setNewScheduleEndTime] = useState('10:00');
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  const handleAddScheduleSubmit = async () => {
    if (!newScheduleTitle.trim()) { toast.error('Vui lòng nhập tên lịch!'); return; }
    if (!newScheduleDate) { toast.error('Vui lòng chọn ngày!'); return; }
    setIsSavingSchedule(true);
    try {
      const scheduleToInsert = {
        profile_id: QUAN_UUID,
        type: newScheduleType,
        title: newScheduleTitle.trim(),
        days: null,
        specific_date: newScheduleDate,
        start_time: newScheduleStartTime + ':00',
        end_time: newScheduleEndTime + ':00',
        shift: parseInt(newScheduleStartTime.split(':')[0]) >= 12 ? 'afternoon' : 'morning'
      };
      const { error } = await supabase.from('schedules').insert([scheduleToInsert]);
      if (error) throw error;
      toast.success('Đã thêm lịch thành công! 💅');
      setShowAddScheduleModal(false);
      setNewScheduleTitle('');
      fetchSchedules();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi thêm lịch!');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleEventClick = (ev: any) => {
    setSelectedEvent(ev);
    setEditNotesContent(ev.notes || '');
    setEditScheduleTitle(ev.title || '');
    setEditScheduleType(ev.type || 'class');
    const os = ev.originalSchedule;
    setEditScheduleStartTime(os?.start_time ? os.start_time.substring(0,5) : '');
    setEditScheduleEndTime(os?.end_time ? os.end_time.substring(0,5) : '');
  };

  const handleUpdateNote = async () => {
    if (!selectedEvent || !selectedEvent.originalSchedule) return;
    setIsUpdatingSchedule(true);
    try {
      const orig = selectedEvent.originalSchedule;
      const payload = {
         notes: editNotesContent,
         title: editScheduleTitle,
         type: editScheduleType,
         start_time: editScheduleStartTime + ':00',
         end_time: editScheduleEndTime + ':00'
      };

      // Nếu là lịch lặp lại (có days) và đang sửa cho 1 ngày cụ thể
      if (Array.isArray(orig.days) && orig.days.length > 0 && selectedEvent.date_rendered) {
        // Tạo lịch mới cho ngày này
        const newSched = { ...orig, ...payload };
        delete newSched.id;
        newSched.days = null;
        newSched.specific_date = selectedEvent.date_rendered;
        
        // Thêm ngày này vào excluded_dates của lịch cũ
        const currentExcluded = Array.isArray(orig.excluded_dates) ? orig.excluded_dates : [];
        if (!currentExcluded.includes(selectedEvent.date_rendered)) {
          currentExcluded.push(selectedEvent.date_rendered);
        }

        const { error: err1 } = await supabase.from('schedules').update({ excluded_dates: currentExcluded }).eq('id', orig.id);
        if (err1) throw err1;
        
        const { error: err2 } = await supabase.from('schedules').insert([newSched]);
        if (err2) throw err2;
        
      } else {
        // Sửa lịch trực tiếp
        const { error } = await supabase.from('schedules').update(payload).eq('id', orig.id);
        if (error) throw error;
      }
      toast.success('Cập nhật lịch thành công! 💅');
      setSelectedEvent(null);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi cập nhật ghi chú!');
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedEvent || !selectedEvent.originalSchedule) return;
    if (!confirm('Chắc chắn xóa lịch này?')) return;
    setIsUpdatingSchedule(true);
    try {
      const orig = selectedEvent.originalSchedule;
      // Nếu là lịch lặp lại (có days) và đang xóa cho 1 ngày cụ thể
      if (Array.isArray(orig.days) && orig.days.length > 0 && selectedEvent.date_rendered) {
        const currentExcluded = Array.isArray(orig.excluded_dates) ? orig.excluded_dates : [];
        if (!currentExcluded.includes(selectedEvent.date_rendered)) {
          currentExcluded.push(selectedEvent.date_rendered);
        }
        const { error } = await supabase.from('schedules').update({ excluded_dates: currentExcluded }).eq('id', orig.id);
        if (error) throw error;
      } else {
        // Xóa hoàn toàn lịch
        const { error } = await supabase.from('schedules').delete().eq('id', orig.id);
        if (error) throw error;
      }
      toast.success('Đã xóa lịch! 💅');
      setSelectedEvent(null);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa lịch!');
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  const handleEditDeadlineClick = (dl: any) => {
    setSelectedDeadline(dl);
    setEditDeadlineTitle(dl.title);
    setEditDeadlineDate(dl.due_date ? dl.due_date.substring(0, 10) : '');
    setEditDeadlineStatus(dl.status);
  };

  const handleUpdateDeadline = async () => {
    if (!selectedDeadline) return;
    setIsUpdatingDeadline(true);
    try {
      const { error } = await supabase.from('deadlines').update({ 
        title: editDeadlineTitle,
        due_date: editDeadlineDate ? new Date(editDeadlineDate).toISOString() : new Date().toISOString(),
        status: editDeadlineStatus
      }).eq('id', selectedDeadline.id);
      
      if (error) throw error;
      toast.success('Cập nhật deadline thành công! 💅');
      setSelectedDeadline(null);
      fetchDeadlines();
    } catch(err) {
      console.error(err);
      toast.error('Lỗi cập nhật deadline!');
    } finally {
      setIsUpdatingDeadline(false);
    }
  };

  const handleDeleteDeadline = async () => {
    if (!selectedDeadline) return;
    if (!confirm('Chắc chắn xóa deadline này?')) return;
    setIsUpdatingDeadline(true);
    try {
      const { error } = await supabase.from('deadlines').delete().eq('id', selectedDeadline.id);
      if (error) throw error;
      toast.success('Đã xóa deadline! 💅');
      setSelectedDeadline(null);
      fetchDeadlines();
    } catch(err) {
      console.error(err);
      toast.error('Lỗi khi xóa deadline!');
    } finally {
      setIsUpdatingDeadline(false);
    }
  };

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Fetch Data
  const fetchWaterIntake = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.from('water_tracking').select('amount')
        .eq('user_id', QUAN_UUID)
        .gte('consumed_at', `${todayStr}T00:00:00.000Z`)
        .lte('consumed_at', `${todayStr}T23:59:59.999Z`);
      if (error) throw error;
      setWaterIntake(data ? data.reduce((sum, item) => sum + Number(item.amount), 0) : 0);
    } catch (err) { console.error('Lỗi fetch nước:', err); }
  };

  const fetchDeadlines = async () => {
    try {
      const { data, error } = await supabase.from('deadlines').select('*')
        .eq('user_id', QUAN_UUID).order('due_date', { ascending: true });
      if (error) throw error;
      if (data) setDbDeadlines(data);
    } catch (err) { console.error('Lỗi fetch deadlines:', err); }
  };

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase.from('schedules').select('*')
        .eq('profile_id', QUAN_UUID);
      if (error) throw error;
      
      if (!data || data.length === 0) {
        // Tự động hạt giống (Seed) lịch cố định ban đầu vào Supabase nếu chưa có
        const defaultSchedules = [
          { profile_id: QUAN_UUID, type: 'class', title: 'Lịch học FPTU', days: [1, 3, 5], start_time: '07:00:00', end_time: '11:00:00', shift: 'morning' },
          { profile_id: QUAN_UUID, type: 'work', title: 'Làm việc', days: [1, 2, 3, 4, 5], start_time: '08:00:00', end_time: '17:00:00', shift: 'morning' },
          { profile_id: QUAN_UUID, type: 'workout', title: 'Chạy bộ tối', days: [1, 5], start_time: '18:00:00', end_time: '19:00:00', shift: 'afternoon' },
          { profile_id: QUAN_UUID, type: 'workout', title: 'Tập Pickleball 🏓', days: [2, 6], start_time: '17:00:00', end_time: '19:00:00', shift: 'afternoon' },
          { profile_id: QUAN_UUID, type: 'workout', title: 'Tập Gym 🏋️', days: [3], start_time: '17:30:00', end_time: '19:00:00', shift: 'afternoon' },
          { profile_id: QUAN_UUID, type: 'workout', title: 'Chạy bộ sáng', days: [6], start_time: '06:00:00', end_time: '07:30:00', shift: 'morning' },
        ];
        const { error: seedError } = await supabase.from('schedules').insert(defaultSchedules);
        if (!seedError) {
          const { data: seededData } = await supabase.from('schedules').select('*').eq('profile_id', QUAN_UUID);
          setDbSchedules(seededData || []);
        } else {
          console.error('Lỗi khi seed schedules:', seedError);
          setDbSchedules([]);
        }
      } else {
        setDbSchedules(data);
      }
    } catch (err) { console.error('Lỗi fetch schedules:', err); }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('target_weight')
        .eq('id', QUAN_UUID)
        .single();
      if (error) throw error;
      if (data && data.target_weight) {
        setTargetWeight(Number(data.target_weight));
      }
    } catch (err) { console.error('Lỗi fetch target weight:', err); }
  };

  useEffect(() => {
    fetchWaterIntake();
    fetchDeadlines();
    fetchSchedules();
    fetchProfile();
  }, []);

  // Handlers
  const handleAddWater = async (amount: number) => {
    try {
      setWaterIntake(prev => Math.min(prev + amount, 3500));
      toast.success(`Đã ghi nhận nạp thêm +${amount}ml nước uống! 🥤`);
      setAiLogs(prev => [{ time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), action: 'Ghi nhận nước uống', details: `Nạp thêm +${amount}ml`, status: 'success' as const }, ...prev].slice(0, 4));
      const { error } = await supabase.from('water_tracking').insert({ user_id: QUAN_UUID, amount });
      if (error) throw error;
      fetchWaterIntake();
    } catch (err) {
      console.error('Lỗi thêm nước:', err);
      toast.error('Lỗi kết nối cơ sở dữ liệu! 💅');
    }
  };

  const handleSendAi = async () => {
    if (!aiPrompt.trim() || isSendingAi) return;
    setIsSendingAi(true);
    const userPrompt = aiPrompt;
    setAiPrompt('');
    setTamquanQuote('Chờ chút cưng ơi, tamquan đang phân tích lịch bận để xếp lịch tập luyện tối ưu cho cưng đây... 💅');
    
    const newUserMsg: ChatMessage = { role: 'user', text: userPrompt };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    
    const toastId = toast.loading('tamquan đang thiết kế lịch tập luyện...');

    try {
      const res = await fetch('/api/ai/fitness', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedHistory })
      });
      
      if (!res.ok) throw new Error('Response error');
      const result = await res.json();
      toast.dismiss(toastId);

      if (result.ok) {
        if (result.response_message) {
          setTamquanQuote(result.response_message);
        }
        
        const { action, payload, insertedSchedule } = result;
        const finalPayload = payload || insertedSchedule;
        
        const aiMsg: ChatMessage = {
          role: 'ai',
          text: result.response_message || 'Đây là kết quả của cưng!',
          action: action,
          payload: finalPayload
        };
        setChatHistory(prev => [...prev, aiMsg]);

        let actionLabel = 'Trò chuyện'; 
        let detailsLabel = 'Tập luyện cùng tamquan'; 
        let statusType: 'info' | 'success' | 'warning' = 'info';

        if (action === 'schedule_add') {
          actionLabel = 'Lên lịch'; 
          detailsLabel = finalPayload?.title || 'Lịch mới'; 
          statusType = 'success'; 
          toast.success(`Đã tự động xếp lịch tập: "${detailsLabel}" 🏋️`);
          fetchSchedules();
        } else if (action === 'confirm_add' || action === 'confirm_delete') {
          actionLabel = 'Chờ xác nhận';
          detailsLabel = action === 'confirm_add' ? 'Thêm lịch' : 'Xóa lịch';
          statusType = 'warning';
        } else {
          toast.info('Trò chuyện thành công! 💬');
        }
        
        setAiLogs(prev => [
          { 
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), 
            action: actionLabel, 
            details: detailsLabel, 
            status: statusType 
          }, 
          ...prev
        ].slice(0, 4));
      } else {
        toast.error('Groq AI gặp lỗi thiết kế lịch! 💅');
        setTamquanQuote('Chị không nghe rõ cưng nói cái gì hết á. Nhập lại xem nào! 💅');
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Lỗi kết nối API Fitness! Vui lòng kiểm tra mạng. 💅');
      setTamquanQuote('Có lỗi gì đó rồi cưng ơi! Groq Fitness AI đang bận, tí gõ lại nhé! 💅');
    } finally { 
      setIsSendingAi(false); 
    }
  };

  const handleConfirmAction = async (action: string, payload: any) => {
    setIsSendingAi(true);
    const toastId = toast.loading('Đang xử lý...');
    try {
      const res = await fetch('/api/ai/fitness/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
      if (!res.ok) throw new Error('Response error');
      const result = await res.json();
      toast.dismiss(toastId);
      if (result.ok) {
        toast.success(action === 'confirm_add' ? 'Đã thêm lịch thành công! 💅' : 'Đã xóa lịch thành công! 💅');
        fetchSchedules();
        
        // Thêm tin nhắn xác nhận vào chat
        setChatHistory(prev => [...prev, {
          role: 'ai',
          text: action === 'confirm_add' ? 'Đã thêm lịch xong rồi nha cưng!' : 'Đã xóa lịch xong rồi nha cưng!',
          action: null
        }]);
      } else {
        toast.error('Lỗi khi thực thi lệnh! 💅');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Lỗi mạng khi thực thi! 💅');
    } finally {
      setIsSendingAi(false);
    }
  };

  // Calendar logic
  const getMonday = (d: Date) => { const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); return new Date(d.getFullYear(), d.getMonth(), diff); };
  const startOfWeek = getMonday(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const nextD = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i);
    return { short: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i], date: nextD.getDate(), fullDate: nextD, today: nextD.toDateString() === new Date().toDateString() };
  });

  const shiftTime = (dir: 1 | -1) => {
    if (viewMode === 'week') setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7 * dir));
    else if (viewMode === 'month') setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1 * dir, 1));
    else setCurrentDate(prev => new Date(prev.getFullYear() + 1 * dir, prev.getMonth(), 1));
  };
  const goToday = () => setCurrentDate(new Date());

  const getNavLabel = () => {
    if (viewMode === 'week') {
      const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);
      return startOfWeek.getMonth() === endOfWeek.getMonth()
        ? `Tháng ${startOfWeek.getMonth() + 1}, ${startOfWeek.getFullYear()}`
        : `Tháng ${startOfWeek.getMonth() + 1} - Tháng ${endOfWeek.getMonth() + 1}, ${startOfWeek.getFullYear()}`;
    }
    return viewMode === 'month' ? `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}` : `Năm ${currentDate.getFullYear()}`;
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: BG, overflow: 'hidden', fontFamily: 'Inter,sans-serif' }}>
      {/* Toolbar */}
      <DashboardToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onAddSchedule={() => setShowAddScheduleModal(true)}
        aiChatOpen={showAiChatModal}
        onToggleAiChat={() => setShowAiChatModal(prev => !prev)}
        targetWeight={targetWeight}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="dashboard-content" style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* AI Chat Panel - slides in between nav and calendar */}
        <AiChatPanel
          isOpen={showAiChatModal}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          isSendingAi={isSendingAi}
          onSendAi={handleSendAi}
          chatHistory={chatHistory}
          onConfirmAction={handleConfirmAction}
          onClose={() => setShowAiChatModal(false)}
        />

        {/* Main calendar area */}
        <div className="main-calendar" style={{ flex: 1, padding: '0 0 16px 16px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <TimeNavigation
            navLabel={getNavLabel()}
            viewMode={viewMode}
            onPrevTime={() => shiftTime(-1)}
            onNextTime={() => shiftTime(1)}
            onGoToday={goToday}
          />
          {viewMode === 'week'  && <WeekCalendar weekDays={weekDays} dbSchedules={dbSchedules} onEventClick={handleEventClick} />}
          {viewMode === 'month' && <MonthCalendar year={currentDate.getFullYear()} month={currentDate.getMonth()} dbSchedules={dbSchedules} onEventClick={handleEventClick} />}
          {viewMode === 'year'  && <YearCalendar year={currentDate.getFullYear()} />}
        </div>

        {/* Right sidebar widgets */}
        <div className="right-sidebar" style={{
          width: 350, minWidth: 350, padding: '16px 20px', borderLeft: `1px solid ${BORDER}`,
          flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflowY: 'auto', overflowX: 'hidden'
        }}>
          <HealthCard water={waterIntake} onAddWater={handleAddWater} />
          <DeadlineCard items={dbDeadlines} onEdit={handleEditDeadlineClick} />
          <MotivationCard quote={tamquanQuote} />
          <AiActivityLog logs={aiLogs} />
        </div>
      </div>

      {/* Custom Styles for AI Docked Handle & Responsive Layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-content {
          flex: 1; display: flex; overflow: hidden; position: relative;
        }
        .main-calendar {
          flex: 1; padding: 0 0 16px 16px; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column;
        }
        .right-sidebar {
          width: 350px; min-width: 350px; padding: 16px 20px; border-left: 1px solid ${BORDER};
          flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; height: 100%; overflow-y: auto; overflow-x: hidden;
        }
        
        @media (max-width: 768px) {
          .dashboard-content {
            flex-direction: column !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .main-calendar {
            padding: 16px !important;
            overflow-y: visible !important; 
            flex: none !important;
          }
          .right-sidebar {
            width: 100% !important;
            min-width: 100% !important;
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.08) !important;
            height: auto !important;
            overflow-y: visible !important;
            padding-bottom: 96px !important; /* Spacing for bottom tab bar */
          }
        }

        .premium-dock-handle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF7A00 0%, #FF3D00 100%);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(255, 92, 0, 0.4);
        }

        .premium-dock-handle:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 12px 28px rgba(255, 92, 0, 0.5);
        }

        .premium-dock-handle:active {
          transform: scale(0.95);
        }

        .premium-dock-handle.active {
          background: rgba(30, 30, 30, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .premium-dock-handle {
            bottom: 96px; /* above bottom bar */
            right: 16px;
            width: 50px; 
            height: 50px;
          }
          .premium-dock-handle.active {
            display: none; /* Hide toggle button when modal is open on mobile */
          }
        }
      `}} />

      {/* Docked AI Chat Assistant Toggle Handle */}
      <button
        onClick={() => setShowAiChatModal(prev => !prev)}
        className={`premium-dock-handle ${showAiChatModal ? 'active' : ''}`}
        title={showAiChatModal ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
      >
        {showAiChatModal ? (
          <X size={24} color="#FFFFFF" />
        ) : (
          <MessageCircle size={24} color="#FFFFFF" />
        )}
      </button>

      {/* Add Schedule Modal */}
      {showAddScheduleModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddScheduleModal(false) }}
          style={{
          position: 'absolute', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            width: 480, background: 'rgba(18,18,18,0.95)', border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5C00', boxShadow: '0 0 8px rgba(255,92,0,0.8)' }} />
                Thêm Lịch Trình
              </div>
              <button onClick={() => setShowAddScheduleModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7A7A7A' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Tên lịch trình</label>
                <input 
                  value={newScheduleTitle} onChange={e => setNewScheduleTitle(e.target.value)}
                  placeholder="VD: Họp dự án..." 
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }} 
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Phân loại</label>
                  <select 
                    value={newScheduleType} onChange={e => setNewScheduleType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(10,10,10,1)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }}>
                    <option value="class">Học tập / Lớp học</option>
                    <option value="work">Công việc</option>
                    <option value="workout">Tập luyện</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Ngày (Cụ thể)</label>
                  <input 
                    type="date" value={newScheduleDate} onChange={e => setNewScheduleDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', colorScheme: 'dark' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Giờ bắt đầu</label>
                  <input 
                    type="time" value={newScheduleStartTime} onChange={e => setNewScheduleStartTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', colorScheme: 'dark' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Giờ kết thúc</label>
                  <input 
                    type="time" value={newScheduleEndTime} onChange={e => setNewScheduleEndTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', colorScheme: 'dark' }} 
                  />
                </div>
              </div>

              <button 
                onClick={handleAddScheduleSubmit} disabled={isSavingSchedule}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 8, marginTop: 10,
                  background: '#FF5C00', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: isSavingSchedule ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 16px rgba(255,92,0,0.4)', opacity: isSavingSchedule ? 0.7 : 1
                }}
              >
                {isSavingSchedule ? 'Đang tạo...' : 'Tạo Lịch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Details Modal */}
      {selectedEvent && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedEvent(null) }}
          style={{
          position: 'absolute', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            width: 480, background: 'rgba(18,18,18,0.95)', border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedEvent.type === 'fixed' ? '#F87171' : '#FFA066', boxShadow: '0 0 8px rgba(255,92,0,0.8)' }} />
                  {selectedEvent.title}
                </div>
                {selectedEvent.sub && <div style={{ color: '#7A7A7A', fontSize: 13, marginTop: 4 }}>{selectedEvent.sub}</div>}
              </div>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7A7A7A' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Tên lịch trình</label>
                <input 
                  value={editScheduleTitle} onChange={e => setEditScheduleTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Phân loại</label>
                  <select 
                    value={editScheduleType} onChange={e => setEditScheduleType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(10,10,10,1)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }}>
                    <option value="class">Học tập / Lớp học</option>
                    <option value="work">Công việc</option>
                    <option value="workout">Tập luyện</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Giờ bắt đầu</label>
                  <input 
                    type="time" value={editScheduleStartTime} onChange={e => setEditScheduleStartTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', colorScheme: 'dark' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Giờ kết thúc</label>
                  <input 
                    type="time" value={editScheduleEndTime} onChange={e => setEditScheduleEndTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', colorScheme: 'dark' }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Ghi chú công việc / Lịch trình</label>
                <textarea 
                  value={editNotesContent} onChange={e => setEditNotesContent(e.target.value)}
                  placeholder="Nhập ghi chú tại đây..." 
                  rows={4}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                <button 
                  onClick={handleDeleteSchedule} disabled={isUpdatingSchedule}
                  style={{
                    padding: '10px 0', borderRadius: 8,
                    background: 'rgba(229,62,62,0.15)', border: '1px solid rgba(229,62,62,0.4)', color: '#F87171', fontSize: 13, fontWeight: 700, cursor: isUpdatingSchedule ? 'not-allowed' : 'pointer',
                  }}
                >
                  Xóa Lịch
                </button>
                <button 
                  onClick={handleUpdateNote} disabled={isUpdatingSchedule}
                  style={{
                    padding: '10px 0', borderRadius: 8,
                    background: '#FF5C00', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: isUpdatingSchedule ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 16px rgba(255,92,0,0.4)'
                  }}
                >
                  {isUpdatingSchedule ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deadline Details Modal */}
      {selectedDeadline && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedDeadline(null) }}
          style={{
          position: 'absolute', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            width: 480, background: 'rgba(18,18,18,0.95)', border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                Chỉnh sửa Deadline
              </div>
              <button onClick={() => setSelectedDeadline(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7A7A7A' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Tiêu đề</label>
                <input 
                  value={editDeadlineTitle} onChange={e => setEditDeadlineTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Hạn chót</label>
                <input 
                  type="date"
                  value={editDeadlineDate} onChange={e => setEditDeadlineDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', color: '#7A7A7A', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Trạng thái</label>
                <select 
                  value={editDeadlineStatus} onChange={e => setEditDeadlineStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }} 
                >
                  <option value="pending" style={{ background: BG }}>Chưa hoàn thành</option>
                  <option value="done" style={{ background: BG }}>Đã xong</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                <button 
                  onClick={handleDeleteDeadline} disabled={isUpdatingDeadline}
                  style={{
                    padding: '10px 0', borderRadius: 8,
                    background: 'rgba(229,62,62,0.15)', border: '1px solid rgba(229,62,62,0.4)', color: '#F87171', fontSize: 13, fontWeight: 700, cursor: isUpdatingDeadline ? 'not-allowed' : 'pointer',
                  }}
                >
                  Xóa Deadline
                </button>
                <button 
                  onClick={handleUpdateDeadline} disabled={isUpdatingDeadline}
                  style={{
                    padding: '10px 0', borderRadius: 8,
                    background: '#FF5C00', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: isUpdatingDeadline ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 16px rgba(255,92,0,0.4)'
                  }}
                >
                  {isUpdatingDeadline ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
