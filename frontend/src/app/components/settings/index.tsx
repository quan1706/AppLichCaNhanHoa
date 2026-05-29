'use client';

import { useState } from 'react';
import { Save, User, Droplets, Scale, Clock, Plus, Trash2, Bell, Bot, CheckCircle2 } from 'lucide-react';
import { BG, PURPLE, TEXT, MUTED, ORANGE, GREEN, BLUE, BORDER } from './settingsUtils';
import { NInput, NToggle, DaySelector, SectionCard } from './SettingsUI';

export function Screen4Settings({ onChangeTab }: { onChangeTab?: (tab: any) => void }) {
  const [classDays, setClassDays] = useState([0, 2, 4]);
  const [workDays, setWorkDays] = useState([0, 1, 2, 3, 4]);
  const [saved, setSaved] = useState(false);

  // Each schedule can have multiple time slots with shift label
  const [classSlots, setClassSlots] = useState([
    { id: 1, shift: 'morning' as 'morning' | 'afternoon', start: '07:00', end: '11:00' },
  ]);
  const [workSlots, setWorkSlots] = useState([
    { id: 1, shift: 'morning' as 'morning' | 'afternoon', start: '08:00', end: '12:00' },
    { id: 2, shift: 'afternoon' as 'morning' | 'afternoon', start: '13:00', end: '17:00' },
  ]);

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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const ShiftSlotRow = ({ slot, onToggleShift, onRemove, accentColor }: {
    slot: { id: number; shift: 'morning' | 'afternoon'; start: string; end: string };
    onToggleShift: () => void;
    onRemove: () => void;
    accentColor: string;
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
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
        <input type="time" defaultValue={slot.start} style={{
          flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 8, color: TEXT, fontSize: 12, padding: '7px 10px', outline: 'none',
        }} />
        <span style={{ color: MUTED, fontSize: 11 }}>–</span>
        <input type="time" defaultValue={slot.end} style={{
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
      
      {/* ── Header ── */}
      <div style={{
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
        <button onClick={handleSave} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: 'none',
          background: saved ? `linear-gradient(135deg, ${GREEN}, #16A34A)` : `linear-gradient(135deg, ${ORANGE}, #FF3D00)`,
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          boxShadow: saved ? '0 0 20px rgba(34,197,94,0.5)' : '0 0 20px rgba(255,92,0,0.4)',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: saved ? 'scale(1.05)' : 'scale(1)',
        }}>
          {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
          {saved ? 'Đã lưu!' : 'Lưu cài đặt'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 1200 }}>

          {/* ── Body Profile ── */}
          <SectionCard title="Hồ sơ cơ thể" subtitle="Dùng để tính toán thâm hụt calo" icon={<User size={17} color={ORANGE} />} neon={ORANGE}>
            <NInput label="Họ và tên" value="Nguyễn Tam Quân" type="text" icon={<User size={14} />} />
            <NInput label="Tuổi" value={22} unit="tuổi" type="number" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <NInput label="Cân nặng hiện tại" value={92} unit="kg" type="number" neon={ORANGE} icon={<Scale size={14} />} />
              <NInput label="Cân nặng mục tiêu" value={78} unit="kg" type="number" />
            </div>
            <div style={{ padding: '14px 16px', background: 'rgba(255,92,0,0.04)', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(255,92,0,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: TEXT, fontSize: 12, fontWeight: 600 }}>Tiến trình giảm cân</span>
                <span style={{ color: GREEN, fontSize: 12, fontWeight: 700 }}>–0.6 kg tuần này 🔥</span>
              </div>
              <div style={{ height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '8%', background: ORANGE, borderRadius: 4, boxShadow: '0 0 8px rgba(255,92,0,0.6)', transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ color: MUTED, fontSize: 10 }}>Bắt đầu: 92 kg</span>
                <span style={{ color: MUTED, fontSize: 10 }}>Mục tiêu: 78 kg (–14 kg)</span>
              </div>
            </div>
            <NInput label="Chiều cao" value={172} unit="cm" type="number" />
            <NInput label="Mục tiêu nước hàng ngày" value={3500} unit="ml" type="number" icon={<Droplets size={14} />} neon={BLUE} />
            <div>
              <label style={{ display: 'block', color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 9 }}>Mức độ vận động</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Ít vận động', 'Vận động nhẹ', 'Vừa phải', 'Năng động'].map((l, i) => (
                  <button key={l} style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                    background: i === 2 ? 'rgba(255,92,0,0.14)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i === 2 ? ORANGE : BORDER}`,
                    color: i === 2 ? ORANGE : MUTED, fontSize: 10, fontWeight: 700,
                    boxShadow: i === 2 ? '0 0 8px rgba(255,92,0,0.3)' : 'none',
                  }}>{l}</button>
                ))}
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
                <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: 'rgba(255,92,0,0.1)', border: '1px solid rgba(255,92,0,0.25)', color: ORANGE, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                  <Plus size={11} /> Thêm
                </button>
              </div>
              {[
                { name: 'Pickleball 🏓', days: 'T3, T7', time: '5:00–7:00 CH' },
                { name: 'Gym / Kháng lực 🏋️', days: 'T5', time: '5:30–7:00 CH' },
                { name: 'Chạy bộ 🏃', days: 'T2, T6', time: '6:00–7:00 CH' },
              ].map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 2 ? `1px solid ${BORDER}` : 'none' }}>
                  <div>
                    <div style={{ color: TEXT, fontSize: 12, fontWeight: 600 }}>{w.name}</div>
                    <div style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>{w.days} · {w.time}</div>
                  </div>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={13} color={MUTED} />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Notifications ── */}
          <SectionCard title="Cấu hình thông báo" subtitle="Nhắc nhở qua Telegram Bot" icon={<Bell size={17} color={GREEN} />} neon={GREEN}>
            {[
              { label: 'Nhắc nhở uống nước',     sub: 'Mỗi 2 tiếng qua Telegram', on: true,  color: BLUE },
              { label: 'Nhắc chuẩn bị đồ ăn',    sub: '7:00 tối CN hàng tuần',    on: true,  color: ORANGE },
              { label: 'Nhắc nhở tập luyện',      sub: '30 phút trước buổi tập',   on: true,  color: GREEN },
              { label: 'Cảnh báo Deadline khẩn',  sub: 'Trước 3 ngày, 1 ngày, 1h', on: true,  color: '#F87171' },
              { label: 'Báo cáo tiến trình tuần', sub: 'CN 9:00 tối hàng tuần',    on: false, color: PURPLE },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 0', borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none',
              }}>
                <div>
                  <div style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{item.sub}</div>
                </div>
                <NToggle on={item.on} color={item.color} />
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
            <NInput label="Telegram User ID" value="@tamquan_dev" type="text" icon={<User size={14} />} neon={BLUE} />
            <NInput label="Bot Token" value="886015xxxx:AAGFxxxxxxxxxxxx" type="password" neon={BLUE} />
            <div>
              <label style={{ display: 'block', color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 9 }}>Tính cách AI</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Đanh Đá 🔥', 'Thân Thiện 😊', 'Chuyên Nghiệp 💼'].map((p, i) => (
                  <button key={p} style={{
                    flex: 1, padding: '10px 0', borderRadius: 9, cursor: 'pointer',
                    background: i === 0 ? 'rgba(255,92,0,0.14)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i === 0 ? ORANGE : BORDER}`,
                    color: i === 0 ? ORANGE : MUTED, fontSize: 11, fontWeight: 700,
                    boxShadow: i === 0 ? '0 0 10px rgba(255,92,0,0.3)' : 'none',
                  }}>{p}</button>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
