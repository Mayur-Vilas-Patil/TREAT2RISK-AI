import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Key,
  Fingerprint,
  Radio,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Zap,
  Terminal,
  ShieldCheck,
  Server
} from 'lucide-react';
import { soundService } from '../services/sound';
import { SoundVisualizer } from '../components/common/SoundVisualizer';

import { UserProfile, PRESET_USERS } from '../types/auth';
export type { UserProfile };
export { PRESET_USERS };

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile>(PRESET_USERS[0]);
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('849 201');
  const [authMode, setAuthMode] = useState<'credentials' | 'biometric'>('credentials');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState(0);
  const [biometricScanning, setBiometricScanning] = useState(false);

  const authLogs = [
    'Querying Zero-Trust Identity Provider enclave...',
    'Exchanging ephemeral cryptographic session keys [TLS 1.3]...',
    'Verifying hardware token & behavioral risk fingerprint...',
    'Access Verified: Cryptographic authentication token issued.'
  ];

  const handleSelectPreset = (u: UserProfile) => {
    soundService.playKeypress();
    setSelectedUser(u);
  };

  const handleAuthSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAuthenticating) return;

    soundService.playScanChirp();
    setIsAuthenticating(true);
    setAuthStep(0);

    const step1 = setTimeout(() => {
      setAuthStep(1);
      soundService.playKeypress();
    }, 400);

    const step2 = setTimeout(() => {
      setAuthStep(2);
      soundService.playKeypress();
    }, 850);

    const step3 = setTimeout(() => {
      setAuthStep(3);
      soundService.playAccessGranted();
    }, 1300);

    const finish = setTimeout(() => {
      setIsAuthenticating(false);
      onLogin(selectedUser);
    }, 1800);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(finish);
    };
  };

  const handleBiometricScan = () => {
    soundService.playScanChirp();
    setBiometricScanning(true);

    setTimeout(() => {
      setBiometricScanning(false);
      handleAuthSubmit();
    }, 900);
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-[#080D18] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#00D5FF] selection:text-[#080D18] font-sans">
      
      {/* Background Cyber Tech Grid & Concentric Radar Visuals */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(26, 42, 66, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(26, 42, 66, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00D5FF]/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      {/* Top Classification Header Banner */}
      <div className="relative z-10 w-full border-b border-[#1A2A42] bg-[#0c1322]/90 backdrop-blur-md px-6 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-bold tracking-wider uppercase text-[11px]">
            SECURITY CLEARANCE LEVEL 4 REQUIRED
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">DEFCON 2 PROTOCOL ACTIVE</span>
        </div>

        <div className="flex items-center space-x-3">
          <SoundVisualizer mode="compact" />
          <span className="text-[11px] font-mono text-[#00D5FF] px-2 py-0.5 rounded bg-[#00D5FF]/10 border border-[#00D5FF]/30">
            TLS 1.3 ENCRYPTED
          </span>
        </div>
      </div>

      {/* Main Terminal Gateway Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-xl cyber-panel border border-[#1A2A42] bg-[#111C2D]/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl rounded-2xl space-y-6">
          
          {/* Header Title Section */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00D5FF]/20 to-purple-500/20 border border-[#00D5FF]/50 text-[#00D5FF] shadow-[0_0_20px_rgba(0,213,255,0.3)] mb-1">
              <Shield className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center justify-center space-x-2">
                <h1 className="text-2xl font-bold tracking-wider text-white">
                  THREAT<span className="text-[#00D5FF]">2</span>RISK
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00D5FF]/15 text-[#00D5FF] border border-[#00D5FF]/30">
                  AI
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Autonomous SOC Investigation & Risk Intelligence Gateway
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-[10px] font-mono text-slate-500 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
              <span>Zero-Trust Gateway</span>
              <span>•</span>
              <span className="text-[#00D5FF]">{selectedUser.clearance}</span>
            </div>
          </div>

          {/* Preset Roles Quick Selector for Hackathon Jury Demo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Select Security Profile:</span>
              <span className="text-[10px] text-[#00D5FF]">Instant 1-Click Demo</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PRESET_USERS.map((user) => {
                const isSelected = selectedUser.email === user.email;
                return (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => handleSelectPreset(user)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex items-center space-x-2.5 ${
                      isSelected
                        ? 'bg-[#00D5FF]/15 border-[#00D5FF] text-white shadow-[0_0_12px_rgba(0,213,255,0.2)]'
                        : 'bg-[#0c1322] border-[#1A2A42] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#00D5FF] text-[#080D18]' : 'bg-[#16243A] text-slate-300'
                    }`}>
                      {user.avatar}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold leading-tight truncate">{user.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 leading-tight truncate">{user.tier}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Authentication Mode Switcher */}
          <div className="flex rounded-lg bg-[#0c1322] p-1 border border-[#1A2A42] font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setAuthMode('credentials');
              }}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-2 transition-all ${
                authMode === 'credentials'
                  ? 'bg-[#111C2D] text-white shadow-sm border border-[#1A2A42]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Operator Credentials</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setAuthMode('biometric');
              }}
              className={`flex-1 py-1.5 rounded-md flex items-center justify-center space-x-2 transition-all ${
                authMode === 'biometric'
                  ? 'bg-[#111C2D] text-[#00D5FF] shadow-sm border border-[#00D5FF]/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Biometric Scanner</span>
            </button>
          </div>

          {/* Mode 1: Operator Credentials Form */}
          {authMode === 'credentials' ? (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-slate-400 text-[11px] block">Operator Identity / Email:</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="w-full bg-[#0c1322] border border-[#1A2A42] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D5FF] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 text-[11px]">Enclave Passphrase:</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-slate-500 hover:text-[#00D5FF] flex items-center space-x-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0c1322] border border-[#1A2A42] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D5FF] font-mono tracking-wider"
                  />
                </div>
              </div>

              {/* MFA / 2FA Token input */}
              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>Hardware TOTP Token:</span>
                  <span className="text-emerald-400 text-[10px] flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Synchronized</span>
                  </span>
                </label>
                <div className="relative">
                  <Radio className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="w-full bg-[#0c1322] border border-[#1A2A42] rounded-lg pl-9 pr-3 py-2 text-xs text-emerald-400 font-mono tracking-widest font-bold focus:outline-none focus:border-[#00D5FF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 rounded-xl bg-[#00D5FF] hover:bg-[#00e5ff] text-[#080D18] font-bold font-mono text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(0,213,255,0.35)] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isAuthenticating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#080D18] border-t-transparent rounded-full animate-spin" />
                    <span>AUTHENTICATING ENCLAVE...</span>
                  </>
                ) : (
                  <>
                    <span>AUTHENTICATE & INITIALIZE SESSION</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Mode 2: Biometric Fingerprint / Smart Card Scanner */
            <div className="p-6 rounded-xl bg-[#0c1322] border border-[#1A2A42] text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto rounded-full bg-[#111C2D] border-2 border-[#00D5FF]/40 flex items-center justify-center group cursor-pointer overflow-hidden shadow-[0_0_20px_rgba(0,213,255,0.2)]"
                onClick={handleBiometricScan}
              >
                <Fingerprint className={`w-12 h-12 text-[#00D5FF] transition-transform duration-300 ${
                  biometricScanning ? 'scale-110' : 'group-hover:scale-105'
                }`} />

                {/* Laser scan line animation */}
                {biometricScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00D5FF] to-transparent shadow-[0_0_10px_#00D5FF] animate-bounce" />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-white">
                  {biometricScanning ? 'SCANNING FINGERPRINT...' : 'TOUCH TO AUTHENTICATE BIOMETRIC KEY'}
                </h4>
                <p className="text-[11px] text-slate-400 font-sans max-w-xs mx-auto">
                  Click the scanner above to simulate FIDO2 hardware biometric match for <strong className="text-[#00D5FF]">{selectedUser.name}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleBiometricScan}
                disabled={biometricScanning || isAuthenticating}
                className="px-4 py-2 bg-[#00D5FF]/20 hover:bg-[#00D5FF]/30 border border-[#00D5FF]/50 text-[#00D5FF] font-mono text-xs rounded-lg font-bold transition-all"
              >
                Simulate Biometric Verification
              </button>
            </div>
          )}

          {/* Progress sequence display when authenticating */}
          {isAuthenticating && (
            <div className="p-3.5 rounded-lg bg-[#080D18] border border-[#00D5FF]/40 font-mono text-xs space-y-1.5 animate-in fade-in duration-200">
              <div className="text-[10px] text-[#00D5FF] flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Zero-Trust Protocol Handshake:</span>
              </div>
              <div className="text-[11px] text-slate-300">
                &gt; {authLogs[authStep]}
              </div>
              <div className="w-full bg-[#16243A] h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-[#00D5FF] h-full transition-all duration-300"
                  style={{ width: `${((authStep + 1) / authLogs.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Sound Visualizer Waveform Widget inside Login Terminal */}
          <SoundVisualizer mode="full" showDetails={true} />

        </div>
      </main>

      {/* Gateway Footer */}
      <footer className="relative z-10 w-full border-t border-[#1A2A42] bg-[#0c1322]/80 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
        <div className="flex items-center space-x-2">
          <span>THREAT2RISK AI PLATFORM v2.4</span>
          <span>•</span>
          <span>SMART INDIA HACKATHON 2026</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <span>HOST: 127.0.0.1:8000</span>
          <span>•</span>
          <span className="text-emerald-400">SOC STATUS: OPERATIONAL</span>
        </div>
      </footer>

    </div>
  );
};
