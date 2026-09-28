import React from 'react';
import {
  Calendar,
  LayoutDashboard,
  Calculator,
  Table,
  HelpCircle,
  GraduationCap,
  User,
  ArrowRightLeft,
  Activity,
  Sparkles,
  Bot,
} from 'lucide-react';
import { StudentProfile } from '../types';

export type NavigationTab =
  | 'calculator'
  | 'health'
  | 'od_simulator'
  | 'matrix'
  | 'timetable'
  | 'advisor'
  | 'guide';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenHowItWorks: () => void;
  selectedSectionName: string;
  currentStudent: StudentProfile | null;
  onOpenProfile: () => void;
  onSwitchStudent: () => void;
  onToggleChatBot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenHowItWorks,
  selectedSectionName,
  currentStudent,
  onOpenProfile,
  onSwitchStudent,
  onToggleChatBot,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-none">
                Attendance Predictor
              </span>
              <span className="text-xs text-slate-400 font-mono mt-0.5">
                VibeCraft Phase 2 · {selectedSectionName || 'Timetable Engine'}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'calculator'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Predictor</span>
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'health'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Health & Charts</span>
            </button>

            <button
              onClick={() => setActiveTab('od_simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'od_simulator'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>OD Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Subject Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'timetable'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Timetable</span>
            </button>

            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'advisor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Advisor</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Rules</span>
            </button>
          </nav>

          {/* Zone 3: Student Profile & Primary Actions */}
          <div className="flex items-center gap-2.5">
            {currentStudent ? (
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg p-1 pr-2">
                <button
                  onClick={onOpenProfile}
                  title="View and edit your profile"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-[11px] font-bold font-mono text-indigo-300">
                    {currentStudent.name ? currentStudent.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight">
                      {currentStudent.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono leading-tight">
                      {currentStudent.email}
                    </span>
                  </div>
                </button>
                <button
                  onClick={onOpenProfile}
                  title="Edit Profile"
                  className="ml-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white text-[11px] border border-slate-800 transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={onSwitchStudent}
                  title="Switch student profile / log out"
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline text-[11px]">Switch</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onSwitchStudent}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </button>
            )}

            <button
              onClick={onOpenHowItWorks}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">How It Works</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-between overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar gap-1 text-xs">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'calculator' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Predictor
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'health' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Health & Charts
          </button>
          <button
            onClick={() => setActiveTab('od_simulator')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'od_simulator' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            OD Simulator
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'matrix' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Matrix
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'timetable' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Timetable
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'advisor' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            AI Advisor
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-2 py-1 rounded whitespace-nowrap ${
              activeTab === 'guide' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Rules
          </button>
        </div>
      </div>
    </header>
  );
};
