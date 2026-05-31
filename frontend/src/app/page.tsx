"use client";

import { useState, useEffect, useRef } from 'react';
import { Screen1Dashboard } from './components/dashboard';
import { Screen2Tasks } from './components/tasks';
import { Screen3Nutrition } from './components/nutrition';
import { Screen4Settings } from './components/settings';

import { SharedSidebar } from './components/SharedSidebar';
import { Toaster } from 'sonner';

type Tab = 'dashboard' | 'schedule' | 'nutrition' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [displayTab, setDisplayTab] = useState<Tab>('dashboard');
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeTab = (tab: Tab) => {
    if (tab === displayTab) return;
    setAnimating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveTab(tab);
      setDisplayTab(tab);
      setAnimating(false);
    }, 180);
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <div style={{
      display: 'flex', height: '100vh',
      backgroundColor: '#080808',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,92,0,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,92,0,0.6); }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 0.3; }
        input[type=time]::-webkit-calendar-picker-indicator {
          filter: invert(1) sepia(1) saturate(5) hue-rotate(10deg); opacity: 0.5;
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-12px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,92,0,0.5); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 8px rgba(255,92,0,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255,92,0,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes ledBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes dotBounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-5px); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scanline {
          0%   { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes neonPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: var(--target-width, 100%); }
        }
        @keyframes ripple {
          0%   { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      <SharedSidebar active={displayTab} onChangeTab={handleChangeTab} />

      <div style={{
        flex: 1, overflow: 'hidden', position: 'relative',
        animation: animating ? 'fadeSlideOut 0.18s ease forwards' : 'fadeSlideIn 0.22s ease forwards',
      }}>
        {activeTab === 'dashboard'  && <Screen1Dashboard onChangeTab={handleChangeTab} />}
        {activeTab === 'schedule'   && <Screen2Tasks     onChangeTab={handleChangeTab} />}
        {activeTab === 'nutrition'  && <Screen3Nutrition onChangeTab={handleChangeTab} />}
        {activeTab === 'settings'   && <Screen4Settings  onChangeTab={handleChangeTab} />}

      </div>
      
      <Toaster richColors theme="dark" position="top-right" />
    </div>
  );
}
