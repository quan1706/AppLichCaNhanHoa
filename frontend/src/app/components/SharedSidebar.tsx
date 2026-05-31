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
    <div style={{
      width: 72, minWidth: 72, height: '100%',
      background: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 16, paddingBottom: 20, gap: 2,
      position: 'relative', zIndex: 50, flexShrink: 0,
    }}>
      {/* Vertical glow bar */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 1,
        background: 'linear-gradient(180deg, transparent, rgba(255,92,0,0.3) 40%, rgba(255,92,0,0.1) 70%, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: 'linear-gradient(135deg, #FF5C00 0%, #FF8A40 50%, #FF3D00 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, flexShrink: 0, cursor: 'pointer',
        boxShadow: '0 0 20px rgba(255,92,0,0.5), 0 4px 16px rgba(0,0,0,0.5)',
        position: 'relative', overflow: 'hidden',
        animation: 'neonPulse 3s ease-in-out infinite',
      }}>
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
            style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 2 }}
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Active LED bar */}
            <div style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
              width: isActive ? 3 : 0, height: 32,
              backgroundColor: neon,
              borderRadius: '0 3px 3px 0',
              boxShadow: isActive ? `0 0 10px ${glow}` : 'none',
              transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
            }} />

            <button
              title={label}
              onClick={() => onChangeTab?.(id)}
              style={{
                width: 48, height: 48, borderRadius: 14, border: 'none',
                backgroundColor: lit ? `${neon}15` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isHovered && !isActive ? 'scale(1.12)' : isActive ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isActive ? `0 0 16px ${glow}` : isHovered ? `0 0 10px ${glow}60` : 'none',
                position: 'relative', overflow: 'hidden',
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
                size={20}
                color={lit ? neon : '#3A3A3A'}
                style={{ transition: 'color 0.2s ease', filter: lit ? `drop-shadow(0 0 4px ${glow})` : 'none' }}
              />
            </button>

            {/* Tooltip */}
            {isHovered && (
              <div style={{
                position: 'absolute', left: '115%', top: '50%', transform: 'translateY(-50%)',
                backgroundColor: '#1A1A1A',
                border: `1px solid ${neon}40`,
                color: '#fff', fontSize: 11, fontWeight: 600,
                padding: '5px 10px', borderRadius: 8,
                whiteSpace: 'nowrap', pointerEvents: 'none',
                boxShadow: `0 4px 16px rgba(0,0,0,0.5), 0 0 8px ${glow}`,
                zIndex: 100,
                animation: 'fadeSlideIn 0.15s ease',
              }}>
                {label}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Online indicator dot */}
      <div style={{ position: 'relative', marginBottom: 4 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          backgroundColor: '#22C55E',
          boxShadow: '0 0 8px rgba(34,197,94,0.8)',
          animation: 'ledBlink 2s ease-in-out infinite',
        }} />
      </div>

      {/* Avatar TQ */}
      <div style={{
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
  );
}
