'use client';

import { useState } from 'react';
import {
  BG, CARD, ORANGE, MUTED, BORDER, TEXT,
  PX_PER_H,
  CEvent, getEventsForDay, parseTimeToHours, formatTime,
} from './calendarUtils';
import { Plus } from 'lucide-react';

interface WeekDay {
  short: string;
  date: number;
  fullDate: Date;
  today: boolean;
}

interface Props {
  weekDays: WeekDay[];
  dbSchedules: any[];
  onEventClick?: (ev: CEvent) => void;
}

function parseTimeToDecimal(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  return parseInt(parts[0]) + parseInt(parts[1]) / 60;
}

function getCombinedEvents(date: Date, dbSchedules: any[]): CEvent[] {
  const day = date.getDay(); // 0: CN, 1: T2, etc.
  const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];

  // Lọc lịch cố định của ngày hôm nay từ dbSchedules (lịch lặp lại hàng tuần hoặc theo ngày cụ thể)
  const dbToday = dbSchedules.filter(item => {
    // Nếu ngày nằm trong excluded_dates thì bỏ qua
    if (item.excluded_dates && Array.isArray(item.excluded_dates) && item.excluded_dates.includes(dateStr)) {
      return false;
    }
    // Nếu có specific_date, chỉ hiển thị đúng ngày đó
    if (item.specific_date) {
      const sDate = new Date(item.specific_date);
      return sDate.getFullYear() === date.getFullYear() && 
             sDate.getMonth() === date.getMonth() && 
             sDate.getDate() === date.getDate();
    }

    // Nếu không có specific_date, kiểm tra lặp theo mảng days
    if (Array.isArray(item.days)) {
      const isDayMatch = item.days.includes(day);
      if (!isDayMatch) return false;

      // Logic lọc nâng cao cho lịch học FPTU học kì Summer 2026
      if (item.type === 'class' || item.title.includes('học') || item.title.includes('FPTU')) {
        // 1. Chỉ áp dụng đến hết tháng 7/2026 (sau 31/07/2026 sẽ tự động ẩn)
        const limitDate = new Date(2026, 6, 31, 23, 59, 59); // Lưu ý: Tháng 7 trong JS là index 6
        if (date > limitDate) return false;
      }

      // 2. Nghỉ ngơi cả tuần từ 6/7/2026 đến 12/7/2026 (không render bất kỳ lịch lặp lại nào)
      const startBreak = new Date(2026, 6, 6, 0, 0, 0); // 6 tháng 7
      const endBreak = new Date(2026, 6, 12, 23, 59, 59); // 12 tháng 7
      if (date >= startBreak && date <= endBreak) return false;

      return true;
    }
    return false;
  });

  const mapped: CEvent[] = dbToday.map(item => {
    const shDecimal = parseTimeToDecimal(item.start_time);
    const ehDecimal = parseTimeToDecimal(item.end_time);

    // Format sub-label hiển thị giờ
    const startH = Math.floor(shDecimal);
    const startM = Math.round((shDecimal - startH) * 60);
    const endH = Math.floor(ehDecimal);
    const endM = Math.round((ehDecimal - endH) * 60);

    const formatTimePart = (h: number, m: number) => {
      const suffix = h >= 12 ? 'CH' : 'SA';
      const dispH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const dispM = m === 0 ? '' : `:${m < 10 ? '0' : ''}${m}`;
      return `${dispH}${dispM} ${suffix}`;
    };

    const sub = `${formatTimePart(startH, startM)}–${formatTimePart(endH, endM)}`;

    return {
      id: item.id,
      notes: item.notes,
      originalSchedule: item,
      date_rendered: dateStr,
      title: item.title,
      sub,
      type: item.type === 'workout' ? 'workout' : 'fixed',
      sh: shDecimal,
      eh: ehDecimal,
      col: 0,
      cols: 1,
    };
  });

  // Xử lý trùng lặp cột thông minh (overlapping columns) - Thuật toán chia cluster
  mapped.sort((a, b) => {
    if (a.sh !== b.sh) return a.sh - b.sh;
    return b.eh - a.eh;
  });

  const clusters: typeof mapped[] = [];
  let currentCluster: typeof mapped = [];
  let clusterEnd = 0;

  for (const ev of mapped) {
    if (currentCluster.length === 0) {
      currentCluster.push(ev);
      clusterEnd = ev.eh;
    } else if (ev.sh < clusterEnd) {
      currentCluster.push(ev);
      if (ev.eh > clusterEnd) clusterEnd = ev.eh;
    } else {
      clusters.push(currentCluster);
      currentCluster = [ev];
      clusterEnd = ev.eh;
    }
  }
  if (currentCluster.length > 0) clusters.push(currentCluster);

  for (const cluster of clusters) {
    const columns: typeof mapped[] = [];
    
    for (const ev of cluster) {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const colArr = columns[i];
        const lastEv = colArr[colArr.length - 1];
        if (lastEv.eh <= ev.sh) {
          colArr.push(ev);
          ev.col = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        ev.col = columns.length;
        columns.push([ev]);
      }
    }
    
    const numCols = columns.length;
    for (const ev of cluster) {
      ev.cols = numCols;
    }
  }

  return mapped;
}

