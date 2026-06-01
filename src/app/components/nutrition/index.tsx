import { useState, useEffect } from 'react';
import { Utensils, ChevronLeft, Sparkles, ChevronRight } from 'lucide-react';
import { BG, GREEN, TEXT, MUTED, BORDER } from './nutritionUtils';
import { MealPlan } from './MealPlan';
import { GroceryList } from './GroceryList';
import { NutritionChat } from './NutritionChat';
import { supabase, QUAN_UUID } from '../../lib/supabaseClient';
import { toast } from 'sonner';

export function Screen3Nutrition({ onChangeTab }: { onChangeTab?: (tab: any) => void }) {
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [groceries, setGroceries] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [spent, setSpent] = useState(380000); // SV budget
  const [showAiChat, setShowAiChat] = useState(false);

  const fetchNutritionData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch meal plans from database
      const { data: plans, error: plansError } = await supabase
        .from('ai_fitness_plan')
        .select('*')
        .order('date', { ascending: true });

      if (plansError) throw plansError;
      setMealPlans(plans || []);

      // 2. Fetch groceries from database
      const { data: items, error: itemsError } = await supabase
        .from('groceries')
        .select('*')
        .eq('profile_id', QUAN_UUID);

      if (itemsError) throw itemsError;
      setGroceries(items || []);

      // 3. Fetch profile from database to get dynamic weight, height, age, activity level
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', QUAN_UUID)
        .single();

      if (!profError && prof) {
        setProfile(prof);
      }

    } catch (err: any) {
      console.error('Lỗi fetch dinh dưỡng chi tiết:', err?.message || err?.code || JSON.stringify(err) || err, err);
      toast.error('Lỗi đồng bộ dữ liệu dinh dưỡng từ database! 💅');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionData();
  }, []);

  const handleToggleGrocery = async (itemId: string, currentStatus: boolean) => {
    // 1. Optimistic UI Update
    const oldGroceries = [...groceries];
    setGroceries(prev => prev.map(g => g.id === itemId ? { ...g, is_bought: !currentStatus } : g));

    try {
      const { error } = await supabase
        .from('groceries')
        .update({ is_bought: !currentStatus })
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Đã cập nhật trạng thái mua sắm! 🛒');
    } catch (err) {
      console.error('Lỗi toggle grocery:', err);
      toast.error('Không thể đồng bộ trạng thái đi chợ. Đã hoàn tác! 💅');
      // Rollback UI
      setGroceries(oldGroceries);
    }
  };

  // Dynamic header metrics computation based on profile data
  let headerSubtitle = 'Đang tính toán chỉ số thể chất... 💅';
  if (profile) {
    const weight = Number(profile.current_weight) || 92;
    const height = Number(profile.height) || 172;
    const age = Number(profile.age) || 22;
    const act = profile.activity_level || 'Vừa phải';
    
    // BMR (Mifflin-St Jeor)
    const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    
    // Activity Factor
    let factor = 1.375;
    if (act === 'Ít hoạt động') factor = 1.2;
    else if (act === 'Nhẹ nhàng') factor = 1.375;
    else if (act === 'Vừa phải') factor = 1.55;
    else if (act === 'Năng động') factor = 1.725;
    
    const tdee = Math.round(bmr * factor);
    const deficitCal = Math.round(Math.max(tdee - 500, bmr, 1500));
    const minProtein = Math.round(weight * 1.2);
    const maxProtein = Math.round(weight * 1.5);

    if (mealPlans && mealPlans.length > 0) {
      const avgKcal = 1600; // Tiêu chuẩn
      const avgProtein = 138; // Tiêu chuẩn
      headerSubtitle = `Thể trạng: ${weight}kg · TDEE: ${tdee} kcal · Thực đơn hiện tại: ~${avgKcal} kcal/ngày · Đạm: ~${avgProtein}g/ngày`;
    } else {
      headerSubtitle = `Thể trạng: ${weight}kg (BMR: ${bmr} kcal · TDEE: ${tdee} kcal) · Mục tiêu thâm hụt: ${deficitCal} kcal & ${minProtein}-${maxProtein}g Đạm`;
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', backgroundColor: BG, overflow: 'hidden', fontFamily: 'Inter,sans-serif', position: 'relative' }}>
      
      {/* ── Left Sidebar: AI Agent ── */}
      <NutritionChat isOpen={showAiChat} onClose={() => setShowAiChat(false)} onUpdatePlan={fetchNutritionData} />

      {/* ── Docked AI Chat Assistant Toggle Handle ── */}
      <button
        onClick={() => setShowAiChat(prev => !prev)}
        className={`premium-dock-handle-green ${showAiChat ? 'active' : ''}`}
        title={showAiChat ? 'Đóng trợ lý AI Dinh dưỡng' : 'Mở trợ lý AI Dinh dưỡng'}
      >
        <Sparkles size={20} color="#22C55E" style={{ filter: 'drop-shadow(0 0 4px rgba(34,197,94,0.4))' }} />
      </button>

      {/* ── Right Content: The Plan ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div className="nutrition-header" style={{
          padding: '20px 28px', flexShrink: 0, background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div className="header-title-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 4, height: 20, borderRadius: 2, background: GREEN, boxShadow: `0 0 10px rgba(34,197,94,0.8)` }} />
              <span style={{ color: TEXT, fontSize: 20, fontWeight: 800 }}>Dinh dưỡng & Kỷ luật</span>
              <span style={{ padding: '4px 10px', background: 'rgba(34,197,94,0.1)', color: GREEN, fontSize: 10, fontWeight: 700, borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)' }}>
                Tự động hóa bởi AI
              </span>
            </div>
            <div style={{ color: MUTED, fontSize: 12, marginTop: 4, paddingLeft: 14 }}>
              {headerSubtitle}
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
        <div className="nutrition-scroll-body" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', position: 'relative' }}>
          
          {isLoading ? (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,8,8,0.7)', zIndex: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div className="premium-spinner" style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: GREEN, animation: 'spin 1s linear infinite' }} />
                <span style={{ color: MUTED, fontSize: 13, fontWeight: 600 }}>tamquan đang tải dữ liệu dinh dưỡng... 💅</span>
              </div>
            </div>
          ) : null}

          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 768px) {
              .nutrition-grid {
                grid-template-columns: 1fr !important;
              }
              .nutrition-header {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 16px !important;
                padding: 20px 16px !important;
              }
              .nutrition-scroll-body {
                padding: 16px 16px !important;
              }
              .header-title-row {
                flex-wrap: wrap !important;
              }
            }
          `}} />
          <div className="nutrition-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
            <MealPlan mealPlans={mealPlans} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <GroceryList groceries={groceries} onToggleGrocery={handleToggleGrocery} />
            </div>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .premium-dock-handle-green {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.2));
          backdrop-filter: blur(12px);
          border: 1px solid rgba(34, 197, 94, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 999;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.15);
        }

        .premium-dock-handle-green:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(34, 197, 94, 0.25);
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.3));
        }

        .premium-dock-handle-green:active {
          transform: scale(0.95);
        }
        
        @media (max-width: 768px) {
          .premium-dock-handle-green {
            bottom: 90px;
            right: 20px;
            width: 50px;
            height: 50px;
          }
        }
        
        /* Hide toggle button when chat is open on mobile to avoid overlap */
        @media (max-width: 768px) {
          .premium-dock-handle-green.active {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
