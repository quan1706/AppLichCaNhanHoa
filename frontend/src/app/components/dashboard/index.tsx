'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase, QUAN_UUID } from '../../lib/supabaseClient';
import { BG, BORDER, AiLog } from './calendarUtils';

import { DashboardHeader } from './DashboardHeader';
import { HealthCard } from './HealthCard';
import { DeadlineCard } from './DeadlineCard';
import { MotivationCard, AiActivityLog } from './MotivationCard';
import { WeekCalendar } from './WeekCalendar';
import { MonthCalendar } from './MonthCalendar';
import { YearCalendar } from './YearCalendar';

export function Screen1Dashboard({ onChangeTab }: { onChangeTab?: (tab: any) => void }) {
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
        .eq('user_id', QUAN_UUID);
      if (error) throw error;
      setDbSchedules(data || []);
    } catch (err) { console.error('Lỗi fetch schedules:', err); }
  };

  useEffect(() => {
    fetchWaterIntake();
    fetchDeadlines();
    fetchSchedules();
  }, []);

  // Handlers
  const handleAddWater = async (amount: number) => {
    try {
      setWaterIntake(prev => Math.min(prev + amount, 3500));
      toast.success(`Đã ghi nhận nạp thêm +${amount}ml nước uống! 🥤`);
      setAiLogs(prev => [{ time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), action: 'Ghi nhận nước uống', details: `Nạp thêm +${amount}ml`, status: 'success' }, ...prev].slice(0, 4));
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
    setTamquanQuote('Chờ chút cưng ơi, tamquan đang phân tích ngữ nghĩa tin nhắn bằng Groq AI siêu tốc đây... 💅');
    const toastId = toast.loading('Groq AI đang bóc tách ngôn ngữ tự nhiên...');

    try {
      const res = await fetch('/api/webhook', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: { chat: { id: 8155205657 }, from: { first_name: 'Quân', last_name: 'Nguyễn' }, text: userPrompt } })
      });
      if (!res.ok) throw new Error('Response error');
      const result = await res.json();
      toast.dismiss(toastId);

      if (result.ok) {
        if (result.response_message) setTamquanQuote(result.response_message);
        const { action, data } = result;
        let actionLabel = 'Trò chuyện'; let detailsLabel = 'Tâm sự với tamquan'; let statusType: 'info' | 'success' | 'warning' = 'info';
        if (action === 'water' && data) { actionLabel = 'Nước uống'; detailsLabel = `+${data.amount}ml`; statusType = 'success'; toast.success(`Đã nạp +${data.amount}ml 🥤`); }
        else if (action === 'schedule' && data) { actionLabel = 'Lên lịch'; detailsLabel = data.title; statusType = 'info'; toast.success(`Đã lên lịch "${data.title}" 📅`); }
        else if (action === 'deadline' && data) { actionLabel = 'Tạo deadline'; detailsLabel = data.title; statusType = 'warning'; toast.warning(`Thêm deadline "${data.title}" 🚨`); }
        else { toast.info('Trò chuyện thành công! 💬'); }
        
        setAiLogs(prev => [{ time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), action: actionLabel, details: detailsLabel, status: statusType }, ...prev].slice(0, 4));
      } else {
        toast.error('Groq AI gặp lỗi phân tích dữ liệu! 💅');
        setTamquanQuote('Chị không nghe rõ cưng nói cái gì hết á. Nhập lại xem nào! 💅');
      }
      setTimeout(() => { fetchWaterIntake(); fetchDeadlines(); fetchSchedules(); }, 1000);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Lỗi kết nối API Groq! Vui lòng kiểm tra mạng. 💅');
      setTamquanQuote('Có lỗi gì đó rồi cưng ơi! Groq AI đang bận, tí gõ lại nhé! 💅');
    } finally { setIsSendingAi(false); }
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
      <DashboardHeader 
        aiPrompt={aiPrompt} setAiPrompt={setAiPrompt} isSendingAi={isSendingAi} onSendAi={handleSendAi}
        viewMode={viewMode} setViewMode={setViewMode} navLabel={getNavLabel()}
        onPrevTime={() => shiftTime(-1)} onNextTime={() => shiftTime(1)} onGoToday={goToday}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: 'calc(100vh - 120px)' }}>
        {/* Main calendar area */}
        <div style={{ flex: 1, padding: '0 0 16px 16px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {viewMode === 'week' && <WeekCalendar weekDays={weekDays} dbSchedules={dbSchedules} />}
          {viewMode === 'month' && <MonthCalendar year={currentDate.getFullYear()} month={currentDate.getMonth()} dbSchedules={dbSchedules} />}
          {viewMode === 'year' && <YearCalendar year={currentDate.getFullYear()} />}
        </div>

        {/* Right sidebar widgets */}
        <div style={{
          width: 350, minWidth: 350, padding: '16px 20px', borderLeft: `1px solid ${BORDER}`,
          flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'hidden'
        }}>
          <HealthCard water={waterIntake} onAddWater={handleAddWater} />
          <DeadlineCard items={dbDeadlines} />
          <MotivationCard quote={tamquanQuote} />
          <AiActivityLog logs={aiLogs} />
        </div>
      </div>
    </div>
  );
}
