'use client';

import { useState, useEffect } from 'react';
import { Save, User, Droplets, Scale, Clock, Plus, Trash2, Bell, Bot, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, QUAN_UUID } from '../../lib/supabaseClient';
import { BG, PURPLE, TEXT, MUTED, ORANGE, GREEN, BLUE, BORDER } from './settingsUtils';
import { NInput, NToggle, DaySelector, SectionCard } from './SettingsUI';

export function Screen4Settings({ onChangeTab }: { onChangeTab?: (tab: any) => void }) {
  // Profiles Data States
  const [fullName, setFullName] = useState('Nguyễn Tam Quân');
  const [age, setAge] = useState<number | string>(22);
  const [currentWeight, setCurrentWeight] = useState<number | string>(92);
  const [targetWeight, setTargetWeight] = useState<number | string>(78);
  const [height, setHeight] = useState<number | string>(172);
  const [waterGoal, setWaterGoal] = useState<number | string>(3500);
  const [activityLevel, setActivityLevel] = useState('Vừa phải');
  const [telegramUsername, setTelegramUsername] = useState('@tamquan_dev');
  const [botToken, setBotToken] = useState('886015xxxx:AAGFxxxxxxxxxxxx');
  const [botPersonality, setBotPersonality] = useState('Đanh Đá 🔥');

  // UI States
  const [classDays, setClassDays] = useState([0, 2, 4]);
  const [workDays, setWorkDays] = useState([0, 1, 2, 3, 4]);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Each schedule can have multiple time slots with shift label
  const [classSlots, setClassSlots] = useState([
    { id: 1, shift: 'morning' as 'morning' | 'afternoon', start: '07:00', end: '11:00' },
  ]);
  const [workSlots, setWorkSlots] = useState([
    { id: 1, shift: 'morning' as 'morning' | 'afternoon', start: '08:00', end: '12:00' },
    { id: 2, shift: 'afternoon' as 'morning' | 'afternoon', start: '13:00', end: '17:00' },
  ]);
  const [workouts, setWorkouts] = useState([
    { id: 1, name: 'Pickleball 🏓', days: 'T3, T7', time: '5:00–7:00 CH' },
    { id: 2, name: 'Gym / Kháng lực 🏋️', days: 'T5', time: '5:30–7:00 CH' },
    { id: 3, name: 'Chạy bộ 🏃', days: 'T2, T6', time: '6:00–7:00 CH' },
  ]);
  const [notifications, setNotifications] = useState([
    { id: 'water', label: 'Nhắc nhở uống nước', sub: 'Mỗi 2 tiếng qua Telegram', on: true, color: BLUE },
    { id: 'prep', label: 'Nhắc chuẩn bị đồ ăn', sub: '7:00 tối CN hàng tuần', on: true, color: ORANGE },
    { id: 'workout', label: 'Nhắc nhở tập luyện', sub: '30 phút trước buổi tập', on: true, color: GREEN },
    { id: 'deadline', label: 'Cảnh báo Deadline khẩn', sub: 'Trước 3 ngày, 1 ngày, 1h', on: true, color: '#F87171' },
    { id: 'report', label: 'Báo cáo tiến trình tuần', sub: 'CN 9:00 tối hàng tuần', on: false, color: PURPLE },
  ]);

  // 1. Fetch Profile Data
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', QUAN_UUID)
        .single();

      if (error) throw error;
      if (data) {
        setFullName(data.full_name || '');
        setAge(data.age ?? 22);
        setCurrentWeight(Number(data.current_weight) || 92);
        setTargetWeight(Number(data.target_weight) || 78);
        setHeight(Number(data.height) || 172);
        setWaterGoal(data.water_goal ?? 3500);
        setActivityLevel(data.activity_level || 'Vừa phải');
        setTelegramUsername(data.telegram_username || '');
        setBotToken(data.bot_token || '');
        setBotPersonality(data.bot_personality || 'Đanh Đá 🔥');

        if (data.schedule_config) {
          setClassDays(data.schedule_config.classDays || [0, 2, 4]);
          setWorkDays(data.schedule_config.workDays || [0, 1, 2, 3, 4]);
          setClassSlots(data.schedule_config.classSlots || [{ id: 1, shift: 'morning', start: '07:00', end: '11:00' }]);
          setWorkSlots(data.schedule_config.workSlots || [
            { id: 1, shift: 'morning', start: '08:00', end: '12:00' },
            { id: 2, shift: 'afternoon', start: '13:00', end: '17:00' }
          ]);
          setWorkouts(data.schedule_config.workouts || [
            { id: 1, name: 'Pickleball 🏓', days: 'T3, T7', time: '5:00–7:00 CH' },
            { id: 2, name: 'Gym / Kháng lực 🏋️', days: 'T5', time: '5:30–7:00 CH' },
            { id: 3, name: 'Chạy bộ 🏃', days: 'T2, T6', time: '6:00–7:00 CH' },
          ]);
        }
        if (data.notification_config) {
          setNotifications(data.notification_config);
        }
      }
    } catch (err) {
      console.error('Lỗi nạp cấu hình:', err);
      toast.error('Lỗi khi tải thông tin cấu hình từ Supabase! 💅');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Save Profile Data
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          age: parseInt(String(age)) || null,
          current_weight: parseFloat(String(currentWeight)) || null,
          target_weight: parseFloat(String(targetWeight)) || null,
          height: parseFloat(String(height)) || null,
          water_goal: parseInt(String(waterGoal)) || null,
          activity_level: activityLevel,
          telegram_username: telegramUsername,
          bot_token: botToken,
          bot_personality: botPersonality,
          schedule_config: { classDays, workDays, classSlots, workSlots, workouts },
          notification_config: notifications,
        })
        .eq('id', QUAN_UUID);

      if (error) throw error;
      toast.success('Đã đồng bộ hồ sơ cấu hình lên Supabase Cloud thành công! 🚀');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      toast.error('Gặp sự cố khi lưu cấu hình cá nhân!');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (days: number[], i: number, setter: (d: number[]) => void) => {
    setter(days.includes(i) ? days.filter(d => d !== i) : [...days, i]);
  };

  const addSlot = (setter: React.Dispatch<React.SetStateAction<any[]>>, defaultShift: 'morning' | 'afternoon') => {
    setter(prev => [...prev, { id: Date.now(), shift: defaultShift, start: '07:00', end: '11:00' }]);
  };

  const removeSlot = (id: number, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    setter(prev => prev.filter(s => s.id !== id));
  };

  const toggleShift = (id: number, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    setter(prev => prev.map(s => s.id === id ? { ...s, shift: s.shift === 'morning' ? 'afternoon' : 'morning' } : s));
  };

  const updateSlotTime = (id: number, setter: React.Dispatch<React.SetStateAction<any[]>>, field: 'start'|'end', value: string) => {
    setter(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, on: !n.on } : n));
  };

  const ShiftSlotRow = ({ slot, onToggleShift, onRemove, onChangeTime, accentColor }: {
    slot: { id: number; shift: 'morning' | 'afternoon'; start: string; end: string };
    onToggleShift: () => void;
    onRemove: () => void;
    onChangeTime: (field: 'start' | 'end', value: string) => void;
    accentColor: string;
  }) => (
    <div className="settings-flex-wrap" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      {/* Sáng / Chiều toggle */}
      <button
        onClick={onToggleShift}
        style={{
          flexShrink: 0, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
          background: slot.shift === 'morning' ? 'rgba(96,165,250,0.12)' : 'rgba(167,139,250,0.12)',
          border: `1px solid ${slot.shift === 'morning' ? BLUE : PURPLE}`,
          color: slot.shift === 'morning' ? BLUE : PURPLE,
          minWidth: 68,
        }}
      >
        {slot.shift === 'morning' ? '🌅 Sáng' : '🌇 Chiều'}
      </button>

      {/* Time range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        <input type="time" value={slot.start} onChange={e => onChangeTime('start', e.target.value)} style={{
          flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 8, color: TEXT, fontSize: 12, padding: '7px 10px', outline: 'none',
        }} />
        <span style={{ color: MUTED, fontSize: 11 }}>–</span>
        <input type="time" value={slot.end} onChange={e => onChangeTime('end', e.target.value)} style={{
          flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 8, color: TEXT, fontSize: 12, padding: '7px 10px', outline: 'none',
        }} />
      </div>

      {/* Remove */}
      <button onClick={onRemove} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
        <Trash2 size={13} color={MUTED} />
      </button>
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: BG, overflow: 'hidden', fontFamily: 'Inter,sans-serif' }}>
      
      {/* Loading Spinner & Responsive CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(167, 139, 250, 0.1);
          border-radius: 50%;
          border-top-color: #A78BFA;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .settings-grid { grid-template-columns: 1fr !important; }
          .settings-inner-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .settings-body { padding: 16px !important; padding-bottom: 100px !important; }
          .settings-header { padding: 16px !important; flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .settings-header-btn { width: 100% !important; justify-content: center !important; }
          .settings-flex-wrap { flex-wrap: wrap !important; gap: 6px !important; }
          .settings-flex-col { flex-direction: column !important; align-items: flex-start !important; gap: 6px !important; }
        }
      `}} />

      {/* ── Header ── */}
      <div className="settings-header" style={{
        padding: '18px 28px', flexShrink: 0,
        background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(167,139,250,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 20, borderRadius: 2, background: PURPLE, boxShadow: '0 0 10px rgba(167,139,250,0.8)' }} />
            <span style={{ color: TEXT, fontSize: 20, fontWeight: 800 }}>Cài đặt cá nhân</span>
          </div>
          <div style={{ color: MUTED, fontSize: 12, marginTop: 4, paddingLeft: 14 }}>Cấu hình hồ sơ & lịch trình để AI cá nhân hóa cho anh Quân</div>
        </div>
        <button 
          className="settings-header-btn"
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none',
            background: saved ? `linear-gradient(135deg, ${GREEN}, #16A34A)` : `linear-gradient(135deg, ${ORANGE}, #FF3D00)`,
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer',
            boxShadow: saved ? '0 0 20px rgba(34,197,94,0.5)' : '0 0 20px rgba(255,92,0,0.4)',
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            transform: saved ? 'scale(1.05)' : 'scale(1)',
            opacity: isSaving ? 0.75 : 1,
          }}
        >
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          {isSaving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu cài đặt'}
        </button>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center' }}>
          <div className="premium-spinner" />
          <span style={{ color: MUTED, fontSize: 12 }}>Đang đồng bộ hồ sơ cấu hình...</span>
        </div>
      ) : (
        <div className="settings-body" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 1200 }}>

            {/* ── Body Profile ── */}
            <SectionCard title="Hồ sơ cơ thể" subtitle="Dùng để tính toán thâm hụt calo" icon={<User size={17} color={ORANGE} />} neon={ORANGE}>
              <NInput label="Họ và tên" value={fullName} onChange={setFullName} type="text" icon={<User size={14} />} />
              <NInput label="Tuổi" value={age} onChange={setAge} unit="tuổi" type="number" />
              <div className="settings-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <NInput label="Cân nặng hiện tại" value={currentWeight} onChange={setCurrentWeight} unit="kg" type="number" neon={ORANGE} icon={<Scale size={14} />} />
                <NInput label="Cân nặng mục tiêu" value={targetWeight} onChange={setTargetWeight} unit="kg" type="number" />
              </div>
              <div style={{ padding: '14px 16px', background: 'rgba(255,92,0,0.04)', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(255,92,0,0.12)' }}>
                <div className="settings-flex-col" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: TEXT, fontSize: 12, fontWeight: 600 }}>Tiến trình giảm cân</span>
                  <span style={{ color: GREEN, fontSize: 12, fontWeight: 700 }}>Mục tiêu thâm hụt: 110g - 138g Đạm/ngày 🍳</span>
                </div>
                <div style={{ height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '12%', background: ORANGE, borderRadius: 4, boxShadow: '0 0 8px rgba(255,92,0,0.6)', transition: 'width 1s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ color: MUTED, fontSize: 10 }}>Hiện tại: {currentWeight} kg</span>
                  <span style={{ color: MUTED, fontSize: 10 }}>Mục tiêu: {targetWeight} kg (Cần giảm –{Math.max(0, Number(currentWeight) - Number(targetWeight))} kg)</span>
                </div>
              </div>
              <NInput label="Chiều cao" value={height} onChange={setHeight} unit="cm" type="number" />
              <NInput label="Mục tiêu nước hàng ngày" value={waterGoal} onChange={setWaterGoal} unit="ml" type="number" icon={<Droplets size={14} />} neon={BLUE} />
              <div>
                <label style={{ display: 'block', color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 9 }}>Mức độ vận động</label>
                <div className="settings-flex-wrap" style={{ display: 'flex', gap: 6 }}>
                  {['Ít vận động', 'Vận động nhẹ', 'Vừa phải', 'Năng động'].map((l) => {
                    const isActive = activityLevel === l;
                    return (
                      <button 
                        key={l} 
                        onClick={() => setActivityLevel(l)}
                        style={{
                          flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                          background: isActive ? 'rgba(255,92,0,0.14)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isActive ? ORANGE : BORDER}`,
                          color: isActive ? ORANGE : MUTED, fontSize: 10, fontWeight: 700,
                          boxShadow: isActive ? '0 0 8px rgba(255,92,0,0.3)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>

            {/* ── Fixed Schedule ── */}
            <SectionCard title="Lịch cố định" subtitle="AI sẽ tự động khóa các khung giờ này" icon={<Clock size={17} color={BLUE} />} neon={BLUE}>
              
              {/* Lịch học */}
              <div style={{ padding: 18, background: 'rgba(248,113,113,0.05)', borderRadius: 12, marginBottom: 14, border: '1px solid rgba(248,113,113,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F87171', boxShadow: '0 0 6px rgba(248,113,113,0.8)' }} />
                    <span style={{ color: TEXT, fontSize: 13, fontWeight: 700 }}>Lịch học FPTU</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#F87171', fontSize: 10, padding: '3px 8px', background: 'rgba(248,113,113,0.12)', borderRadius: 20, fontWeight: 700 }}>Cố định</span>
                    <button onClick={() => addSlot(setClassSlots, 'morning')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                      <Plus size={10} /> Thêm ca
                    </button>
                  </div>
                </div>
                <label style={{ display: 'block', color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 9 }}>Ngày học trong tuần</label>
                <DaySelector selected={classDays} onToggle={i => toggleDay(classDays, i, setClassDays)} color="#F87171" />
                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Ca học</label>
                  {classSlots.map(slot => (
                    <ShiftSlotRow
                      key={slot.id} slot={slot}
                      onToggleShift={() => toggleShift(slot.id, setClassSlots)}
                      onRemove={() => removeSlot(slot.id, setClassSlots)}
                      onChangeTime={(field, val) => updateSlotTime(slot.id, setClassSlots, field, val)}
                      accentColor="#F87171"
                    />
                  ))}
                </div>
              </div>

              {/* Giờ làm */}
              <div style={{ padding: 18, background: 'rgba(248,113,113,0.05)', borderRadius: 12, marginBottom: 14, border: '1px solid rgba(248,113,113,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F87171', boxShadow: '0 0 6px rgba(248,113,113,0.8)' }} />
                    <span style={{ color: TEXT, fontSize: 13, fontWeight: 700 }}>Giờ làm việc</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#F87171', fontSize: 10, padding: '3px 8px', background: 'rgba(248,113,113,0.12)', borderRadius: 20, fontWeight: 700 }}>Cố định</span>
                    <button onClick={() => addSlot(setWorkSlots, 'afternoon')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                      <Plus size={10} /> Thêm ca
                    </button>
                  </div>
                </div>
                <DaySelector selected={workDays} onToggle={i => toggleDay(workDays, i, setWorkDays)} color="#F87171" />
                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', color: MUTED, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Ca làm</label>
                  {workSlots.map(slot => (
                    <ShiftSlotRow
                      key={slot.id} slot={slot}
                      onToggleShift={() => toggleShift(slot.id, setWorkSlots)}
                      onRemove={() => removeSlot(slot.id, setWorkSlots)}
                      onChangeTime={(field, val) => updateSlotTime(slot.id, setWorkSlots, field, val)}
                      accentColor="#F87171"
                    />
                  ))}
                </div>
              </div>

              {/* Tập luyện */}
              <div style={{ padding: 18, background: 'rgba(255,92,0,0.05)', borderRadius: 12, border: '1px solid rgba(255,92,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE, boxShadow: '0 0 6px rgba(255,92,0,0.8)' }} />
                    <span style={{ color: TEXT, fontSize: 13, fontWeight: 700 }}>Tập luyện & Thể hình</span>
                  </div>
                  <button 
                    onClick={() => {
                      const name = window.prompt('Nhập tên môn tập:');
                      const days = window.prompt('Ngày tập (VD: T3, T7):');
                      const time = window.prompt('Giờ tập (VD: 5:00–7:00 CH):');
                      if (name) setWorkouts(prev => [...prev, { id: Date.now(), name, days: days || '', time: time || '' }]);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,92,0,0.1)', border: '1px solid rgba(255,92,0,0.25)', color: ORANGE, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Plus size={11} /> Thêm
                  </button>
                </div>
                {workouts.map((w, i) => (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < workouts.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                    <div>
                      <div style={{ color: TEXT, fontSize: 12, fontWeight: 600 }}>{w.name}</div>
                      <div style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>{w.days} · {w.time}</div>
                    </div>
                    <button onClick={() => setWorkouts(prev => prev.filter(x => x.id !== w.id))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={13} color={MUTED} />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* ── Notifications ── */}
            <SectionCard title="Cấu hình thông báo" subtitle="Nhắc nhở qua Telegram Bot" icon={<Bell size={17} color={GREEN} />} neon={GREEN}>
              {notifications.map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '13px 0', borderBottom: i < notifications.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <div>
                    <div style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <div onClick={() => toggleNotification(item.id)} style={{ cursor: 'pointer' }}>
                    <NToggle on={item.on} color={item.color} />
                  </div>
                </div>
              ))}
            </SectionCard>

            {/* ── Telegram Bot ── */}
            <SectionCard title="Tích hợp Telegram Bot" subtitle="tamquan bot đang hoạt động" icon={<Bot size={17} color={BLUE} />} neon={BLUE}>
              <div style={{
                padding: 14, borderRadius: 12, marginBottom: 18,
                background: 'rgba(255,92,0,0.06)', border: '1px solid rgba(255,92,0,0.18)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${ORANGE}, #FF3D00)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(255,92,0,0.5)', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                </div>
                <div>
                  <div style={{ color: ORANGE, fontSize: 13, fontWeight: 800 }}>tamquan Bot</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, boxShadow: '0 0 6px rgba(34,197,94,0.8)', animation: 'ledBlink 2s ease-in-out infinite' }} />
                    <span style={{ color: GREEN, fontSize: 11, fontWeight: 600 }}>Đã kết nối · Đồng bộ 2 phút trước</span>
                  </div>
                </div>
              </div>
              <NInput label="Telegram User ID" value={telegramUsername} onChange={setTelegramUsername} type="text" icon={<User size={14} />} neon={BLUE} />
              <NInput label="Bot Token" value={botToken} onChange={setBotToken} type="text" neon={BLUE} />
              <div>
                <label style={{ display: 'block', color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 9 }}>Tính cách AI</label>
                <div className="settings-flex-wrap" style={{ display: 'flex', gap: 8 }}>
                  {['Đanh Đá 🔥', 'Thân Thiện 😊', 'Chuyên Nghiệp 💼'].map((p) => {
                    const isActive = botPersonality === p;
                    return (
                      <button 
                        key={p} 
                        onClick={() => setBotPersonality(p)}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: 9, cursor: 'pointer',
                          background: isActive ? 'rgba(255,92,0,0.14)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isActive ? ORANGE : BORDER}`,
                          color: isActive ? ORANGE : MUTED, fontSize: 11, fontWeight: 700,
                          boxShadow: isActive ? '0 0 10px rgba(255,92,0,0.3)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
