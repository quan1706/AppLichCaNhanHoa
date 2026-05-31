'use client';

import { useState } from 'react';
import { Plus, Search, MessageCircle, X } from 'lucide-react';
import { CARD, ORANGE, MUTED, BORDER, TEXT } from './calendarUtils';

interface Props {
  viewMode: 'week' | 'month' | 'year';
  setViewMode: (mode: 'week' | 'month' | 'year') => void;
  onAddSchedule?: () => void;
  aiChatOpen: boolean;
  onToggleAiChat: () => void;
  targetWeight?: number | string;
  searchQuery?: string;
  setSearchQuery?: (v: string) => void;
}

export function DashboardToolbar({
  viewMode,
  setViewMode,
  onAddSchedule,
  aiChatOpen,
  onToggleAiChat,
  targetWeight = '78',
  searchQuery = '',
  setSearchQuery = () => {},
}: Props) {

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-toolbar {
          padding: 12px 24px;
          background: rgba(20, 20, 20, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-shrink: 0;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-logo {
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 850;
          letter-spacing: -0.5px;
          margin: 0;
          text-transform: uppercase;
          user-select: none;
        }

        .premium-logo span {
          background: linear-gradient(135deg, #FF7A00 0%, #FF3D00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
          filter: drop-shadow(0 0 8px rgba(255, 92, 0, 0.3));
        }

        .premium-badge {
          padding: 4px 12px;
          background: linear-gradient(135deg, rgba(255, 92, 0, 0.15) 0%, rgba(255, 92, 0, 0.04) 100%);
          border: 1px solid rgba(255, 92, 0, 0.25);
          border-radius: 20px;
          color: #FFA066;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.2px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 10px rgba(255, 92, 0, 0.1);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .premium-search-wrapper {
          flex: 1;
          max-width: 400px;
          position: relative;
        }

        .premium-search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: #FFFFFF;
          font-size: 12px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-search-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .premium-search-input:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .premium-search-input:focus {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 92, 0, 0.6);
          box-shadow: 0 0 15px rgba(255, 92, 0, 0.2);
        }

        .premium-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .premium-btn-add {
          padding: 8px 16px;
          border-radius: 10px;
          background: linear-gradient(135deg, #FF7A00 0%, #FF4D00 100%);
          border: none;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(255, 92, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .premium-btn-add:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(255, 92, 0, 0.35);
          filter: brightness(1.08);
        }

        .premium-btn-add:active {
          transform: translateY(1px);
          box-shadow: 0 2px 8px rgba(255, 92, 0, 0.15);
        }

        .premium-tabs {
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(0, 0, 0, 0.25);
          padding: 4px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .premium-tab-btn {
          padding: 6px 14px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: rgba(255, 255, 255, 0.45);
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-tab-btn:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        .premium-tab-btn.active {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .premium-btn-ai {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .premium-btn-ai.inactive {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.5);
        }

        .premium-btn-ai.inactive:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
          transform: translateY(-1px);
        }

        .premium-btn-ai.active {
          background: linear-gradient(135deg, rgba(255, 92, 0, 0.2) 0%, rgba(255, 61, 0, 0.1) 100%);
          border: 1px solid rgba(255, 92, 0, 0.5);
          color: #FF5C00;
          box-shadow: 0 0 15px rgba(255, 92, 0, 0.25);
          animation: premium-glow 2s infinite alternate;
        }

        .premium-btn-ai.active:hover {
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 0 20px rgba(255, 92, 0, 0.35);
        }

        @keyframes premium-glow {
          0% {
            box-shadow: 0 0 8px rgba(255, 92, 0, 0.15);
          }
          100% {
            box-shadow: 0 0 18px rgba(255, 92, 0, 0.35);
          }
        }
      `}} />

      <div className="premium-toolbar">
        {/* Left: Title & Target Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="premium-logo">
            DASHBOARD <span>KỶ LUẬT</span>
          </h1>
          <div className="premium-badge">
            Mục tiêu: {targetWeight}kg
          </div>
        </div>

        {/* Center: Sleek Search Bar */}
        <div className="premium-search-wrapper">
          <Search
            size={14}
            color={MUTED}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              opacity: 0.6
            }}
          />
          <input
            type="text"
            className="premium-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm lịch... (sinh nhật, deadline, tập gym...)"
          />
        </div>

        {/* Right: Premium Dynamic Actions */}
        <div className="premium-actions">
          {/* Add schedule button */}
          {onAddSchedule && (
            <button className="premium-btn-add" onClick={onAddSchedule}>
              <Plus size={14} strokeWidth={2.5} />
              Thêm lịch
            </button>
          )}

          {/* View mode switcher tabs */}
          <div className="premium-tabs">
            {(['week', 'month', 'year'] as const).map((id, i) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={`premium-tab-btn ${viewMode === id ? 'active' : ''}`}
              >
                {['Tuần', 'Tháng', 'Năm'][i]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
