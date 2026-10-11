import React from 'react';
import {
  Video,
  FileCheck,
  Camera,
  Mic,
  Clock,
  ChevronDown,
  ArrowUpRight,
  Layout,
} from 'lucide-react';
import { ROLE_PRESETS } from '../data/mockQuestions';

interface NavbarProps {
  currentView: 'home' | 'interview' | 'report' | 'retry' | 'history' | 'compare';
  onViewChange: (view: 'home' | 'interview' | 'report' | 'history' | 'compare') => void;
  selectedRoleIndex: number;
  onSelectRole: (index: number) => void;
  interviewStatus: 'idle' | 'in_progress' | 'completed';
  isAnswering: boolean;
  totalElapsedTime: number;
  hasCamera: boolean;
  hasMic: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  onOpenDeviceSettings: () => void;
  onEndInterview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  selectedRoleIndex,
  onSelectRole,
  interviewStatus,
  isAnswering,
  totalElapsedTime,
  hasCamera,
  hasMic,
  isCameraOn,
  isMicOn,
  onOpenDeviceSettings,
  onEndInterview,
}) => {
  const currentRole = ROLE_PRESETS[selectedRoleIndex];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-xs no-print print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand matching screenshot "Mock2Real" */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onViewChange('home')}
            className="flex items-center gap-1 cursor-pointer focus:outline-none text-left group"
          >
            <span className="font-extrabold text-slate-900 tracking-tight text-xl">
              Mock
            </span>
            <span className="font-extrabold text-[#4F46E5] tracking-tight text-xl">
              2Real
            </span>
          </button>

          {/* Navigation Links matching screenshot (Features, How it works, About) */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => onViewChange('home')}
              className={`hover:text-[#4F46E5] transition-colors cursor-pointer ${
                currentView === 'home' ? 'text-[#4F46E5] font-semibold' : ''
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => onViewChange('interview')}
              className={`hover:text-[#4F46E5] transition-colors cursor-pointer ${
                currentView === 'interview' ? 'text-[#4F46E5] font-semibold' : ''
              }`}
            >
              Interview Studio
            </button>
            <button
              type="button"
              onClick={() => onViewChange('report')}
              className={`hover:text-[#4F46E5] transition-colors cursor-pointer ${
                currentView === 'report' ? 'text-[#4F46E5] font-semibold' : ''
              }`}
            >
              Final Report
            </button>
            <button
              type="button"
              onClick={() => onViewChange('history')}
              className={`hover:text-[#4F46E5] transition-colors cursor-pointer ${
                currentView === 'history' ? 'text-[#4F46E5] font-semibold' : ''
              }`}
            >
              History
            </button>
            <button
              type="button"
              onClick={() => onViewChange('compare')}
              className={`hover:text-[#4F46E5] transition-colors cursor-pointer ${
                currentView === 'compare' ? 'text-[#4F46E5] font-semibold' : ''
              }`}
            >
              Compare
            </button>
          </nav>
        </div>

        {/* Center / Right: Track Selector (when in interview) & Status */}
        <div className="flex items-center gap-3">
          {/* Role selector dropdown */}
          <div className="hidden lg:flex items-center gap-2">
            <label htmlFor="role-select" className="text-xs text-slate-500 font-medium">
              Track:
            </label>
            <div className="relative">
              <select
                id="role-select"
                value={selectedRoleIndex}
                disabled={interviewStatus === 'in_progress'}
                onChange={(e) => onSelectRole(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg px-2.5 py-1.5 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                {ROLE_PRESETS.map((role, idx) => (
                  <option key={role.id} value={idx}>
                    {role.name} ({role.level})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Hardware status indicators */}
          <div
            onClick={onOpenDeviceSettings}
            className="hidden sm:flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 hover:border-slate-300 cursor-pointer transition-colors"
            title="Check Camera & Microphone input"
          >
            <div className="flex items-center gap-1">
              <Camera
                className={`w-3.5 h-3.5 ${
                  hasCamera && isCameraOn ? 'text-emerald-500' : 'text-amber-500'
                }`}
              />
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasCamera && isCameraOn ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1">
              <Mic
                className={`w-3.5 h-3.5 ${
                  hasMic && isMicOn ? 'text-emerald-500' : 'text-amber-500'
                }`}
              />
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasMic && isMicOn ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>
          </div>

          {/* Session Timer */}
          {totalElapsedTime > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(totalElapsedTime)}</span>
            </div>
          )}

          {/* End Interview button if in progress */}
          {interviewStatus === 'in_progress' ? (
            <button
              type="button"
              onClick={onEndInterview}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              End Session
            </button>
          ) : currentView === 'home' ? (
            /* "Get Started ↗" button matching screenshot */
            <button
              type="button"
              onClick={() => onViewChange('interview')}
              className="inline-flex items-center gap-1 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onViewChange('interview')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Practice Studio</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
