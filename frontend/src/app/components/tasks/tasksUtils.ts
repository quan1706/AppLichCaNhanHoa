'use client';

export const BG = '#080808';
export const BLUE = '#60A5FA';
export const MUTED = '#5A5A5A';
export const TEXT = '#FFFFFF';
export const ORANGE = '#FF5C00';
export const GREEN = '#22C55E';
export const CARD = '#111111';
export const BORDER = 'rgba(255,255,255,0.06)';
export const GLASS = 'rgba(18,18,18,0.6)';
export const GLASS2 = 'rgba(14,14,14,0.8)';
export const RED = '#EF4444';

export interface Task {
  id: string;
  code: string;
  name: string;
  course: string;
  due: string;
  daysLeft: number;
  status: 'pending' | 'done';
  link?: string;
  notes?: string;
  starred?: boolean;
}
