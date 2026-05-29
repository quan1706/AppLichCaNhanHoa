'use client';

import { useState } from 'react';
import { Sparkles, Utensils } from 'lucide-react';
import { BG, GREEN, TEXT, MUTED, ORANGE, BORDER, GLASS } from './nutritionUtils';
import { DonutRing } from './DonutRing';
import { MealPlan } from './MealPlan';
import { GroceryList } from './GroceryList';
import { NutritionChat } from './NutritionChat';

export function Screen3Nutrition({ onChangeTab }: { onChangeTab?: (tab: any) => void }) {
  // Mock state to force re-render when AI updates
  const [updateKey, setUpdateKey] = useState(0);

  const handleUpdatePlan = () => {
    // In a real app, this would update the global state or refetch data
    setUpdateKey(p => p + 1);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', backgroundColor: BG, overflow: 'hidden', fontFamily: 'Inter,sans-serif' }}>
      
      {/* ── Left Sidebar: AI Agent ── */}
      <NutritionChat onUpdatePlan={handleUpdatePlan} />

      {/* ── Right Content: The Plan ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 28px', flexShrink: 0, background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: GREEN, boxShadow: `0 0 10px rgba(34,197,94,0.8)` }} />
              <span style={{ color: TEXT, fontSize: 20, fontWeight: 800 }}>Dinh dưỡng & Kỷ luật</span>
              <span style={{ padding: '4px 10px', background: 'rgba(34,197,94,0.1)', color: GREEN, fontSize: 10, fontWeight: 700, borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)' }}>
                Tự động hóa bởi AI
              </span>
            </div>
            <div style={{ color: MUTED, fontSize: 12, marginTop: 4, paddingLeft: 14 }}>
              Tuần 25–31/05 · Mục tiêu 1,600 kcal/ngày · Đạm 110–138g
            </div>
          </div>
          <div style={{
            padding: '8px 16px', borderRadius: 12, border: `1px solid rgba(34,197,94,0.2)`,
            background: 'rgba(34,197,94,0.05)', color: GREEN, fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 20px rgba(34,197,94,0.1)'
          }}>
            <Utensils size={14} /> Tiến độ: –0.6kg tuần này
          </div>
        </div>

        {/* Scrollable body */}
        <div key={updateKey} style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          


          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
            <MealPlan />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <GroceryList />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
