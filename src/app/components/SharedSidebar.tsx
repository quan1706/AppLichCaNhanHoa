'use client';

import { useState } from 'react';
import { LayoutDashboard, Calendar, Utensils, Settings, MessageSquare } from 'lucide-react';

type NavTab = 'dashboard' | 'schedule' | 'nutrition' | 'settings';

const NAV: { id: NavTab; icon: typeof LayoutDashboard; label: string; neon: string; glow: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', neon: '#FF5C00', glow: 'rgba(255,92,0,0.35)' },
  { id: 'schedule',  icon: Calendar,        label: 'Lịch trình', neon: '#60A5FA', glow: 'rgba(96,165,250,0.35)' },
  { id: 'nutrition', icon: Utensils,        label: 'Dinh dưỡng', neon: '#22C55E', glow: 'rgba(34,197,94,0.35)' },
  { id: 'settings',  icon: Settings,        label: 'Cài đặt',    neon: '#A78BFA', glow: 'rgba(167,139,250,0.35)' },
];

export function SharedSidebar({
  active,
  onChangeTab,
}: {
  active: NavTab;
  onChangeTab?: (tab: NavTab) => void;
}) {
  const [hoveredId, setHoveredId] = useState<NavTab | null>(null);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-container {
          width: 72px; min-width: 72px; height: 100%;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.04);
          display: flex; flex-direction: column; align-items: center;
          padding-top: 16px; padding-bottom: 20px; gap: 2px;
          position: relative; z-index: 50; flex-shrink: 0;
        }
        .glow-bar {
          position: absolute; right: 0; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(180deg, transparent, rgba(255,92,0,0.3) 40%, rgba(255,92,0,0.1) 70%, transparent);
          pointer-events: none;
        }
        .nav-item-container {
          position: relative; width: 100%; display: flex; justify-content: center; margin-bottom: 2px;
        }
        .active-led {
          position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 0; height: 32px;
          border-radius: 0 3px 3px 0;
          transition: width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s, box-shadow 0.25s;
        }
        .nav-btn {
          width: 48px; height: 48px; border-radius: 14px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          position: relative; overflow: hidden;
        }
        .tooltip-box {
          position: absolute; left: 115%; top: 50%; transform: translateY(-50%);
          background-color: #1A1A1A;
          color: #fff; font-size: 11px; font-weight: 600;
          padding: 5px 10px; border-radius: 8px;
          white-space: nowrap; pointer-events: none;
          z-index: 100;
          animation: fadeSlideIn 0.15s ease;
        }
        .logo-box {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, #FF5C00 0%, #FF8A40 50%, #FF3D00 100%);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px; flex-shrink: 0; cursor: pointer;
          box-shadow: 0 0 20px rgba(255,92,0,0.5), 0 4px 16px rgba(0,0,0,0.5);
          position: relative; overflow: hidden;
          animation: neonPulse 3s ease-in-out infinite;
        }
        
        @media (max-width: 768px) {
          .sidebar-container {
            width: 100%; height: 72px; min-height: 72px;
            flex-direction: row; justify-content: space-around;
            padding: 0 8px; border-right: none;
            border-top: 1px solid rgba(255,255,255,0.08);
          }
          .glow-bar {
            right: 0; left: 0; top: 0; bottom: auto; width: 100%; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,92,0,0.3) 40%, rgba(255,92,0,0.1) 70%, transparent);
          }
          .nav-item-container {
            width: auto; margin-bottom: 0; flex: 1; align-items: center; height: 100%;
          }
          .active-led {
            left: 50%; top: 0; transform: translateX(-50%);
            width: 0; height: 3px;
            border-radius: 0 0 3px 3px;
          }
          .active-led.is-active {
            width: 32px; height: 3px !important;
          }
          .nav-btn {
            width: 100%; height: 100%; border-radius: 0; background: transparent !important; box-shadow: none !important;
          }
          .tooltip-box { display: none; }
          .logo-box, .spacer, .online-dot, .avatar-tq { display: none !important; }
        }
      `}} />
      <div className="sidebar-container">
        {/* Vertical glow bar */}
        <div className="glow-bar" />

        {/* Logo */}
        <div className="logo-box">
          {/* Shimmer */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }} />
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 900, letterSpacing: -1, position: 'relative' }}>T</span>
        </div>

        {/* Nav items */}
        {NAV.map(({ id, icon: Icon, label, neon, glow }) => {
          const isActive  = active === id;
          const isHovered = hoveredId === id;
          const lit = isActive || isHovered;

          return (
            <div
              key={id}
              className="nav-item-container"
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Active LED bar */}
              <div
                className={`active-led ${isActive ? 'is-active' : ''}`}
                style={{
                  width: isActive ? 3 : 0,
                  backgroundColor: neon,
                  boxShadow: isActive ? `0 0 10px ${glow}` : 'none',
                }}
              />

              <button
                title={label}
                onClick={() => onChangeTab?.(id)}
                className="nav-btn"
                style={{
                  backgroundColor: lit ? `${neon}15` : 'transparent',
                  transform: isHovered && !isActive ? 'scale(1.12)' : isActive ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 16px ${glow}` : isHovered ? `0 0 10px ${glow}60` : 'none',
                }}
              >
                {/* Ripple on active */}
                {isActive && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 'inherit',
                    border: `1px solid ${neon}30`,
                    animation: 'pulse-ring 2s ease-out infinite',
                    pointerEvents: 'none',
                  }} />
                )}

                <Icon
                  size={24}
                  color={lit ? neon : '#7A7A7A'}
                  style={{ transition: 'color 0.2s ease', filter: lit ? `drop-shadow(0 0 4px ${glow})` : 'none' }}
                />
              </button>

              {/* Tooltip */}
              {isHovered && (
                <div className="tooltip-box" style={{ border: `1px solid ${neon}40`, boxShadow: `0 4px 16px rgba(0,0,0,0.5), 0 0 8px ${glow}` }}>
                  {label}
                </div>
              )}
            </div>
          );
        })}

        <div className="spacer" style={{ flex: 1 }} />

        {/* Online indicator dot */}
        <div className="online-dot" style={{ position: 'relative', marginBottom: 4 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: '#22C55E',
            boxShadow: '0 0 8px rgba(34,197,94,0.8)',
            animation: 'ledBlink 2s ease-in-out infinite',
          }} />
        </div>

        {/* Avatar TQ */}
        <div className="avatar-tq" style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF5C00, #FF3D00)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: 0.5,
          border: '2px solid rgba(255,92,0,0.5)',
          boxShadow: '0 0 16px rgba(255,92,0,0.4)',
          cursor: 'pointer', flexShrink: 0,
          transition: 'box-shadow 0.2s',
        }}>
          TQ
        </div>
      </div>
    </>
  );
}
