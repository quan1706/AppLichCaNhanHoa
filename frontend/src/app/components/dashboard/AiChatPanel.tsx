'use client';

import { Send, X, Sparkles } from 'lucide-react';
import { CARD, ORANGE, MUTED, BORDER, TEXT, BG } from './calendarUtils';

import { ChatMessage } from './index';

interface Props {
  isOpen: boolean;
  aiPrompt: string;
  setAiPrompt: (val: string) => void;
  isSendingAi: boolean;
  onSendAi: () => void;
  chatHistory: ChatMessage[];
  onConfirmAction: (action: string, payload: any) => void;
}

export function AiChatPanel({
  isOpen,
  aiPrompt,
  setAiPrompt,
  isSendingAi,
  onSendAi,
  chatHistory,
  onConfirmAction
}: Props) {
  return (
    <div
      style={{
        width: isOpen ? 320 : 0,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        borderRight: isOpen ? `1px solid ${BORDER}` : 'none',
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: `1px solid ${BORDER}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} color={ORANGE} />
            <h3 style={{ color: TEXT, fontSize: 14, fontWeight: 700, margin: 0, flex: 1 }}>
              Chat AI tamquan
            </h3>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Chat History or Examples */}
            {chatHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatHistory.map((msg, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: 4
                  }}>
                    <div style={{
                      backgroundColor: msg.role === 'user' ? ORANGE : 'rgba(255,255,255,0.05)',
                      color: msg.role === 'user' ? '#fff' : TEXT,
                      padding: '10px 14px',
                      borderRadius: 16,
                      borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                      borderBottomLeftRadius: msg.role === 'ai' ? 4 : 16,
                      fontSize: 13,
                      maxWidth: '90%',
                      lineHeight: 1.4
                    }}>
                      {msg.text}
                      
                      {/* Confirmation UI */}
                      {(msg.action === 'confirm_add' || msg.action === 'confirm_delete') && msg.payload && (
                        <div style={{
                          marginTop: 12,
                          padding: 10,
                          backgroundColor: 'rgba(0,0,0,0.2)',
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`
                        }}>
                          <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, fontWeight: 600 }}>
                            {msg.action === 'confirm_add' ? '✨ XÁC NHẬN THÊM LỊCH' : '🗑️ XÁC NHẬN XÓA LỊCH'}
                          </div>
                          <div style={{ fontSize: 12, marginBottom: 4 }}>
                            <strong>Tên:</strong> {msg.payload.title}
                          </div>
                          <div style={{ fontSize: 12, marginBottom: 8 }}>
                            <strong>Giờ:</strong> {msg.payload.start_time} - {msg.payload.end_time}
                          </div>
                          {msg.payload.specific_date && (
                            <div style={{ fontSize: 12, marginBottom: 8, color: '#4ADE80' }}>
                              <strong>Ngày:</strong> {msg.payload.specific_date}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => onConfirmAction(msg.action!, msg.payload)}
                              style={{
                                flex: 1,
                                padding: '6px',
                                backgroundColor: ORANGE,
                                border: 'none',
                                borderRadius: 6,
                                color: '#fff',
                                fontSize: 11,
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              Đồng ý
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div
                  style={{
                    color: MUTED,
                    fontSize: 10,
                    fontWeight: 600,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Gợi ý lệnh:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { icon: '🗓️', text: 'Lệnh [ thêm lịch chạy bộ ngày 2 và 4 tháng 6 từ 17h đến 19h ]' },
                    { icon: '🗑️', text: 'Lệnh [ xóa lịch tập kháng lực ngày mai ]' },
                    { icon: '💦', text: 'Lên lịch Cardio sáng mai nhé tamquan' },
                  ].map((example, idx) => (
                    <div
                      key={idx}
                      onClick={() => setAiPrompt(example.text)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${BORDER}`,
                        color: TEXT,
                        fontSize: 11,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,92,0,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255,92,0,0.3)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = BORDER;
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{example.icon}</span>
                      <span style={{ fontSize: 11 }}>{example.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
 
            {/* Info */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(255,92,0,0.05)',
                border: '1px solid rgba(255,92,0,0.2)',
              }}
            >
              <p style={{ color: '#FFA066', fontSize: 11, lineHeight: 1.5, margin: 0 }}>
                💡 Trò chuyện với Fitness Agent để xếp lịch tập Cardio/Kháng lực/Hít xà/Chạy bộ thông minh và tự động tập bù calo nhậu nhẹt.
              </p>
            </div>
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: 12,
              borderTop: `1px solid ${BORDER}`,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSendAi();
                  }
                }}
                placeholder="Nhập lệnh..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${BORDER}`,
                  color: TEXT,
                  fontSize: 12,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,92,0,0.5)')}
                onBlur={e => (e.target.style.borderColor = BORDER)}
              />
              <button
                onClick={onSendAi}
                disabled={isSendingAi || !aiPrompt.trim()}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 6,
                  backgroundColor: ORANGE,
                  border: 'none',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: isSendingAi || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
                  opacity: isSendingAi || !aiPrompt.trim() ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <Send size={12} />
                {isSendingAi ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
