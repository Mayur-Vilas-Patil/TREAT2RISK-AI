import React, { useState, useEffect } from 'react';
import {
  Zap,
  ShieldCheck,
  AlertTriangle,
  Server,
  User,
  Globe,
  Key,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Incident, SimulationResult, api } from '../services/api';
import { soundService } from '../services/sound';

interface ResponseSimulatorProps {
  incidents: Incident[];
  selectedIncidentId: string;
  onSelectIncident: (id: string) => void;
  onNavigate: (module: string) => void;
}

export const ResponseSimulator: React.FC<ResponseSimulatorProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
}) => {
  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];
  const [selectedAction, setSelectedAction] = useState<string>('isolate_host');
  const [targetEntity, setTargetEntity] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (activeIncident) {
      if (selectedAction === 'isolate_host') {
        setTargetEntity(activeIncident.affected_hosts[0] || 'DC-CORP-01');
      } else if (selectedAction === 'disable_account' || selectedAction === 'reset_credentials') {
        setTargetEntity(activeIncident.affected_users[0] || 's.patel');
      } else if (selectedAction === 'block_ip') {
        setTargetEntity(activeIncident.source_ips[0] || '185.220.101.5');
      } else {
        setTargetEntity(activeIncident.affected_hosts[0] || 'DC-CORP-01');
      }
    }
  }, [activeIncident?.id, selectedAction]);

  const handleRunSimulation = async () => {
    soundService.playScan();
    setIsSimulating(true);
    try {
      const res = await api.simulateResponse(
        activeIncident.id,
        selectedAction,
        targetEntity || 'Target Entity'
      );
      setSimulationResult(res);
      soundService.playSuccess();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch {
      // error
    } finally {
      setIsSimulating(false);
    }
  };

  const actions = [
    {
      id: 'isolate_host',
      name: 'Isolate Host',
      desc: 'Quarantine network interface while maintaining EDR telemetry & RAM state',
      icon: Server,
      accent: 'text-cyber-cyan',
    },
    {
      id: 'disable_account',
      name: 'Disable Account',
      desc: 'Suspend user account in Active Directory and revoke active session tokens',
      icon: User,
      accent: 'text-cyber-violet',
    },
    {
      id: 'block_ip',
      name: 'Block Perimeter IP',
      desc: 'Add adversary IP to border firewall drop list and drop active TCP connections',
      icon: Globe,
      accent: 'text-red-400',
    },
    {
      id: 'reset_credentials',
      name: 'Reset Credentials & TGT',
      desc: 'Force password reset and purge all active Kerberos ticket granting tokens',
      icon: Key,
      accent: 'text-amber-400',
    },
    {
      id: 'increase_monitoring',
      name: 'Increase Telemetry',
      desc: 'Switch host EDR agent to Verbose memory dumping and enable full packet capture',
      icon: Eye,
      accent: 'text-emerald-400',
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1500px] mx-auto text-cyber-text">
      {/* Safety Notice Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-cyber-panel to-cyber-panel border border-amber-500/40 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white font-mono uppercase tracking-wider">
              Safe What-If Response Sandbox
            </div>
            <p className="text-cyber-muted mt-0.5">
              Simulates projected risk reduction, severed attack graph edges, and residual exposure without executing live system modifications.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold whitespace-nowrap">
          ZERO RISK SANDBOX
        </span>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Action Configuration */}
        <div className="cyber-panel p-6 space-y-5">
          <div>
            <span className="text-xs font-mono uppercase text-cyber-muted">Step 1</span>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Select Incident Context
            </h3>
            <select
              value={activeIncident?.id}
              onChange={(e) => {
                soundService.playClick();
                onSelectIncident(e.target.value);
                setSimulationResult(null);
              }}
              className="mt-2 w-full bg-[#080D18] border border-cyber-border rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none cursor-pointer"
            >
              {incidents.map(inc => (
                <option key={inc.id} value={inc.id}>
                  {inc.id}: {inc.title.slice(0, 36)}... (Risk {inc.risk_score})
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-xs font-mono uppercase text-cyber-muted">Step 2</span>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2">
              Choose Response Action
            </h3>
            <div className="space-y-2">
              {actions.map((act) => {
                const Icon = act.icon;
                const isSelected = selectedAction === act.id;

                return (
                  <div
                    key={act.id}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedAction(act.id);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyber-violet/20 border-cyber-violet shadow-glowViolet'
                        : 'bg-[#080D18] border-cyber-border/70 hover:border-cyber-border hover:bg-cyber-panelHover'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${act.accent}`} />
                      <div className="text-xs font-bold text-white font-mono">{act.name}</div>
                    </div>
                    <p className="text-[11px] text-cyber-muted font-sans mt-1">
                      {act.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase text-cyber-muted">Step 3</span>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2">
              Target Entity
            </h3>
            <input
              type="text"
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              placeholder="e.g. DC-CORP-01, s.patel, 185.220.101.5"
              className="w-full bg-[#080D18] border border-cyber-border rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-3 bg-cyber-cyan text-cyber-bg font-bold font-mono text-xs rounded-xl shadow-glowCyan hover:bg-cyber-cyan/90 transition-all flex items-center justify-center space-x-2"
          >
            <Zap className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Calculating Impact...' : 'Execute What-If Simulation'}</span>
          </button>
        </div>

        {/* Right Column: Before vs After Impact Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {simulationResult ? (
            <div className="cyber-panel p-6 space-y-6 animate-in fade-in duration-200">
              {/* Before vs Proposed vs After Comparison Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* BEFORE ACTION */}
                <div className="p-4 rounded-xl bg-[#080D18] border border-cyber-border space-y-1">
                  <span className="text-[10px] font-mono text-cyber-darkMuted uppercase">BEFORE ACTION</span>
                  <div className="text-xs text-cyber-muted font-mono truncate">{activeIncident.title}</div>
                  <div className="text-3xl font-bold font-mono text-cyber-critical pt-1">
                    {simulationResult.before_risk_score}
                    <span className="text-xs text-cyber-muted font-normal">/100</span>
                  </div>
                  <span className="text-[10px] font-mono text-red-400">CRITICAL RISK POSTURE</span>
                </div>

                {/* PROPOSED ACTION */}
                <div className="p-4 rounded-xl bg-[#080D18] border border-cyber-violet/50 space-y-1">
                  <span className="text-[10px] font-mono text-cyber-violet uppercase">PROPOSED RESPONSE</span>
                  <div className="text-xs text-white font-mono font-bold capitalize">
                    {simulationResult.action_type.replace('_', ' ')}
                  </div>
                  <div className="text-sm font-mono text-cyber-cyan pt-2 truncate">
                    Target: {simulationResult.target_entity}
                  </div>
                  <span className="text-[10px] font-mono text-cyber-muted">Isolated containment policy</span>
                </div>

                {/* AFTER SIMULATION */}
                <div className="p-4 rounded-xl bg-[#080D18] border border-emerald-500/50 space-y-1">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">AFTER SIMULATION</span>
                  <div className="text-xs text-emerald-300 font-mono">Projected Risk Score</div>
                  <div className="text-3xl font-bold font-mono text-emerald-400 pt-1">
                    {simulationResult.after_risk_score}
                    <span className="text-xs text-cyber-muted font-normal">/100</span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 font-bold">
                    -{simulationResult.score_delta} Risk Points Reduction
                  </div>
                </div>
              </div>

              {/* Severed Attack Vectors */}
              <div className="p-5 rounded-xl bg-[#080D18] border border-cyber-border space-y-3">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Severed Adversarial Kill-Chain Vectors</span>
                </h4>
                <div className="space-y-2">
                  {simulationResult.severed_vectors.map((vec, i) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs text-cyber-text font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{vec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Residual Risks Analysis */}
              <div className="p-5 rounded-xl bg-[#080D18] border border-cyber-border space-y-3">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Remaining Residual Risks to Investigate</span>
                </h4>
                <div className="space-y-2">
                  {simulationResult.residual_risks.map((res, i) => (
                    <div key={i} className="flex items-start space-x-2.5 text-xs text-cyber-muted font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{res}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Operational Impact */}
              <div className="p-4 rounded-xl bg-[#080D18] border border-cyber-border text-xs">
                <span className="text-[10px] font-mono text-cyber-darkMuted uppercase block mb-1">
                  Expected Operational Impact
                </span>
                <p className="text-white font-sans">
                  {simulationResult.expected_impact}
                </p>
              </div>
            </div>
          ) : (
            <div className="cyber-panel p-12 text-center space-y-3">
              <Zap className="w-10 h-10 text-cyber-cyan/40 mx-auto" />
              <h3 className="text-sm font-bold text-white font-mono">Response Simulation Ready</h3>
              <p className="text-xs text-cyber-muted max-w-md mx-auto">
                Select an action and target entity on the left, then click "Execute What-If Simulation" to project risk delta and severed kill-chain vectors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
