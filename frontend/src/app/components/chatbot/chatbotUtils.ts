'use client';

export const BG     = '#080808';
export const CARD   = '#111111';
export const ORANGE = '#FF5C00';
export const MUTED  = '#5A5A5A';
export const BORDER = 'rgba(255,255,255,0.06)';
export const TEXT   = '#FFFFFF';

export interface Message {
  id: string;
  from: 'bot' | 'user';
  text: string;
  time: string;
  hasActions?: boolean;
}

export const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', from: 'bot',  text: 'Đến giờ nạp 500ml nước rồi anh Quân ơi! 💧 Giảm từ 92kg chứ có phải giữ cân đâu mà lười! Bấm xác nhận trong 10 phút không thôi tamquan spam liên tục đó!', time: '14:03', hasActions: true },
  { id: 'm2', from: 'user', text: 'Thứ 7 tuần sau có lịch đi sinh nhật Đạt', time: '14:07' },
  { id: 'm3', from: 'bot',  text: '✅ Đã ghi nhận! Đã khóa lịch 06/06/2026 rồi. Hôm đó ăn tiệc thì tém lại nhé — limit 1 miếng bánh kem thôi, anh nghe chưa? 😂', time: '14:07' },
];

export const QUICK_CHIPS = ['📊 Báo cáo hôm nay', '💧 Lịch uống nước', '🥗 Thực đơn tối nay', '⚡ Deadline khẩn'];
