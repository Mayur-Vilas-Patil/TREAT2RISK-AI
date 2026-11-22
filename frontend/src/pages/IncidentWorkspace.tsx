import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  User,
  Server,
  Globe,
  FileText,
  GitGraph,
  Zap,
  MessageSquare,
  Plus,
  HelpCircle,
  ExternalLink,
  Check,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Incident, api, RiskBreakdown } from '../services/api';
import { soundService } from '../services/sound';

interface IncidentWorkspaceProps {
  incidents: Incident[];
  selectedIncidentId: string;
  onSelectIncident: (id: string) => void;
  onNavigate: (module: string) => void;
  onIncidentUpdated: (updated: Incident) => void;
}

export const IncidentWorkspace: React.FC<IncidentWorkspaceProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onNavigate,
  onIncidentUpdated
}) => {
  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidence' | 'techniques' | 'risk' | 'recommendations'>('overview');
  const [newNoteText, setNewNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showWhyRiskModal, setShowWhyRiskModal] = useState(false);
  const [riskData, setRiskData] = useState<RiskBreakdown | null>(null);

  useEffect(() => {
    if (activeIncident) {
      api.getRisk(activeIncident.id).then(setRiskData).catch(() => {});
    }
  }, [activeIncident?.id]);

  if (!activeIncident) {
    return <div className="p-8 text-center text-cyber-muted font-mono">No incident selected.</div>;
  }

  const handleStatusChange = async (newStatus: 'Open' | 'Under Investigation' | 'Contained' | 'Closed') => {
    soundService.playClick();
    if (newStatus === 'Contained' || newStatus === 'Closed') {
      soundService.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    const updated = await api.updateIncident(activeIncident.id, { status: newStatus });
    onIncidentUpdated(updated);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    soundService.playClick();
    const newNote = await api.addIncidentNote(activeIncident.id, newNoteText);
    const updatedNotes = [...activeIncident.notes, newNote];
    onIncidentUpdated({ ...activeIncident, notes: updatedNotes });
    setNewNoteText('');
    setShowNoteInput(false);
  };

  const handleToggleEvidence = async (eventId: string) => {
    soundService.playClick();
    const res = await api.toggleEvidence(activeIncident.id, eventId);
    onIncidentUpdated({ ...activeIncident, evidence_reviewed: res.evidence_reviewed });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-cyber-text">
      {/* Top Incident Selector Banner */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {incidents.map(inc => (
          <button
            key={inc.id}
            onClick={() => {
              soundService.playClick();
              onSelectIncident(inc.id);
            }}
            className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
              inc.id === activeIncident.id
                ? 'bg-cyber-panel text-white border-cyber-cyan shadow-glowCyan'
                : 'bg-[#080D18] text-cyber-muted hover:text-white border-cyber-border'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              inc.severity === 'critical' ? 'bg-red-400' : 'bg-orange-400'
            }`} />
            <span className="font-bold">{inc.id}</span>
            <span className="text-[11px] text-cyber-muted truncate max-w-[180px] font-sans">{inc.title}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#09101C] border border-cyber-border">
              {inc.risk_score}
            </span>
          </button>
        ))}
      </div>

      {/* Main Incident Card Header */}
      <div className="cyber-panel p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-mono font-bold text-cyber-cyan">{activeIncident.id}</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                activeIncident.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                'bg-orange-500/20 text-orange-400 border border-orange-500/40'
              }`}>
                {activeIncident.severity}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                Risk {activeIncident.risk_score}/100
              </span>
              <span className="text-xs font-mono text-cyber-muted">
                First Detected: {activeIncident.first_detected.replace('2026-11-22T', '').replace('Z', ' UTC')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {activeIncident.title}
            </h1>
          </div>

          {/* Status Switcher & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="flex items-center space-x-1.5 bg-[#09101C] border border-cyber-border rounded-lg px-2.5 py-1 text-xs">
              <span className="text-cyber-muted text-[11px]">Status:</span>
              <select
                value={activeIncident.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer font-mono"
              >
                <option value="Open" className="bg-[#111C2D] text-white">Open</option>
                <option value="Under Investigation" className="bg-[#111C2D] text-amber-400">Under Investigation</option>
                <option value="Contained" className="bg-[#111C2D] text-emerald-400">Contained</option>
                <option value="Closed" className="bg-[#111C2D] text-cyber-muted">Closed</option>
              </select>
            </div>

            {/* Attack Graph Button */}
            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('attack-graph');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#09101C] border border-cyber-border hover:border-cyber-cyan text-cyber-cyan text-xs font-mono transition-colors"
            >
              <GitGraph className="w-3.5 h-3.5" />
              <span>Attack Graph</span>
            </button>

            {/* Response Simulator Button */}
            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('simulator');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyber-violet/20 border border-cyber-violet/40 text-cyber-violet text-xs font-mono hover:bg-cyber-violet/30 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Response</span>
            </button>

            {/* Export Report Button */}
            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('reports');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#09101C] border border-cyber-border hover:border-white text-white text-xs font-mono transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Threat Report</span>
            </button>
          </div>
        </div>

        {/* Quick Entity Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-cyber-border/60 text-xs font-mono">
          <div className="flex items-center space-x-2 text-cyber-muted">
            <User className="w-3.5 h-3.5 text-cyber-violet" />
            <span>Target User: <strong className="text-white">{activeIncident.affected_users.join(', ')}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-cyber-muted">
            <Server className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Target Host: <strong className="text-white">{activeIncident.affected_hosts.join(', ')}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-cyber-muted">
            <Globe className="w-3.5 h-3.5 text-red-400" />
            <span>Adversary IP: <strong className="text-red-400">{activeIncident.source_ips.join(', ')}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-cyber-muted">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Assigned: <strong className="text-white">{activeIncident.assigned_to}</strong></span>
          </div>
        </div>

        {/* 6 Workspaces Tabs */}
        <div className="flex items-center space-x-2 border-b border-cyber-border pt-2 overflow-x-auto">
          {[
            { id: 'overview', label: '1. Overview' },
            { id: 'timeline', label: `2. Timeline (${activeIncident.timeline_stages.length})` },
            { id: 'evidence', label: `3. Evidence (${activeIncident.related_event_ids.length})` },
            { id: 'techniques', label: `4. Attack Techniques (${activeIncident.mitre_techniques.length})` },
            { id: 'risk', label: '5. Risk Analysis' },
            { id: 'recommendations', label: '6. Recommendations' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                soundService.playClick();
                setActiveTab(t.id as any);
              }}
              className={`pb-2.5 px-3 text-xs font-mono font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-cyber-cyan text-cyber-cyan font-bold'
                  : 'border-transparent text-cyber-muted hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Attack Summary */}
            <div className="cyber-panel p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Executive Attack Narrative
              </h3>
              <p className="text-sm text-cyber-text leading-relaxed bg-[#080D18] p-4 rounded-lg border border-cyber-border font-sans">
                {activeIncident.summary}
              </p>
            </div>

            {/* Kill-Chain Stages Quick View */}
            <div className="cyber-panel p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Kill-Chain Progression Stages
              </h3>
              <div className="space-y-2">
                {activeIncident.timeline_stages.map((stg, i) => (
                  <div key={stg.id} className="p-3 rounded-lg bg-[#080D18] border border-cyber-border flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-full bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 flex items-center justify-center font-mono text-[10px] font-bold mt-0.5 shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-2">
                          <span>{stg.title}</span>
                          <span className="text-[10px] font-mono text-cyber-muted">({stg.stage_name})</span>
                          {stg.is_inferred && (
                            <span className="text-[9px] font-mono px-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              INFERRED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-cyber-muted mt-0.5 font-sans">{stg.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyber-darkMuted whitespace-nowrap pl-2">
                      {stg.timestamp.replace('2026-11-22T', '').replace('Z', '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Investigation Notes */}
          <div className="space-y-6">
            <div className="cyber-panel p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-cyber-cyan" />
                  <span>Analyst Notes ({activeIncident.notes.length})</span>
                </h3>
                <button
                  onClick={() => {
                    soundService.playClick();
                    setShowNoteInput(!showNoteInput);
                  }}
                  className="p-1 rounded bg-[#080D18] border border-cyber-border text-cyber-cyan hover:bg-cyber-panel"
                  title="Add Note"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add Note Form */}
              {showNoteInput && (
                <form onSubmit={handleAddNote} className="space-y-2 animate-in fade-in duration-150">
                  <textarea
                    rows={3}
                    placeholder="Document forensic observation, triage decision, or containment verification..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full bg-[#080D18] border border-cyber-border rounded-lg p-2.5 text-xs text-white placeholder:text-cyber-muted focus:outline-none focus:border-cyber-cyan font-mono"
                  />
                  <div className="flex justify-end space-x-2 font-mono">
                    <button
                      type="button"
                      onClick={() => setShowNoteInput(false)}
                      className="px-2.5 py-1 text-xs text-cyber-muted hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-cyber-cyan text-cyber-bg font-bold text-xs rounded-lg hover:bg-cyber-cyan/90 transition-colors"
                    >
                      Post Note
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeIncident.notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-[#080D18] border border-cyber-border space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyber-darkMuted">
                      <span className="text-cyber-cyan font-bold">{n.author}</span>
                      <span>{n.timestamp.replace('2026-11-22T', '').replace('Z', '')}</span>
                    </div>
                    <p className="text-xs text-cyber-text font-sans">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Copilot Jump */}
            <div className="cyber-panel p-4 space-y-2 border-cyber-cyan/30">
              <span className="text-xs font-bold font-mono text-cyber-cyan block">
                AI Copilot Ready
              </span>
              <p className="text-xs text-cyber-muted font-sans">
                Investigate this incident with natural language and get grounded citations.
              </p>
              <button
                onClick={() => {
                  soundService.playClick();
                  onNavigate('copilot');
                }}
                className="w-full py-2 bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/30 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Ask Copilot About This Incident</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Timeline */}
      {activeTab === 'timeline' && (
        <div className="cyber-panel p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white font-mono">Chronological Attack Reconstruction</h3>
            <p className="text-xs text-cyber-muted">
              Step-by-step reconstruction distinguishing confirmed sensor events from inferred adversarial vectors.
            </p>
          </div>

          <div className="relative border-l-2 border-cyber-border ml-4 space-y-6 pl-6">
            {activeIncident.timeline_stages.map((stg) => (
              <div key={stg.id} className="relative group">
                <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 bg-[#080D18] ${
                  stg.severity === 'critical' ? 'border-red-500 text-red-500' : 'border-cyber-cyan text-cyber-cyan'
                }`} />

                <div className="p-4 rounded-xl bg-[#080D18] border border-cyber-border hover:border-cyber-cyan/40 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-cyber-cyan">{stg.stage_name}</span>
                      <span className="text-white text-xs font-bold font-mono">— {stg.title}</span>
                      {stg.is_inferred ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          INFERRED ATTACK STAGE
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          CONFIRMED SENSOR TELEMETRY
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-cyber-darkMuted">
                      {stg.timestamp.replace('2026-11-22T', '').replace('Z', ' UTC')}
                    </span>
                  </div>

                  <p className="text-xs text-cyber-muted font-sans">{stg.description}</p>

                  <div className="flex items-center space-x-3 pt-2 text-[11px] font-mono text-cyber-darkMuted">
                    <span>Involved Entity: <strong className="text-white">{stg.entity}</strong></span>
                    <span>•</span>
                    <span>Related Events: <strong className="text-cyber-cyan">{stg.related_event_ids.join(', ')}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Evidence */}
      {activeTab === 'evidence' && (
        <div className="cyber-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-mono">Forensic Evidence & Sensor Logs</h3>
              <p className="text-xs text-cyber-muted">
                Review and verify the raw telemetry backing this attack story. Mark evidence as reviewed.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded font-bold">
              {activeIncident.evidence_reviewed.length} of {activeIncident.related_event_ids.length} Reviewed
            </span>
          </div>

          <div className="space-y-3">
            {activeIncident.related_event_ids.map(evtId => {
              const isReviewed = activeIncident.evidence_reviewed.includes(evtId);

              return (
                <div
                  key={evtId}
                  className={`p-4 rounded-xl bg-[#080D18] border transition-all ${
                    isReviewed ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-cyber-border hover:border-cyber-borderLight'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => handleToggleEvidence(evtId)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors mt-0.5 ${
                          isReviewed ? 'bg-emerald-500 text-white' : 'border border-cyber-border hover:border-cyber-cyan text-transparent'
                        }`}
                        title={isReviewed ? "Mark Unreviewed" : "Mark as Reviewed by Analyst"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-cyber-cyan">{evtId}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold uppercase ${
                            isReviewed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#111C2D] text-cyber-muted'
                          }`}>
                            {isReviewed ? 'REVIEWED BY ANALYST' : 'PENDING REVIEW'}
                          </span>
                        </div>
                        <p className="text-xs text-white font-sans mt-1">
                          Correlated raw log item associated with {activeIncident.title}.
                        </p>
                        <span className="text-[10px] font-mono text-cyber-darkMuted mt-1 block">
                          Cryptographic Hash: SHA256:{evtId.replace('-', '')}e89c02bf... (Tamper Evident)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        soundService.playClick();
                        onNavigate('events');
                      }}
                      className="text-xs font-mono text-cyber-cyan hover:underline flex items-center space-x-1"
                    >
                      <span>Inspect Raw JSON</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Attack Techniques (MITRE) */}
      {activeTab === 'techniques' && (
        <div className="cyber-panel p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white font-mono">Mapped MITRE ATT&CK Techniques</h3>
            <p className="text-xs text-cyber-muted">
              Observed and potential adversary tradecraft mapped to the enterprise matrix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeIncident.mitre_techniques.map(tech => (
              <div key={tech.technique_id} className="p-4 rounded-xl bg-[#080D18] border border-cyber-border hover:border-cyber-cyan/50 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyber-cyan font-bold">{tech.technique_id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    tech.confidence === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {tech.confidence}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-mono">{tech.technique_name}</h4>
                <div className="text-[11px] font-mono text-cyber-violet">Tactic: {tech.tactic}</div>
                <p className="text-xs text-cyber-muted font-sans">{tech.description}</p>
                <div className="pt-2 border-t border-cyber-border text-[10px] font-mono text-cyber-darkMuted">
                  Supporting Evidence: <span className="text-cyber-cyan font-bold">{tech.evidence_events.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Risk Analysis */}
      {activeTab === 'risk' && (
        <div className="cyber-panel p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2 font-mono">
                <Flame className="w-5 h-5 text-cyber-critical" />
                <span>Explainable Contextual Risk Scoring</span>
              </h3>
              <p className="text-xs text-cyber-muted">
                Transparent risk computation driven by asset criticality, user privileges, kill chain progression, and exposure.
              </p>
            </div>
            <button
              onClick={() => {
                soundService.playClick();
                setShowWhyRiskModal(true);
              }}
              className="px-4 py-2 rounded-lg bg-cyber-cyan text-cyber-bg font-bold font-mono text-xs shadow-glowCyan hover:bg-cyber-cyan/90 transition-all flex items-center space-x-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>WHY THIS RISK SCORE?</span>
            </button>
          </div>

          {riskData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riskData.factors.map(f => (
                  <div key={f.name} className="p-4 rounded-xl bg-[#080D18] border border-cyber-border space-y-2">
                    <div className="flex justify-between items-baseline text-xs font-mono">
                      <span className="text-white font-bold">{f.name}</span>
                      <span className="text-cyber-cyan font-bold">{f.score}/100</span>
                    </div>
                    <div className="w-full bg-[#111C2D] h-2 rounded-full overflow-hidden">
                      <div className="bg-cyber-cyan h-full" style={{ width: `${f.score}%` }} />
                    </div>
                    <p className="text-xs text-cyber-muted font-sans pt-1">{f.rationale}</p>
                    <div className="text-[10px] font-mono text-cyber-darkMuted">
                      Weight: {f.weight} • Contribution: {f.contribution} points
                    </div>
                  </div>
                ))}
              </div>

              {/* Blast Radius Section */}
              <div className="p-4 rounded-xl bg-[#080D18] border border-cyber-border space-y-3">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Downstream Blast Radius Exposure
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {riskData.blast_radius_assets.map(a => (
                    <div key={a.name} className="p-3 rounded-lg bg-cyber-panel border border-cyber-border text-xs">
                      <div className="font-bold text-white font-mono">{a.name}</div>
                      <div className="text-[11px] text-cyber-muted mt-0.5">{a.criticality}</div>
                      <div className="text-[10px] font-mono text-red-400 mt-1">{a.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-cyber-muted font-mono">Loading risk parameters...</div>
          )}
        </div>
      )}

      {/* Tab 6: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="cyber-panel p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-mono">Containment & Remediation Roadmap</h3>
              <p className="text-xs text-cyber-muted">
                Prioritized response steps aligned with NIST SP 800-61 Incident Handling Guide.
              </p>
            </div>
            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('simulator');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/40 text-xs font-mono hover:bg-cyber-violet/30 transition-colors flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Mitigation Impact →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Phase 1 */}
            <div className="p-4 rounded-xl bg-[#080D18] border border-red-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-red-400 font-bold">PHASE 1: CONTAINMENT</span>
                <span className="text-red-400 text-[10px]">0 - 15 MIN</span>
              </div>
              <ul className="text-xs text-cyber-text space-y-2 font-sans list-disc pl-4">
                <li>Sever network interface of target host <strong className="text-white">{activeIncident.affected_hosts[0]}</strong>.</li>
                <li>Disable compromised account <strong className="text-white">{activeIncident.affected_users[0]}</strong> in Active Directory.</li>
                <li>Block perimeter ingress from IP <strong className="text-red-400">{activeIncident.source_ips[0]}</strong>.</li>
              </ul>
            </div>

            {/* Phase 2 */}
            <div className="p-4 rounded-xl bg-[#080D18] border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold">PHASE 2: ERADICATION</span>
                <span className="text-amber-400 text-[10px]">15 - 60 MIN</span>
              </div>
              <ul className="text-xs text-cyber-text space-y-2 font-sans list-disc pl-4">
                <li>Audit Volume Shadow Copies and delete adversary staged dumps in Temp directories.</li>
                <li>Rotate Active Directory KRBTGT password twice to invalidate forged Kerberos Golden Tickets.</li>
                <li>Terminate hidden PowerShell and WMI persistence routines.</li>
              </ul>
            </div>

            {/* Phase 3 */}
            <div className="p-4 rounded-xl bg-[#080D18] border border-cyber-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-cyber-cyan font-bold">PHASE 3: HARDENING</span>
                <span className="text-cyber-cyan text-[10px]">POST-INCIDENT</span>
              </div>
              <ul className="text-xs text-cyber-text space-y-2 font-sans list-disc pl-4">
                <li>Enforce hardware FIDO2 tokens on all Tier 0 Domain Admin accounts.</li>
                <li>Restrict WinRM administration to hardened jump box with PAW (Privileged Access Workstations).</li>
                <li>Deploy custom YARA detection rules for NTDS memory dumping.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* "WHY THIS RISK SCORE?" Deep-Dive Modal */}
      {showWhyRiskModal && riskData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-cyber-critical" />
                <h3 className="text-base font-bold text-white font-mono">
                  Why This Risk Score: {riskData.overall_score}/100
                </h3>
              </div>
              <button onClick={() => setShowWhyRiskModal(false)} className="text-cyber-muted hover:text-white">
                ✕
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
                onClick={() => setShowWhyRiskModal(false)}
                className="px-4 py-2 bg-cyber-cyan text-cyber-bg font-bold font-mono text-xs rounded-lg hover:bg-cyber-cyan/90 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
