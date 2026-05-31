'use client';

import { ShoppingCart, CheckSquare2, Square, Sparkles } from 'lucide-react';
import { TEXT, GREEN, MUTED, BORDER, ORANGE } from './nutritionUtils';

interface Props {
  groceries: any[];
  onToggleGrocery: (itemId: string, currentStatus: boolean) => void;
}

export function GroceryList({ groceries = [], onToggleGrocery }: Props) {
  
  if (!groceries || groceries.length === 0) {
    return (
      <div style={{ width: 340, minWidth: 340, padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: MUTED, fontSize: 13, fontWeight: 600 }}>Chưa có danh sách mua sắm tuần này. 💅</span>
      </div>
    );
  }

  // Group groceries dynamically by category
  const grouped: Record<string, any[]> = {};
  groceries.forEach(item => {
    const cat = item.category || 'Khác';
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    grouped[cat].push(item);
  });

  return (
    <div style={{ width: 340, minWidth: 340, padding: '20px 20px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <ShoppingCart size={15} color={GREEN} style={{ filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.6))' }} />
        <span style={{ color: TEXT, fontSize: 14, fontWeight: 700 }}>Danh sách đi chợ tuần</span>
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }} onClick={() => onToggleGrocery(item.id, item.is_bought)}>
                {item.is_bought
                  ? <CheckSquare2 size={15} color={GREEN} style={{ filter: 'drop-shadow(0 0 3px rgba(34,197,94,0.6))' }} />
                  : <Square size={15} color={MUTED} />
                }
                <span style={{ flex: 1, color: item.is_bought ? MUTED : TEXT, fontSize: 12, textDecoration: item.is_bought ? 'line-through' : 'none' }}>
                  {item.name}
                </span>
                <span style={{ color: MUTED, fontSize: 11 }}>{item.qty}</span>
              </div>
              
              {/* AI Preservation Guide */}
              {item.is_bought && (
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
