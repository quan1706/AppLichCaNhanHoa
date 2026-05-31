'use client';

export const BG     = '#080808';
export const GLASS  = 'rgba(18,18,18,0.6)';
export const GLASS2 = 'rgba(14,14,14,0.8)';
export const BORDER = 'rgba(255,255,255,0.06)';
export const ORANGE = '#FF5C00';
export const GREEN  = '#22C55E';
export const BLUE   = '#60A5FA';
export const PURPLE = '#A78BFA';
export const MUTED  = '#5A5A5A';
export const TEXT   = '#FFFFFF';

export const DAYS_MEALS = [
  { day: 'T2', kcal: 1620, protein: 115, meals: [
    { type: 'S', desc: 'Yến mạch + Shake Protein Whey',    kcal: 380, protein: '32g', color: BLUE },
    { type: 'T', desc: '150g Ức gà + Cơm lứt + Súp lơ',   kcal: 550, protein: '45g', color: ORANGE },
    { type: 'C', desc: 'Cá hồi áp chảo + Khoai lang',      kcal: 490, protein: '38g', color: PURPLE },
  ]},
  { day: 'T3', kcal: 1580, protein: 110, meals: [
    { type: 'S', desc: '3 Lòng trắng trứng + Bánh mì gối', kcal: 350, protein: '28g', color: BLUE },
    { type: 'T', desc: '150g Ức gà + Diêm mạch',           kcal: 520, protein: '42g', color: ORANGE },
    { type: 'C', desc: 'Cá ngừ + Rau củ hấp',              kcal: 410, protein: '40g', color: PURPLE },
  ]},
  { day: 'T4', kcal: 1650, protein: 118, meals: [
    { type: 'S', desc: 'Sữa chua Hy Lạp + Granola',        kcal: 360, protein: '22g', color: BLUE },
    { type: 'T', desc: '150g Ức gà + Cơm lứt + Cải bó xôi', kcal: 545, protein: '44g', color: ORANGE },
    { type: 'C', desc: '120g Thịt bò + Súp lơ',            kcal: 545, protein: '40g', color: PURPLE },
  ]},
  { day: 'T5', kcal: 1590, protein: 112, meals: [
    { type: 'S', desc: 'Yến mạch ngâm + Hạt chia',         kcal: 370, protein: '18g', color: BLUE },
    { type: 'T', desc: '150g Ức gà + Mì Ý + Cà chua',      kcal: 530, protein: '43g', color: ORANGE },
    { type: 'C', desc: 'Cá rô phi nướng + Măng tây',        kcal: 390, protein: '38g', color: PURPLE },
  ]},
  { day: 'T6', kcal: 1610, protein: 116, meals: [
    { type: 'S', desc: 'Pancake Protein + Bơ đậu phộng',   kcal: 400, protein: '30g', color: BLUE },
    { type: 'T', desc: '150g Ức gà + Cơm lứt + Cà rốt',   kcal: 540, protein: '44g', color: ORANGE },
    { type: 'C', desc: 'Cơm rang trứng (ít dầu) + Đậu phụ', kcal: 470, protein: '28g', color: PURPLE },
  ]},
  { day: 'T7', kcal: 1700, protein: 120, meals: [
    { type: 'S', desc: 'Smoothie Bowl (Chuối + Protein)',   kcal: 420, protein: '26g', color: BLUE },
    { type: 'T', desc: '150g Ức gà + Khoai lang + Salad',  kcal: 580, protein: '45g', color: ORANGE },
    { type: 'C', desc: 'Cá hồi áp chảo + Diêm mạch',      kcal: 500, protein: '40g', color: PURPLE },
  ]},
  { day: 'CN', kcal: 1500, protein: 98, meals: [
    { type: 'S', desc: '3 Trứng luộc + Cà phê đen',        kcal: 280, protein: '22g', color: BLUE },
    { type: 'T', desc: 'Salad ức gà + Sốt dầu olive',      kcal: 420, protein: '35g', color: ORANGE },
    { type: 'C', desc: 'Súp rau củ + Bánh mì nguyên cám',  kcal: 360, protein: '18g', color: PURPLE },
  ]},
];

export interface GroceryItem { id: string; name: string; qty: string; tip?: string; }

export const GROCERY: Record<string, GroceryItem[]> = {
  'Thịt & Cá': [
    { id: 'g1', name: 'Ức gà', qty: '2.5 kg', tip: 'Chia 150g/túi → cấp đông. Rã đông qua đêm. Giữ 5 ngày.' },
    { id: 'g2', name: 'Phi lê cá hồi', qty: '600g', tip: 'Ăn tươi max 2 ngày. Hút chân không cấp đông.' },
    { id: 'g3', name: 'Thịt thăn bò', qty: '400g' },
    { id: 'g4', name: 'Cá rô phi', qty: '400g' },
    { id: 'g5', name: 'Cá ngừ hộp', qty: '4 hộp' },
  ],
  'Rau củ': [
    { id: 'g6', name: 'Súp lơ', qty: '800g' },
    { id: 'g7', name: 'Cải bó xôi', qty: '500g' },
    { id: 'g8', name: 'Dưa chuột', qty: '4 quả' },
    { id: 'g9', name: 'Khoai lang', qty: '1 kg' },
  ],
  'Tinh bột': [
    { id: 'g12', name: 'Gạo lứt', qty: '2 kg' },
    { id: 'g13', name: 'Yến mạch', qty: '1 kg' },
    { id: 'g14', name: 'Diêm mạch', qty: '500g' },
  ],
  'Đạm & Khác': [
    { id: 'g16', name: 'Whey Protein', qty: '1 túi' },
    { id: 'g17', name: 'Sữa chua Hy Lạp', qty: '500g' },
    { id: 'g18', name: 'Trứng gà', qty: '2 chục' },
  ],
};

export const SPENT = 620000;
export const BUDGET = 850000;
export const SPENT_PCT = (SPENT / BUDGET) * 100;
