import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ListFilter,
  ShieldAlert,
  GitGraph,
  Grid3X3,
  Flame,
  Bot,
  Zap,
  FileText,
  Settings,
  Shield,
  UserCheck,
  Radio
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { UserProfile } from '../../types/auth';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onNavigate: (module: string) => void;
  activeIncidentsCount: number;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onNavigate,
  activeIncidentsCount,
  currentUser,
  onLogout
}) => {
  const modules = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'live-monitor', name: 'Live Security Monitor', icon: Activity, badge: 'LIVE', badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    { id: 'events', name: 'Security Events', icon: ListFilter, badge: null },
    { id: 'investigation', name: 'Incident Investigation', icon: ShieldAlert, badge: activeIncidentsCount > 0 ? `${activeIncidentsCount}` : null, badgeColor: 'bg-cyber-critical text-white' },
    { id: 'attack-graph', name: 'Attack Graph', icon: GitGraph, badge: null },
    { id: 'mitre', name: 'MITRE ATT&CK', icon: Grid3X3, badge: null },
    { id: 'risk', name: 'Risk Intelligence', icon: Flame, badge: null },
    { id: 'copilot', name: 'AI Copilot', icon: Bot, badge: 'AI', badgeColor: 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/30' },
    { id: 'simulator', name: 'Response Simulator', icon: Zap, badge: null },
    { id: 'reports', name: 'Threat Reports', icon: FileText, badge: null },
    { id: 'settings', name: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-[250px] shrink-0 h-full border-r border-cyber-border bg-[#0B1322] flex flex-col justify-between z-30 select-none overflow-hidden">
      {/* Top Branding Section */}
      <div>
        <div 
          onClick={() => { soundService.playClick(); onNavigate('overview'); }}
          className="h-14 px-5 border-b border-cyber-border flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan shadow-glowCyan group-hover:border-cyber-cyan transition-all">
            <Shield className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm tracking-wider text-white">THREAT<span className="text-cyber-cyan">2</span>RISK</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">AI</span>
            </div>
            <p className="text-[9px] text-cyber-muted font-mono tracking-wider -mt-0.5">CYBER OPS PLATFORM</p>
          </div>
        </div>

        {/* Navigation Modules List */}
        <nav className="py-3 px-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-14rem)]">
          <div className="px-3 py-1.5 text-[10px] font-mono tracking-wider text-cyber-darkMuted uppercase">
            Navigation
          </div>

          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = currentModule === m.id;

            return (
              <button
                key={m.id}
                onClick={() => {
                  soundService.playClick();
                  onNavigate(m.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyber-cyan/10 text-white border-l-[3px] border-cyber-cyan shadow-glowCyan'
                    : 'text-cyber-muted hover:text-white hover:bg-cyber-panelHover border-l-[3px] border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyber-cyan' : 'text-cyber-muted group-hover:text-cyber-cyan'
                  }`} />
                  <span className="truncate">{m.name}</span>
                </div>

                {m.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                    m.badgeColor || 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/30'
                  }`}>
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-3 border-t border-cyber-border bg-[#09101C] space-y-2">
        {/* Environment & Telemetry Rate */}
        <div className="p-2.5 rounded-lg bg-cyber-panel border border-cyber-border text-[11px] font-mono space-y-1.5">
          <div className="flex items-center justify-between text-cyber-muted">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Demo SOC</span>
            </span>
            <span className="text-emerald-400 font-bold">99.98% Healthy</span>
          </div>
          <div className="flex items-center justify-between text-cyber-darkMuted text-[10px]">
            <span>Sensors: 4 Active</span>
            <span className="text-white">14.2 EPS</span>
          </div>
        </div>

        {/* Analyst Profile */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyber-cyan/30 to-cyber-violet/30 border border-cyber-cyan/50 flex items-center justify-center text-white text-[11px] font-bold font-mono shrink-0">
              {currentUser?.avatar || 'AV'}
            </div>
            <div className="truncate text-left text-xs">
              <div className="font-semibold text-white leading-tight flex items-center space-x-1">
                <span className="truncate">{currentUser?.name || 'Alex Vance'}</span>
                <UserCheck className="w-3 h-3 text-cyber-cyan shrink-0" />
              </div>
              <div className="text-[10px] font-mono text-cyber-cyan leading-tight truncate">
                {currentUser?.tier || 'Tier 3 SOC Lead'}
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={() => {
                soundService.playClick();
                onLogout();
              }}
              title="Lock Session / Return to Gateway"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