export function WeekCalendar({ weekDays, dbSchedules, onEventClick }: Props) {
  // Tính toán dynamic hours
  let minH = 7;
  let maxH = 19;
  
  weekDays.forEach(day => {
    const events = getCombinedEvents(day.fullDate, dbSchedules);
    events.forEach(ev => {
      if (ev.sh < minH) minH = Math.floor(ev.sh);
      if (ev.eh > maxH) maxH = Math.ceil(ev.eh);
    });
  });
  
  const START_H = Math.max(0, minH - 1);
  const END_H = Math.min(24, maxH + 1);
  const HOURS = Array.from({ length: END_H - START_H }, (_, i) => i + START_H);

  const calH = HOURS.length * PX_PER_H;
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div style={{ position: 'relative', flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .week-cal-inner {
          min-width: 600px; /* Force minimum width to prevent squishing on mobile */
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      `}} />
      <div className="week-cal-inner">
        {/* ── Day headers ── */}
        <div style={{ display: 'flex', marginLeft: 52, marginBottom: 0, flexShrink: 0 }}>
          {weekDays.map(d => (
            <div key={d.short} style={{
              flex: 1, textAlign: 'center', paddingBottom: 6,
              borderBottom: `2px solid ${d.today ? ORANGE : BORDER}`,
            }}>
              <div style={{ color: d.today ? ORANGE : MUTED, fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                {d.short}
              </div>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', margin: '4px auto 0',
                backgroundColor: d.today ? ORANGE : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: d.today ? '#fff' : TEXT, fontSize: 12.5, fontWeight: d.today ? 700 : 400 }}>
                  {d.date}
                </span>
              </div>
            </div>
          ))}
        </div>

      {/* ── Time grid ── */}
      <div style={{ position: 'relative', display: 'flex', marginTop: 6 }}>
        {/* Time labels */}
        <div style={{ width: 52, flexShrink: 0 }}>
          {HOURS.map(h => (
            <div key={h} style={{ height: PX_PER_H, display: 'flex', alignItems: 'flex-start', paddingTop: 0 }}>
              <span style={{ color: MUTED, fontSize: 9.5, fontWeight: 500 }}>
                {h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day, di) => {
          const events = getCombinedEvents(day.fullDate, dbSchedules);
          return (
            <div key={day.short} style={{
              flex: 1, position: 'relative', height: calH,
              borderLeft: `1px solid ${BORDER}`,
              backgroundColor: day.today ? 'rgba(255,92,0,0.02)' : 'transparent',
            }}>
              {/* Hour lines */}
              {HOURS.map(h => (
                <div key={h} style={{
                  position: 'absolute', left: 0, right: 0,
                  top: (h - START_H) * PX_PER_H,
                  borderTop: `1px solid ${h === START_H ? 'transparent' : BORDER}`,
                  opacity: 0.5,
                }} />
              ))}

              {/* Events */}
              {events.map((ev, ei) => {
                const top    = (ev.sh - START_H) * PX_PER_H;
                const height = Math.max((ev.eh - ev.sh) * PX_PER_H - 2, 20);
                const col    = ev.col ?? 0;
                const cols   = ev.cols ?? 1;
                const isFixed = ev.type === 'fixed';
                
                // Icon cho từng loại event
                const getIcon = () => {
                  if (ev.type === 'workout') return '🏋️';
                  if (ev.type === 'fixed') return '🎓';
                  return '📅';
                };
                
                // Rút ngắn title thông minh
                const getShortTitle = (title: string) => {
                  if (title.length <= 12) return title;
                  // Giữ từ đầu tiên + viết tắt
                  const words = title.split(' ');
                  if (words.length === 1) return title.substring(0, 10);
                  return words[0] + ' ' + words.slice(1).map(w => w[0]).join('');
                };

                return (
                  <div
                    key={ei}
                    title={`${ev.title}\n${ev.sub || ''}`}
                    style={{
                      position: 'absolute',
                      top: top + 1, height,
                      left:  `${(col / cols) * 100}%`,
                      width: `calc(${(1 / cols) * 100}% - 4px)`,
                      borderRadius: 6,
                      backgroundColor: isFixed ? 'rgba(229,62,62,0.14)' : 'rgba(255,92,0,0.12)',
                      border:          isFixed ? '1px solid rgba(229,62,62,0.4)' : '1px solid rgba(255,92,0,0.45)',
                      padding: '4px 6px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = isFixed ? 'rgba(229,62,62,0.25)' : 'rgba(255,92,0,0.25)';
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.zIndex = '10';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = isFixed ? 'rgba(229,62,62,0.14)' : 'rgba(255,92,0,0.12)';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.zIndex = '1';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => {
                      if (onEventClick) onEventClick(ev);
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      minWidth: 0,
                    }}>
                      <span style={{ fontSize: 9, flexShrink: 0, lineHeight: 1 }}>{getIcon()}</span>
                      <div style={{
                        color: isFixed ? '#F87171' : '#FFA066',
                        fontSize: height < 30 ? 9 : 10,
                        fontWeight: 700,
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        minWidth: 0,
                      }}>
                        {height < 40 ? getShortTitle(ev.title) : ev.title}
                      </div>
                    </div>
                    {height > 35 && ev.sub && (
                      <div style={{
                        color: isFixed ? 'rgba(248,113,113,0.75)' : 'rgba(255,160,102,0.8)',
                        fontSize: 8,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                        lineHeight: 1.2,
                      }}>
                        {ev.sub}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      </div>

      {/* Modal - Coming soon */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: CARD,
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '90%',
              border: `1px solid ${BORDER}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <h3 style={{ color: TEXT, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              Thêm lịch mới 📅
            </h3>
            <p style={{ color: MUTED, fontSize: 13, marginBottom: 20 }}>
              Tính năng này đang được phát triển! Hiện tại bạn có thể thêm lịch bằng cách:
            </p>
            <div style={{ color: TEXT, fontSize: 13, lineHeight: 1.8 }}>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ color: ORANGE }}>💬 Chat với AI:</strong>
                <br />
                <span style={{ color: MUTED, fontSize: 12 }}>
                  "Lên lịch tập gym 6h sáng mai"
                </span>
              </div>
              <div>
                <strong style={{ color: ORANGE }}>📱 Telegram Bot:</strong>
                <br />
                <span style={{ color: MUTED, fontSize: 12 }}>
                  Nhắn tin cho tamquan bot
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '10px',
                borderRadius: 8,
                backgroundColor: ORANGE,
                border: 'none',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
