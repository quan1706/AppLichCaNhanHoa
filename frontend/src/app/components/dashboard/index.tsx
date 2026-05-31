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
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 4, 29)); // Default to sample date
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
    const isSampleToday = nextD.getFullYear() === 2026 && nextD.getMonth() === 4 && nextD.getDate() === 29;
    return { short: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i], date: nextD.getDate(), fullDate: nextD, today: isSampleToday || nextD.toDateString() === new Date().toDateString() };
  });

  const shiftTime = (dir: 1 | -1) => {
    if (viewMode === 'week') setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7 * dir));
    else if (viewMode === 'month') setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1 * dir, 1));
    else setCurrentDate(prev => new Date(prev.getFullYear() + 1 * dir, prev.getMonth(), 1));
  };
  const goToday = () => setCurrentDate(new Date(2026, 4, 29));

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

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* AI Chat Panel - slides in between nav and calendar */}
        <AiChatPanel
          isOpen={showAiChatModal}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          isSendingAi={isSendingAi}
          onSendAi={handleSendAi}
          chatHistory={chatHistory}
          onConfirmAction={handleConfirmAction}
        />

        {/* Main calendar area */}
        <div style={{ flex: 1, padding: '0 0 16px 16px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <TimeNavigation
            navLabel={getNavLabel()}
            viewMode={viewMode}
            onPrevTime={() => shiftTime(-1)}
            onNextTime={() => shiftTime(1)}
            onGoToday={goToday}
          />
          {viewMode === 'week'  && <WeekCalendar weekDays={weekDays} dbSchedules={dbSchedules} />}
          {viewMode === 'month' && <MonthCalendar year={currentDate.getFullYear()} month={currentDate.getMonth()} dbSchedules={dbSchedules} />}
          {viewMode === 'year'  && <YearCalendar year={currentDate.getFullYear()} />}
        </div>

        {/* Right sidebar widgets */}
        <div style={{
          width: 350, minWidth: 350, padding: '16px 20px', borderLeft: `1px solid ${BORDER}`,
          flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflowY: 'auto', overflowX: 'hidden'
        }}>
          <HealthCard water={waterIntake} onAddWater={handleAddWater} />
          <DeadlineCard items={dbDeadlines} />
          <MotivationCard quote={tamquanQuote} />
          <AiActivityLog logs={aiLogs} />
        </div>
      </div>

      {/* Custom Styles for AI Docked Handle */}
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-dock-handle {
          position: absolute;
          top: 240px;
          width: 24px;
          height: 64px;
          border-radius: 0 12px 12px 0;
          background: rgba(30, 30, 30, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 92, 0, 0.35);
          border-left: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 999;
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.2s, background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
          box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
        }

        .premium-dock-handle:hover {
          width: 30px;
          background: rgba(35, 35, 35, 0.95);
          border-color: rgba(255, 92, 0, 0.6);
          box-shadow: 6px 0 20px rgba(255, 92, 0, 0.2);
        }

        .premium-dock-handle:active {
          width: 22px;
        }

        .premium-dock-handle.active {
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(25, 25, 25, 0.85);
        }

        .premium-dock-handle.active:hover {
          border-color: rgba(255, 92, 0, 0.4);
          background: rgba(30, 30, 30, 0.95);
        }
      `}} />

      {/* Docked AI Chat Assistant Toggle Handle */}
      <button
        onClick={() => setShowAiChatModal(prev => !prev)}
        className={`premium-dock-handle ${showAiChatModal ? 'active' : ''}`}
        style={{
          left: showAiChatModal ? 320 : 0,
        }}
        title={showAiChatModal ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
      >
        {showAiChatModal ? (
          <ChevronLeft size={16} color="#7A7A7A" />
        ) : (
          <Sparkles size={14} color="#FF5C00" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 92, 0, 0.4))' }} />
        )}
      </button>
    </div>
  );
}
