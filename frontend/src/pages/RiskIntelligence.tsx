import React, { useState, useEffect } from 'react';
import {
  Flame,
  HelpCircle,
  Sliders,
  RotateCcw,
  TrendingUp,
  Server,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Incident, RiskBreakdown, api } from '../services/api';
import { soundService } from '../services/sound';

interface RiskIntelligenceProps {
  incidents: Incident[];
  selectedIncidentId: string;
  onSelectIncident: (id: string) => void;
  onNavigate: (module: string) => void;
}

export const RiskIntelligence: React.FC<RiskIntelligenceProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onNavigate
}) => {
  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];
  const [riskData, setRiskData] = useState<RiskBreakdown | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({
    asset_criticality: 0.25,
    user_privilege: 0.20,
    attack_progression: 0.25,
    vulnerability_exposure: 0.15,
    evidence_confidence: 0.15
  });
  const [showWhyModal, setShowWhyModal] = useState(false);

  useEffect(() => {
    if (activeIncident) {
      loadRisk(activeIncident.id);
    }
  }, [activeIncident?.id]);

  const loadRisk = async (id: string) => {
    try {
      const data = await api.getRisk(id);
      setRiskData(data);
      if (data.weights) {
        setWeights(data.weights);
      }
    } catch {
      // error
    }
  };

  const handleSliderChange = async (key: string, val: number) => {
    const newWeights = { ...weights, [key]: val };
    setWeights(newWeights);
    try {
      const updated = await api.recalculateRisk(activeIncident.id, newWeights);
      setRiskData(updated);
    } catch {
      // error
    }
  };

  const handleResetWeights = async () => {
    soundService.playClick();
    const defaultW = {
      asset_criticality: 0.25,
      user_privilege: 0.20,
      attack_progression: 0.25,
      vulnerability_exposure: 0.15,
      evidence_confidence: 0.15
    };
    setWeights(defaultW);
    const updated = await api.recalculateRisk(activeIncident.id, defaultW);
    setRiskData(updated);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-cyber-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cyber-panel p-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2 font-mono">
              <Flame className="w-5 h-5 text-cyber-critical" />
              <span>Contextual Risk Intelligence Engine</span>
            </h1>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Deterministic Weights
            </span>
          </div>
          <p className="text-xs text-cyber-muted mt-1">
            Explainable mathematical calculation eliminating arbitrary black-box risk scores.
          </p>
        </div>

        {/* Incident Selector & Why Risk Button */}
        <div className="flex items-center space-x-3">
          <select
            value={activeIncident.id}
            onChange={(e) => {
              soundService.playClick();
              onSelectIncident(e.target.value);
            }}
            className="bg-[#09101C] border border-cyber-border rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none cursor-pointer"
          >
            {incidents.map(inc => (
              <option key={inc.id} value={inc.id}>
                {inc.id}: {inc.title.slice(0, 32)}...
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              soundService.playClick();
              setShowWhyModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-cyber-cyan text-cyber-bg font-bold font-mono text-xs shadow-glowCyan hover:bg-cyber-cyan/90 transition-all flex items-center space-x-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span>WHY THIS RISK SCORE?</span>
          </button>
        </div>
      </div>

      {riskData ? (
        <>
          {/* Main Hero Score & Mathematical Formula */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="cyber-panel p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyber-muted">
                  Calculated Overall Score
                </span>
                <div className="flex items-baseline space-x-3 mt-2">
                  <span className={`text-5xl font-bold font-mono ${
                    riskData.overall_score >= 85 ? 'text-cyber-critical' :
                    riskData.overall_score >= 70 ? 'text-cyber-high' :
                    riskData.overall_score >= 40 ? 'text-cyber-medium' :
                    'text-cyber-low'
                  }`}>
                    {riskData.overall_score}
                  </span>
                  <span className="text-cyber-muted font-mono text-base">/ 100</span>
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                    riskData.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  }`}>
                    {riskData.severity}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="my-4">
                <div className="w-full bg-[#080D18] h-3 rounded-full overflow-hidden flex border border-cyber-border">
                  <div
                    className={`h-full transition-all duration-300 ${
                      riskData.overall_score >= 85 ? 'bg-cyber-critical' :
                      riskData.overall_score >= 70 ? 'bg-cyber-high' :
                      'bg-cyber-medium'
                    }`}
                    style={{ width: `${riskData.overall_score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-cyber-darkMuted mt-1">
                  <span>0 Safe</span>
                  <span>50 Elevated</span>
                  <span>85 Critical</span>
                  <span>100 Maximum</span>
                </div>
              </div>

              <div className="text-[11px] text-cyber-muted font-mono pt-3 border-t border-cyber-border/60">
                Formula verified: Deterministic weighted sum based on 5 calibrated parameters.
              </div>
            </div>

            {/* Formula and Rationale Explanation */}
            <div className="lg:col-span-2 cyber-panel p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-cyber-muted mb-2">
                  Transparent Mathematical Formula
                </h3>
                <div className="bg-[#080D18] p-3.5 rounded-lg border border-cyber-border font-mono text-xs text-cyber-cyan break-all">
                  Score = {riskData.formula}
                </div>
              </div>

              <div className="bg-[#080D18] p-4 rounded-lg border border-cyber-border">
                <h4 className="text-xs font-bold text-white mb-1 font-mono">Algorithmic Explanation:</h4>
                <p className="text-xs text-cyber-muted font-sans leading-relaxed">
                  {riskData.explanation}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-cyber-darkMuted pt-2">
                <span>Incident: {activeIncident.id}</span>
                <span className="text-cyber-cyan cursor-pointer hover:underline" onClick={() => onNavigate('simulator')}>
                  Test Response Actions in Simulator →
                </span>
              </div>
            </div>
          </div>

          {/* Configurable Weight Sliders Sandbox */}
          <div className="cyber-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2 font-mono">
                  <Sliders className="w-4 h-4 text-cyber-cyan" />
                  <span>Configurable Factor Weights Sandbox</span>
                </h3>
                <p className="text-xs text-cyber-muted">
                  Slide weights to test sensitivity and customize risk calculations to organizational risk appetite.
                </p>
              </div>
              <button
                onClick={handleResetWeights}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#080D18] border border-cyber-border hover:border-cyber-cyan text-xs font-mono text-cyber-muted hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Weights</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
              {riskData.factors.map((factor) => {
                const key = factor.name.toLowerCase().replace(/ /g, '_');
                const currentWeight = weights[key] !== undefined ? weights[key] : factor.weight;

                return (
                  <div key={factor.name} className="p-4 rounded-xl bg-[#080D18] border border-cyber-border space-y-2">
                    <div className="flex justify-between items-baseline text-xs font-mono">
                      <span className="text-white font-bold">{factor.name}</span>
                      <span className="text-cyber-cyan font-bold">{Math.round(currentWeight * 100)}%</span>
                    </div>

                    <input
                      type="range"
                      min="0.05"
                      max="0.50"
                      step="0.05"
                      value={currentWeight}
                      onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                      className="w-full accent-cyber-cyan cursor-pointer"
                    />

                    <div className="text-[11px] font-mono text-cyber-muted flex justify-between">
                      <span>Score: <strong className="text-white">{factor.score}</strong></span>
                      <span>Contrib: <strong className="text-cyber-cyan">+{factor.contribution}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blast Radius & Risk Trend Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blast Radius Assets Table */}
            <div className="cyber-panel p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2 font-mono">
                  <Server className="w-4 h-4 text-cyber-violet" />
                  <span>Downstream Blast Radius & Exposure</span>
                </h3>
                <p className="text-xs text-cyber-muted">
                  Crown-jewel systems within adversary reach based on trust relationships.
                </p>
              </div>

              <div className="space-y-2.5">
                {riskData.blast_radius_assets.map(asset => (
                  <div key={asset.name} className="p-3 rounded-lg bg-[#080D18] border border-cyber-border flex items-center justify-between text-xs">
                    <div>
                      <div className="text-white font-mono font-bold">{asset.name}</div>
                      <div className="text-[11px] text-cyber-muted">{asset.criticality}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        asset.risk === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {asset.risk}
                      </span>
                      <div className="text-[10px] text-cyber-darkMuted font-mono mt-1">{asset.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Risk Trend Chart */}
            <div className="cyber-panel p-6 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2 font-mono">
                  <TrendingUp className="w-4 h-4 text-cyber-cyan" />
                  <span>Risk Score Progression Trend</span>
                </h3>
                <p className="text-xs text-cyber-muted">
                  Evolution of risk as new adversary kill-chain stages were correlated.
                </p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskData.risk_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1A2A42" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111C2D', borderColor: '#1A2A42', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#EF4444' }}
                      name="Risk Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] font-mono text-cyber-darkMuted pt-2 border-t border-cyber-border/60 flex justify-between">
                <span>Intrusion detected: T-60m</span>
                <span className="text-red-400 font-bold">Current Peak: {riskData.overall_score}/100</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-cyber-muted font-mono">Loading risk parameters...</div>
      )}

      {/* "WHY THIS RISK SCORE?" Modal */}
      {showWhyModal && riskData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-cyber-critical" />
                <h3 className="text-base font-bold text-white font-mono">
                  Why This Risk Score: {riskData.overall_score}/100
                </h3>
              </div>
              <button onClick={() => setShowWhyModal(false)} className="text-cyber-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="bg-[#080D18] p-3.5 rounded-lg border border-cyber-border">
                <div className="text-cyber-darkMuted uppercase text-[10px] mb-1">Mathematical Formula</div>
                <div className="text-cyber-cyan font-bold break-all">{riskData.formula}</div>
              </div>

              <div className="space-y-2">
                {riskData.factors.map(f => (
                  <div key={f.name} className="p-3 rounded-lg bg-[#080D18] border border-cyber-border flex items-start justify-between">
                    <div>
                      <div className="text-white font-bold">{f.name}</div>
                      <div className="text-cyber-muted font-sans text-xs mt-0.5">{f.rationale}</div>
                    </div>
                    <div className="text-right whitespace-nowrap pl-4">
                      <div className="text-cyber-cyan font-bold">{f.score} pts</div>
                      <div className="text-[10px] text-cyber-darkMuted">× {f.weight} = +{f.contribution}</div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-cyber-muted font-sans bg-[#080D18] p-3 rounded-lg border border-cyber-border">
                {riskData.explanation}
              </p>
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-end">
              <button
                onClick={() => setShowWhyModal(false)}
                className="px-4 py-2 bg-cyber-cyan text-cyber-bg font-bold font-mono text-xs rounded-lg hover:bg-cyber-cyan/90 transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
