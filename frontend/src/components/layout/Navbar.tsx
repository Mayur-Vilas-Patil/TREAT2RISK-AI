import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Volume2, 
  VolumeX, 
  Waves, 
  ChevronRight, 
  Shield, 
  AlertTriangle, 
  Radio, 
  LogOut, 
  UserCheck, 
  Lock 
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { SoundVisualizer } from '../common/SoundVisualizer';
import { UserProfile } from '../../types/auth';

interface NavbarProps {
  currentModule: string;
  onNavigate: (module: string) => void;
  onOpenSearch: () => void;
  incidentsCount: number;
  criticalCount: number;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModule,
  onNavigate,
  onOpenSearch,
  incidentsCount,
  criticalCount,
  currentUser,
  onLogout
}) => {
  const [isMuted, setIsMuted] = useState(soundService.getIsMuted());
  const [volume, setVolume] = useState(soundService.getVolume());
  const [isAmbient, setIsAmbient] = useState(soundService.getIsAmbientPlaying());
  const [environment, setEnvironment] = useState<'demo' | 'connected'>('demo');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = soundService.subscribe(() => {
      setIsMuted(soundService.getIsMuted());
      setVolume(soundService.getVolume());
      setIsAmbient(soundService.getIsAmbientPlaying());
    });
    return unsubscribe;
  }, []);

  const handleToggleSound = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
    if (!muted) soundService.playClick();
  };

  const handleToggleAmbient = () => {
    soundService.playClick();
    const playing = soundService.toggleAmbient();
    setIsAmbient(playing);
  };

  const handleLogoutClick = () => {
    soundService.playClick();
    if (onLogout) onLogout();
  };

  const getModuleTitle = (mod: string) => {
    switch (mod) {
      case 'overview': return 'Command Center';
      case 'live-monitor': return 'Live Security Monitor';
      case 'events': return 'Security Events Repository';
      case 'investigation': return 'Incident Investigation Workspace';
      case 'attack-graph': return 'Interactive Attack Graph';
      case 'mitre': return 'MITRE ATT&CK Matrix';
      case 'risk': return 'Contextual Risk Intelligence';
      case 'copilot': return 'AI Investigation Copilot';
      case 'simulator': return 'Response Simulator';
      case 'reports': return 'Threat Investigation Reports';
      case 'settings': return 'System Settings';
      default: return 'SOC Operations';
    }
  };

  return (
    <header className="h-14 border-b border-cyber-border bg-[#0B1322]/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs font-mono">
        <span className="text-cyber-muted hover:text-white cursor-pointer" onClick={() => onNavigate('overview')}>
          Threat2Risk SOC
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-cyber-darkMuted" />
        <span className="text-cyber-cyan font-semibold">
          {getModuleTitle(currentModule)}
        </span>

        {/* Environment Badge */}
        <div className="ml-4 hidden sm:flex items-center space-x-2 bg-cyber-panel border border-cyber-border px-2.5 py-1 rounded-md text-[11px]">
          <span className="text-cyber-darkMuted">Env:</span>
          <select 
            value={environment}
            onChange={(e) => {
              soundService.playClick();
              setEnvironment(e.target.value as 'demo' | 'connected');
            }}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="demo" className="bg-[#111C2D] text-white">Demo SOC (Simulated)</option>
            <option value="connected" className="bg-[#111C2D] text-white">Connected Enterprise (Live)</option>
          </select>
          {environment === 'demo' ? (
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1 animate-pulse" />
              DEMO MODE
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-sm mx-6 hidden md:block">
        <button
          onClick={() => { soundService.playClick(); onOpenSearch(); }}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-cyber-panel border border-cyber-border hover:border-cyber-cyan/50 text-cyber-muted text-xs transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-cyber-muted" />
            <span className="truncate">Search incidents, IPs, hosts, users...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#080D18] border border-cyber-border rounded text-cyber-darkMuted">Ctrl+K</kbd>
        </button>
      </div>

      {/* Right Controls: Audio, Notifications, Profile */}
      <div className="flex items-center space-x-3">
        
        {/* Real-Time Acoustic Visualizer Stream */}
        <SoundVisualizer mode="compact" />

        {/* Sound Synthesizer Controls */}
        <div className="relative flex items-center space-x-1 bg-cyber-panel border border-cyber-border rounded-lg p-1">
          <button
            onClick={handleToggleSound}
            title={isMuted ? "Sound is MUTED (Click to Enable)" : "Sound is ACTIVE (Click to Mute)"}
            className={`p-1.5 rounded-md transition-all ${
              !isMuted 
                ? "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-glowCyan" 
                : "text-cyber-muted hover:text-white"
            }`}
          >
            {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {!isMuted && (
            <>
              <button
                onClick={handleToggleAmbient}
                title={isAmbient ? "Disable Ambient Hum" : "Enable Ambient Control Room Hum"}
                className={`p-1.5 rounded-md text-xs transition-all ${
                  isAmbient 
                    ? "bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/40" 
                    : "text-cyber-muted hover:text-white"
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowVolumePopup(!showVolumePopup)}
                className="text-cyber-muted hover:text-white text-[10px] font-mono px-1.5"
              >
                {Math.round(volume * 100)}%
              </button>

              {showVolumePopup && (
                <div className="absolute top-11 right-0 bg-cyber-panel border border-cyber-border rounded-lg p-3 shadow-2xl z-50 w-44">
                  <div className="flex justify-between items-center mb-1 text-[11px] text-cyber-muted font-mono">
                    <span>Volume</span>
                    <span className="text-white">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => soundService.setVolume(parseFloat(e.target.value))}
                    className="w-full accent-cyber-cyan cursor-pointer"
                  />
                  <div className="mt-2 pt-2 border-t border-cyber-border flex justify-between text-[10px] text-cyber-muted font-mono">
                    <button onClick={() => soundService.playAlert()} className="hover:text-cyber-cyan">Test Tone</button>
                    <button onClick={() => soundService.playSuccess()} className="hover:text-emerald-400">Success</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick();
              setShowNotifications(!showNotifications);
            }}
            className="p-2 rounded-lg bg-cyber-panel border border-cyber-border hover:border-cyber-cyan/50 text-cyber-muted hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyber-critical text-white text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
                {criticalCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-11 right-0 w-80 bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl z-50 overflow-hidden font-mono text-xs">
              <div className="p-3 border-b border-cyber-border bg-[#09101C] flex items-center justify-between">
                <span className="font-bold text-white flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
                  <span>Real-Time SOC Alerts</span>
                </span>
                <span className="text-[10px] text-cyber-muted">{incidentsCount} active</span>
              </div>
              <div className="divide-y divide-cyber-border/50 max-h-64 overflow-y-auto">
                <div 
                  onClick={() => {
                    soundService.playClick();
                    setShowNotifications(false);
                    onNavigate('investigation');
                  }}
                  className="p-3 hover:bg-cyber-panelHover cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2 text-cyber-critical font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>INC-2026-001 (Risk 94/100)</span>
                  </div>
                  <p className="text-cyber-muted text-[11px] mt-1 line-clamp-2">
                    Credential Access & Privileged Account Abuse on DC-CORP-01.
                  </p>
                </div>
                <div 
                  onClick={() => {
                    soundService.playClick();
                    setShowNotifications(false);
                    onNavigate('investigation');
                  }}
                  className="p-3 hover:bg-cyber-panelHover cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2 text-cyber-high font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>INC-2026-002 (Risk 84/100)</span>
                  </div>
                  <p className="text-cyber-muted text-[11px] mt-1 line-clamp-2">
                    Endpoint Malware Execution & Lateral Movement from WS-FIN-042.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current Analyst Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              soundService.playClick();
              setShowProfileMenu(!showProfileMenu);
            }}
            className="flex items-center space-x-2.5 pl-2 py-1 pr-1 border-l border-cyber-border hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyber-cyan/30 to-cyber-violet/30 border border-cyber-cyan/50 flex items-center justify-center text-white text-[11px] font-bold font-mono">
              {currentUser?.avatar || 'AV'}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-semibold text-white leading-tight flex items-center space-x-1">
                <span>{currentUser?.name || 'Alex Vance'}</span>
              </div>
              <div className="text-[10px] font-mono text-cyber-cyan leading-tight">
                {currentUser?.tier || 'Tier 3 Lead'}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute top-12 right-0 w-64 bg-[#111C2D] border border-cyber-border rounded-xl shadow-2xl z-50 p-3 space-y-3 font-mono text-xs">
              <div className="border-b border-cyber-border pb-2.5">
                <div className="font-bold text-white text-sm">{currentUser?.name || 'Alex Vance'}</div>
                <div className="text-slate-400 text-[11px]">{currentUser?.email || 'alex.vance@defense.soc'}</div>
                <div className="text-[10px] text-[#00D5FF] mt-1 font-bold">{currentUser?.clearance || 'TOP SECRET // NOFORN'}</div>
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogoutClick();
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-mono font-bold transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Session / Sign Out</span>
                  </span>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
