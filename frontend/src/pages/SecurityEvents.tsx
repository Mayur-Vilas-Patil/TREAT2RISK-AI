import React, { useState } from 'react';
import {
  ListFilter,
  Search,
  Download,
  GitBranch,
  Eye,
  X
} from 'lucide-react';
import { SecurityEvent, api } from '../services/api';
import { soundService } from '../services/sound';

interface SecurityEventsProps {
  events: SecurityEvent[];
  onNavigate: (module: string) => void;
  onSelectIncident: (id: string) => void;
}

export const SecurityEvents: React.FC<SecurityEventsProps> = ({
  events,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [isCorrelating, setIsCorrelating] = useState(false);
  const [correlationResults, setCorrelationResults] = useState<any[] | null>(null);

  const handleRunCorrelation = async () => {
    soundService.playScan();
    setIsCorrelating(true);
    try {
      const res = await api.runCorrelation();
      setCorrelationResults(res.clusters || []);
      soundService.playSuccess();
    } catch {
      // error
    } finally {
      setIsCorrelating(false);
    }
  };

  const handleExportCSV = () => {
    soundService.playClick();
    const headers = ['EventID', 'Timestamp', 'Category', 'Severity', 'Hostname', 'User', 'SourceIP', 'DestIP', 'Process', 'Description'];
    const rows = filtered.map(e => [
      e.id,
      e.timestamp,
      e.event_category,
      e.severity,
      e.hostname,
      e.username,
      e.source_ip,
      e.dest_ip,
      e.process_name,
      `"${e.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `threat2risk_events_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = events.filter(e => {
    if (selectedSeverity !== 'all' && e.severity.toLowerCase() !== selectedSeverity.toLowerCase()) return false;
    if (selectedCategory !== 'all' && e.event_category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        e.id.toLowerCase().includes(q) ||
        e.hostname.toLowerCase().includes(q) ||
        e.username.toLowerCase().includes(q) ||
        e.source_ip.toLowerCase().includes(q) ||
        e.dest_ip.toLowerCase().includes(q) ||
        e.process_name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-cyber-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cyber-panel p-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2 font-mono">
            <ListFilter className="w-5 h-5 text-cyber-cyan" />
            <span>Security Events Repository</span>
          </h1>
          <p className="text-xs text-cyber-muted mt-1">
            Raw immutable audit trail and multi-source event telemetry repository.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunCorrelation}
            disabled={isCorrelating}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyber-violet/20 hover:bg-cyber-violet/30 border border-cyber-violet/40 text-cyber-violet font-mono text-xs font-semibold transition-all shadow-glowViolet"
          >
            <GitBranch className={`w-4 h-4 ${isCorrelating ? 'animate-spin' : ''}`} />
            <span>{isCorrelating ? 'Correlating Telemetry...' : 'Trigger Correlation Engine'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#09101C] border border-cyber-border hover:border-cyber-cyan text-cyber-cyan font-mono text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Correlation Engine Modal / Results View */}
      {correlationResults && (
        <div className="bg-gradient-to-r from-cyber-violet/10 via-cyber-panel to-cyber-panel border border-cyber-violet/40 p-5 rounded-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-cyber-violet font-bold text-sm font-mono">
              <GitBranch className="w-4 h-4" />
              <span>Correlation Engine Run: {correlationResults.length} High-Confidence Multi-Stage Attack Chains Identified</span>
            </div>
            <button
              onClick={() => setCorrelationResults(null)}
              className="text-cyber-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {correlationResults.map((c, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#080D18] border border-cyber-border space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyber-violet font-bold">{c.rule_id}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Confidence: {Math.round(c.confidence * 100)}%
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{c.suggested_title}</h4>
                <p className="text-[11px] text-cyber-muted">{c.correlation_reason}</p>
                <div className="pt-2 border-t border-cyber-border text-[10px] font-mono text-cyber-darkMuted flex items-center justify-between">
                  <span>{c.evidence_count} Events Linked</span>
                  <span className="text-cyber-cyan">{c.time_window}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="cyber-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-cyber-muted" />
          <input
            type="text"
            placeholder="Search by IP, username, hostname, process, or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#09101C] border border-cyber-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-cyber-muted focus:outline-none focus:border-cyber-cyan"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => {
              soundService.playClick();
              setSelectedSeverity(e.target.value);
            }}
            className="bg-[#09101C] border border-cyber-border rounded-lg px-2.5 py-1.5 text-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => {
              soundService.playClick();
              setSelectedCategory(e.target.value);
            }}
            className="bg-[#09101C] border border-cyber-border rounded-lg px-2.5 py-1.5 text-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Authentication">Authentication</option>
            <option value="Endpoint">Endpoint</option>
            <option value="Network">Network</option>
            <option value="Firewall">Firewall</option>
            <option value="Process">Process</option>
          </select>

          <span className="text-cyber-muted text-xs pl-2">
            {filtered.length} records
          </span>
        </div>
      </div>

      {/* Events Table */}
      <div className="cyber-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#09101C] border-b border-cyber-border text-cyber-darkMuted uppercase text-[10px]">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Host / Process</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Source IP → Dest IP</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {filtered.map((e, idx) => (
                <tr
                  key={`${e.id}-${idx}`}
                  onClick={() => {
                    soundService.playClick();
                    setSelectedEvent(e);
                  }}
                  className="hover:bg-cyber-panelHover/70 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-cyber-cyan whitespace-nowrap">
                    {e.id}
                  </td>
                  <td className="py-3 px-4 text-cyber-muted whitespace-nowrap">
                    {e.timestamp.replace('2026-11-22T', '').replace('Z', '')}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#09101C] border border-cyber-border text-cyber-muted">
                      {e.event_category}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      e.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      e.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                      e.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {e.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white whitespace-nowrap">
                    <span className="text-cyber-cyan font-bold">{e.hostname}</span>
                    {e.process_name && (
                      <span className="text-cyber-darkMuted text-[11px] block">{e.process_name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-cyber-muted whitespace-nowrap">
                    {e.username}
                  </td>
                  <td className="py-3 px-4 text-cyber-muted whitespace-nowrap text-[11px]">
                    <span className="text-white font-bold">{e.source_ip}</span> → <span>{e.dest_ip}</span>
                  </td>
                  <td className="py-3 px-4 font-sans text-xs text-cyber-muted max-w-sm truncate">
                    {e.description}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-cyber-cyan hover:text-white p-1 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Drawer Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-base font-bold text-cyber-cyan">{selectedEvent.id}</span>
                <span className="text-xs text-cyber-muted font-mono">{selectedEvent.timestamp}</span>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-cyber-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <p className="font-sans text-white text-sm bg-[#080D18] p-3 rounded-lg border border-cyber-border">
                {selectedEvent.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-[#080D18] border border-cyber-border">
                  <span className="text-cyber-darkMuted text-[10px] block">SOURCE IP</span>
                  <span className="text-white font-bold">{selectedEvent.source_ip}</span>
                </div>
                <div className="p-2.5 rounded bg-[#080D18] border border-cyber-border">
                  <span className="text-cyber-darkMuted text-[10px] block">DESTINATION IP</span>
                  <span className="text-white font-bold">{selectedEvent.dest_ip}</span>
                </div>
                <div className="p-2.5 rounded bg-[#080D18] border border-cyber-border">
                  <span className="text-cyber-darkMuted text-[10px] block">HOST</span>
                  <span className="text-cyber-cyan font-bold">{selectedEvent.hostname}</span>
                </div>
                <div className="p-2.5 rounded bg-[#080D18] border border-cyber-border">
                  <span className="text-cyber-darkMuted text-[10px] block">USER</span>
                  <span className="text-cyber-violet font-bold">{selectedEvent.username}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-cyber-darkMuted uppercase font-bold block mb-1">
                  Raw Telemetry Payload
                </span>
                <pre className="bg-[#080D18] p-3 rounded-lg border border-cyber-border text-cyber-cyan text-[11px] overflow-x-auto max-h-40">
                  {JSON.stringify(selectedEvent.raw_payload || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 rounded-lg bg-[#080D18] border border-cyber-border text-white text-xs font-mono hover:bg-cyber-panel transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
