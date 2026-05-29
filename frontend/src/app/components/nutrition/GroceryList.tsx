'use client';

import { useState } from 'react';
import { ShoppingCart, CheckSquare2, Square, Sparkles } from 'lucide-react';
import { GROCERY, TEXT, GREEN, MUTED, BORDER, ORANGE } from './nutritionUtils';

export function GroceryList() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({ g1: true, g5: true, g7: true });
  
  const onToggle = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ width: 340, minWidth: 340, padding: '20px 20px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <ShoppingCart size={15} color={GREEN} style={{ filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.6))' }} />
        <span style={{ color: TEXT, fontSize: 14, fontWeight: 700 }}>Danh sách đi chợ tuần</span>
      </div>

      {Object.entries(GROCERY).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{
            color: GREEN, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
            marginBottom: 8, padding: '4px 0', borderBottom: '1px solid rgba(34,197,94,0.2)',
          }}>
            {cat}
          </div>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex', flexDirection: 'column',
              borderBottom: `1px solid ${BORDER}`, cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }} onClick={() => onToggle(item.id)}>
                {checkedItems[item.id]
                  ? <CheckSquare2 size={15} color={GREEN} style={{ filter: 'drop-shadow(0 0 3px rgba(34,197,94,0.6))' }} />
                  : <Square size={15} color={MUTED} />
                }
                <span style={{ flex: 1, color: checkedItems[item.id] ? MUTED : TEXT, fontSize: 12, textDecoration: checkedItems[item.id] ? 'line-through' : 'none' }}>
                  {item.name}
                </span>
                <span style={{ color: MUTED, fontSize: 11 }}>{item.qty}</span>
              </div>
              
              {/* AI Preservation Guide (Mock) */}
              {checkedItems[item.id] && (
                <div style={{
                  margin: '0 0 10px 25px', padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,92,0,0.08)', border: '1px solid rgba(255,92,0,0.15)',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{ color: ORANGE, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Sparkles size={10} /> AI Khuyên dùng
                  </div>
                  <div style={{ color: TEXT, fontSize: 11, lineHeight: 1.5 }}>
                    {item.tip || 'Bảo quản ngăn mát tủ lạnh, dùng trong 3-5 ngày để đảm bảo giữ nguyên hàm lượng dinh dưỡng cao nhất.'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
