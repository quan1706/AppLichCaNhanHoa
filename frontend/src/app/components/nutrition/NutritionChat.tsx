'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { BG, ORANGE, TEXT, MUTED, BORDER, GREEN } from './nutritionUtils';

interface ChatMessage {
  id: string;
  from: 'ai' | 'user';
  text: string;
  isUpdating?: boolean;
}

export function NutritionChat({ onUpdatePlan }: { onUpdatePlan: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', from: 'ai', text: 'Chào anh Quân! Mục tiêu hôm nay là 1600 kcal và 138g Đạm. Anh muốn ăn gì hôm nay để tôi lên thực đơn và đi chợ luôn?' }
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(p => [...p, { id: Date.now().toString(), from: 'user', text: userMsg }]);
    setInput('');
    setTyping(true);

    // Giả lập AI suy nghĩ và sinh thực đơn
    setTimeout(() => {
      setTyping(false);
      setMessages(p => [...p, { 
        id: Date.now().toString() + '_ai', 
        from: 'ai', 
        text: 'Đã rõ! Tôi đã thiết kế lại thực đơn hôm nay có bún bò cho bữa trưa (chỉ ăn thịt, ít bún, nước dùng trong) và điều chỉnh lại calo bữa tối để bù trừ. Đã cập nhật luôn vào Danh sách đi chợ! Anh xem bên phải nhé. ✨',
        isUpdating: true 
      }]);
      onUpdatePlan(); // Trigger UI update in parent
    }, 2000);
  };

  if (!isOpen) {
    return (
      <div style={{
        width: 60, height: '100%', borderRight: `1px solid ${BORDER}`,
        background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0',
        transition: 'width 0.3s ease', flexShrink: 0,
      }}>
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${BORDER}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: TEXT, transition: 'all 0.2s', marginBottom: 20
          }}
        >
          <ChevronRight size={20} />
        </button>
        
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `linear-gradient(135deg, ${GREEN}, #16A34A)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 16px rgba(34,197,94,0.4)`
        }}>
          <MessageSquare size={18} color="#fff" />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: 380, height: '100%', borderRight: `1px solid ${BORDER}`,
      background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(16px)',
      display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease',
      flexShrink: 0
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${GREEN}, #16A34A)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px rgba(34,197,94,0.4)`
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <div style={{ color: TEXT, fontSize: 14, fontWeight: 800 }}>Nutrition Agent</div>
            <div style={{ color: GREEN, fontSize: 11, fontWeight: 600, marginTop: 2 }}>Trực tuyến · Sẵn sàng lên đơn</div>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 6 }}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.from === 'ai' && (
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, marginTop: 2 }}>
                <Sparkles size={12} color="#fff" />
              </div>
            )}
            <div style={{
              maxWidth: '80%', padding: '12px 14px',
              borderRadius: m.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.from === 'user' ? `linear-gradient(135deg, ${GREEN}, #16A34A)` : 'rgba(30,30,30,0.8)',
              color: '#fff', fontSize: 13, lineHeight: 1.5,
              border: m.from === 'ai' ? `1px solid ${BORDER}` : 'none',
              boxShadow: m.from === 'user' ? '0 4px 12px rgba(34,197,94,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              {m.text}
              {m.isUpdating && (
                <div style={{ marginTop: 10, padding: '6px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                   <CheckIcon /> Đã cập nhật Thực đơn & Đi chợ
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <div style={{ width: 24, height: 24, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
               <Sparkles size={12} color="#fff" />
             </div>
             <div style={{ padding: '12px 16px', borderRadius: '12px 12px 12px 2px', background: 'rgba(30,30,30,0.8)', display: 'flex', gap: 4 }}>
               <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'dotBounce 0.6s infinite alternate' }} />
               <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'dotBounce 0.6s 0.2s infinite alternate' }} />
               <div style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, animation: 'dotBounce 0.6s 0.4s infinite alternate' }} />
             </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px', borderTop: `1px solid ${BORDER}`, background: 'rgba(10,10,10,0.95)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)',
          borderRadius: 20, padding: '4px 4px 4px 16px', border: `1px solid ${BORDER}`,
          transition: 'border-color 0.2s',
        }}>
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ví dụ: Đổi bữa trưa thành bún bò..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: TEXT, fontSize: 13 }}
          />
          <button onClick={handleSend} style={{
            width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: input.trim() ? GREEN : 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
          }}>
            <Send size={15} color={input.trim() ? '#fff' : MUTED} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
