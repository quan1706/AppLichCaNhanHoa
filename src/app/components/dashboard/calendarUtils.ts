// ─── Design Tokens ───────────────────────────────────────────────────────────
export const BG     = '#121212';
export const CARD   = '#1E1E1E';
export const CARD2  = '#252525';
export const ORANGE = '#FF5C00';
export const RED    = '#E53E3E';
export const MUTED  = '#7A7A7A';
export const BORDER = '#2A2A2A';
export const TEXT   = '#FFFFFF';
export const GREEN  = '#22C55E';

// ─── Calendar Constants ───────────────────────────────────────────────────────
export const PX_PER_H = 38; // pixels per hour
// Thay vì fix cứng START_H và HOURS, chúng ta sẽ tính toán động trong component
// export const START_H  = 6;  
// export const HOURS    = Array.from({ length: 16 }, (_, i) => i + START_H); 

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CEvent {
  id?: any;
  notes?: string;
  originalSchedule?: any;
  date_rendered?: string;
  title: string;
  sub?: string;
  type: 'fixed' | 'workout';
  sh: number;
  eh: number;
  col?: number;
  cols?: number;
}

export interface DbDeadline {
  id?: number;
  title: string;
  due_date: string;
  status: string;
}

export interface AiLog {
  time: string;
  action: string;
  details: string;
  status: 'success' | 'error' | 'info' | 'warning';
}

// ─── Weekly fixed schedule events (repeats every week) ───────────────────────
export function getEventsForDay(date: Date): CEvent[] {
  const day  = date.getDay();
  const events: CEvent[] = [];

  // Mon (1), Wed (3), Fri (5) — FPTU + Work overlap
  if (day === 1 || day === 3 || day === 5) {
    events.push({ title: 'Lịch học FPTU', sub: '7:00–11:00 SA', type: 'fixed', sh: 7,  eh: 11, col: 0, cols: 2 });
    events.push({ title: 'Làm việc',       sub: '8:00 SA–5:00 CH', type: 'fixed', sh: 8,  eh: 17, col: 1, cols: 2 });
  }
  // Tue (2), Thu (4) — Work only
  if (day === 2 || day === 4) {
    events.push({ title: 'Làm việc', sub: '8:00 SA–5:00 CH', type: 'fixed', sh: 8, eh: 17, col: 0, cols: 2 });
  }

  // Workout schedule
  if (day === 1) events.push({ title: 'Chạy bộ tối',      sub: '6:00–7:00 CH',  type: 'workout', sh: 18,   eh: 19, col: 0, cols: 1 });
  if (day === 2) events.push({ title: 'Tập Pickleball 🏓', sub: '5:00–7:00 CH',  type: 'workout', sh: 17,   eh: 19, col: 0, cols: 1 });
  if (day === 3) events.push({ title: 'Tập Gym 🏋️',        sub: '5:30–7:00 CH',  type: 'workout', sh: 17.5, eh: 19, col: 1, cols: 2 });
  if (day === 5) events.push({ title: 'Chạy bộ tối',      sub: '6:00–7:00 CH',  type: 'workout', sh: 18,   eh: 19, col: 0, cols: 1 });
  if (day === 6) {
    events.push({ title: 'Chạy bộ sáng',      sub: '6:00–7:30 SA', type: 'workout', sh: 6,  eh: 7.5, col: 0, cols: 1 });
    events.push({ title: 'Tập Pickleball 🏓', sub: '3:00–5:00 CH', type: 'workout', sh: 15, eh: 17,  col: 0, cols: 1 });
  }

  return events;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function parseTimeToHours(isoString: string): number {
  const d = new Date(isoString);
  return d.getHours() + d.getMinutes() / 60;
}

export function formatTime(h: number, m: number): string {
  const suffix = h >= 12 ? 'CH' : 'SA';
  const dispH  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const dispM  = m === 0 ? '' : `:${m < 10 ? '0' : ''}${m}`;
  return `${dispH}${dispM} ${suffix}`;
}
