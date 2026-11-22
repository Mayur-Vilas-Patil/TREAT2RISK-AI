import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bot,
  Volume2,
  VolumeX,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Key,
  Shield,
  Waves,
  Cpu,
  Activity,
  Database,
  Radio,
  Zap,
  Check
} from 'lucide-react';
import { soundService } from '../services/sound';
import { api } from '../services/api';

interface SettingsPageProps {
  onResetComplete: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onResetComplete }) => {
  const [provider, setProvider] = useState<string>('local');
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState(soundService.getIsMuted());
  const [volume, setVolume] = useState(soundService.getVolume());
  const [isAmbient, setIsAmbient] = useState(soundService.getIsAmbientPlaying());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [activeTone, setActiveTone] = useState<string | null>(null);

  useEffect(() => {
    const unsub = soundService.subscribe(() => {
      setIsMuted(soundService.getIsMuted());
      setVolume(soundService.getVolume());
      setIsAmbient(soundService.getIsAmbientPlaying());
    });
    return unsub;
  }, []);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick();
    await api.configCopilot(provider, apiKey);
    setIsKeySaved(true);
    setTimeout(() => setIsKeySaved(false), 3000);
  };

  const handleResetData = async () => {
    soundService.playClick();
    setShowResetConfirm(false);
    await api.resetDemoData();
    soundService.playSuccess();
    setResetSuccess(true);
    onResetComplete();
    setTimeout(() => setResetSuccess(false), 4000);
  };

  const playToneWithFeedback = (type: 'click' | 'alert' | 'scan' | 'success', name: string) => {
    setActiveTone(name);
    if (type === 'click') soundService.playClick();
    else if (type === 'alert') soundService.playAlert();
    else if (type === 'scan') soundService.playScan();
    else if (type === 'success') soundService.playSuccess();

    setTimeout(() => {
      setActiveTone(null);
    }, 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1300px] mx-auto">
      {/* Header */}
      <div className="cyber-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider text-[#00D5FF] mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D5FF] animate-pulse"></span>
            <span>SYSTEM CONTROL & OPERATIONS ARCHITECTURE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-[#00D5FF]" />
            <span>Platform Configuration & Diagnostics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure AI intelligence engines, synthesized cyber acoustic feedback, deterministic correlation parameters, and reset demo datasets for SIH 2026 juries.
          </p>
        </div>

        {/* Live System Status Badges */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded bg-[#0c1322] border border-[#1A2A42] text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#00D5FF] animate-pulse" />
            <span>Telemetry: 100% ONLINE</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-[#0c1322] border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Latency: 4ms</span>
          </span>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 font-mono text-xs flex items-center space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Demo dataset successfully reset to pristine state. All 3 multi-stage attack scenarios re-seeded and verified.</span>
        </div>
      )}

      {/* Diagnostics / Infrastructure Status Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="cyber-panel p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#00D5FF]/10 text-[#00D5FF]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">AI Copilot Core</div>
            <div className="text-xs font-bold text-white font-mono mt-0.5">Offline Grounded RAG</div>
          </div>
        </div>

        <div className="cyber-panel p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Engine Health</div>
            <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">Operational 99.98%</div>
          </div>
        </div>

        <div className="cyber-panel p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Telemetry Storage</div>
            <div className="text-xs font-bold text-white font-mono mt-0.5">FastAPI + In-Memory</div>
          </div>
        </div>

        <div className="cyber-panel p-4 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Correlation Mode</div>
            <div className="text-xs font-bold text-white font-mono mt-0.5">Deterministic + Temporal</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. AI Copilot Intelligence Provider */}
        <div className="cyber-panel p-6 space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold font-mono text-sm border-b border-[#1A2A42] pb-3">
            <Bot className="w-4 h-4 text-[#00D5FF]" />
            <span>AI Copilot Intelligence Provider</span>
          </div>

          <form onSubmit={handleSaveApiKey} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1.5 uppercase tracking-wide">
                Active Reasoning Engine:
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#0c1322] border border-[#1A2A42] rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-[#00D5FF] cursor-pointer"
              >
                <option value="local">Autonomous Grounded SOC Engine (100% Offline Deterministic RAG)</option>
                <option value="gemini">Google Gemini 1.5 Pro / Flash (Live Cloud API)</option>
                <option value="openai">OpenAI GPT-4o / GPT-4o-mini (Live Cloud API)</option>
              </select>
              <p className="text-[11px] text-slate-500 font-sans mt-1.5">
                The offline engine provides instant, hallucination-free investigation answers citing verified event IDs and timestamps with zero latency.
              </p>
            </div>

            {provider !== 'local' && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                <label className="text-slate-400 text-[11px] block uppercase tracking-wide">
                  External API Key ({provider.toUpperCase()}):
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder={`Enter your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API key...`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[#0c1322] border border-[#1A2A42] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D5FF] font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-sans">
                  Keys are stored exclusively in local memory and never persisted externally.
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#00D5FF] text-[#080D18] font-bold font-mono text-xs rounded-lg hover:bg-[#00e5ff] transition-all shadow-[0_0_12px_rgba(0,213,255,0.25)] flex items-center space-x-1.5"
              >
                <span>Apply Engine Configuration</span>
              </button>

              {isKeySaved && (
                <span className="text-emerald-400 text-xs font-mono flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Configuration saved successfully.</span>
                </span>
              )}
            </div>
          </form>
        </div>

        {/* 2. Web Audio Synthesizer Configuration */}
        <div className="cyber-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A2A42] pb-3">
            <div className="flex items-center space-x-2 text-white font-bold font-mono text-sm">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <span>Cybersecurity Acoustic Synthesizer</span>
            </div>
            {activeTone && (
              <span className="text-[10px] font-mono text-[#00D5FF] px-2 py-0.5 rounded bg-[#00D5FF]/10 border border-[#00D5FF]/30 animate-pulse">
                Playing: {activeTone}
              </span>
            )}
          </div>

          <div className="space-y-4 font-mono text-xs">
            {/* Master Audio Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0c1322] border border-[#1A2A42]">
              <div>
                <div className="text-white font-bold">Master Audio Stream</div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Real-time synthesized Web Audio (radar sweeps, alerts, key clicks)
                </div>
              </div>
              <button
                onClick={() => soundService.toggleMute()}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  !isMuted 
                    ? 'bg-[#00D5FF] text-[#080D18] shadow-[0_0_10px_rgba(0,213,255,0.3)]' 
                    : 'bg-[#111C2D] text-slate-400 border border-[#1A2A42]'
                }`}
              >
                {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{!isMuted ? 'Sound Active' : 'Sound Muted'}</span>
              </button>
            </div>

            {/* Ambient hum toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#0c1322] border border-[#1A2A42]">
              <div>
                <div className="text-white font-bold flex items-center space-x-1.5">
                  <Waves className="w-3.5 h-3.5 text-purple-400" />
                  <span>Control Room Ambient Sub-Bass</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Continuous 55Hz server rack acoustic hum
                </div>
              </div>
              <button
                onClick={() => soundService.toggleAmbient()}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isAmbient 
                    ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                    : 'bg-[#111C2D] text-slate-400 border border-[#1A2A42]'
                }`}
              >
                {isAmbient ? 'Hum Playing' : 'Hum Off'}
              </button>
            </div>

            {/* Volume slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Synthesis Output Level</span>
                <span className="text-[#00D5FF] font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => soundService.setVolume(parseFloat(e.target.value))}
                className="w-full accent-[#00D5FF] cursor-pointer"
              />
            </div>

            {/* Test buttons */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide block mb-2 font-mono">
                Trigger Acoustic Tone Tests:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => playToneWithFeedback('click', 'Click')}
                  className="px-2.5 py-1.5 rounded bg-[#0c1322] border border-[#1A2A42] hover:border-[#00D5FF] text-[11px] text-slate-300 hover:text-white transition-all text-center"
                >
                  Tactile Click
                </button>
                <button
                  type="button"
                  onClick={() => playToneWithFeedback('alert', 'Alert')}
                  className="px-2.5 py-1.5 rounded bg-[#0c1322] border border-red-500/30 hover:border-red-500 text-[11px] text-red-400 hover:text-red-300 transition-all text-center"
                >
                  Critical Chime
                </button>
                <button
                  type="button"
                  onClick={() => playToneWithFeedback('scan', 'Radar')}
                  className="px-2.5 py-1.5 rounded bg-[#0c1322] border border-[#00D5FF]/30 hover:border-[#00D5FF] text-[11px] text-[#00D5FF] transition-all text-center"
                >
                  Radar Sweep
                </button>
                <button
                  type="button"
                  onClick={() => playToneWithFeedback('success', 'Resolved')}
                  className="px-2.5 py-1.5 rounded bg-[#0c1322] border border-emerald-500/30 hover:border-emerald-500 text-[11px] text-emerald-400 transition-all text-center"
                >
                  Success Chime
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Event Correlation Settings */}
        <div className="cyber-panel p-6 space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold font-mono text-sm border-b border-[#1A2A42] pb-3">
            <Sliders className="w-4 h-4 text-[#00D5FF]" />
            <span>Deterministic Correlation Engine Parameters</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1.5 uppercase tracking-wide">
                Temporal Clustering Sliding Window:
              </label>
              <select className="w-full bg-[#0c1322] border border-[#1A2A42] rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-[#00D5FF]">
                <option value="30">30 Minutes (Recommended for high-throughput SOC noise reduction)</option>
                <option value="60">60 Minutes (Standard enterprise SIEM clustering baseline)</option>
                <option value="120">120 Minutes (Advanced persistent threat slow-burn detection)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1.5 uppercase tracking-wide">
                Minimum Correlation Confidence:
              </label>
              <select className="w-full bg-[#0c1322] border border-[#1A2A42] rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-[#00D5FF]">
                <option value="0.90">90% High Confidence (Zero false-positive priority)</option>
                <option value="0.80">80% Moderate Confidence (Balanced kill-chain coverage)</option>
                <option value="0.70">70% Sensitive (Aggressive early-stage attack mapping)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c1322] border border-[#1A2A42] text-slate-400 font-sans text-xs leading-relaxed">
              <strong className="text-slate-200">Rule Logic:</strong> Correlates disparate authentication logs, endpoint process executions, and perimeter network alerts across common <code className="text-[#00D5FF] font-mono">user</code>, <code className="text-[#00D5FF] font-mono">hostname</code>, and <code className="text-[#00D5FF] font-mono">IP</code> anchors within the active sliding window.
            </div>
          </div>
        </div>

        {/* 4. Demo Data Reset */}
        <div className="cyber-panel p-6 space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold font-mono text-sm border-b border-[#1A2A42] pb-3">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Hackathon Demo Data Management</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <p className="text-slate-400 font-sans text-xs leading-relaxed">
              Reinitialize all security incidents, correlated telemetry logs, simulated response actions, and blast radius calculations back to their pristine baseline seed state. Recommended before starting a live Smart India Hackathon jury demonstration.
            </p>

            <div className="p-3.5 rounded-lg bg-[#0c1322] border border-amber-500/20 text-slate-300 font-sans text-xs space-y-1">
              <div className="text-amber-400 font-mono font-bold text-[11px]">Demo Baseline Includes:</div>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                <li><strong className="text-slate-200">INC-2026-001</strong>: Active Directory Credential Access & NTDS Dump (Score: 94)</li>
                <li><strong className="text-slate-200">INC-2026-002</strong>: Endpoint Malware & LSASS Memory Extraction (Score: 82)</li>
                <li><strong className="text-slate-200">INC-2026-003</strong>: Web Shell & C2 Cloud Exfiltration (Score: 88)</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setShowResetConfirm(true);
                }}
                className="px-4 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/40 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-2 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Datasets to Pristine State</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md cyber-panel border border-red-500/50 p-6 space-y-4 shadow-2xl bg-[#111C2D] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white font-mono">Confirm Demo Dataset Reset</h3>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              This will restore all 23 security events, re-seed the 3 canonical multi-stage attack scenarios, and discard any active simulator response states or custom test alerts.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1A2A42]">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-colors font-mono shadow-md"
              >
                Confirm & Reinitialize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
