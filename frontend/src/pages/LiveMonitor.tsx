import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Search,
  Activity,
  Zap,
  X,
  ExternalLink,
  Bot
} from 'lucide-react';
import { SecurityEvent, api } from '../services/api';
import { soundService } from '../services/sound';

interface LiveMonitorProps {
  events: SecurityEvent[];
  onNewEvent: (evt: SecurityEvent) => void;
  onNavigate: (module: string) => void;
  onSelectIncident: (id: string) => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({
  events,
  onNewEvent,
  onNavigate,
}) => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(3500); // ms
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [newestEventId, setNewestEventId] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  // Automatic demo event streaming interval
  useEffect(() => {
    if (isMonitoring) {
      timerRef.current = window.setInterval(async () => {
        try {
          const newEvt = await api.generateSimulatedEvent();
          onNewEvent(newEvt);
          setNewestEventId(newEvt.id);
          soundService.playScan();
          setTimeout(() => setNewestEventId(null), 2000);
        } catch {
          // fetch error safety
        }
      }, streamSpeed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isMonitoring, streamSpeed, onNewEvent]);

  const handleToggleMonitoring = () => {
    soundService.playClick();
    setIsMonitoring(!isMonitoring);
  };

  const handleManualGenerate = async () => {
    soundService.playScan();
    try {
      const newEvt = await api.generateSimulatedEvent();
      onNewEvent(newEvt);
      setNewestEventId(newEvt.id);
      setTimeout(() => setNewestEventId(null), 2000);
    } catch {
      // error safety
    }
  };

  // Filter pipeline
  const filteredEvents = events.filter((e) => {
    if (selectedSeverity !== 'all' && e.severity.toLowerCase() !== selectedSeverity.toLowerCase()) {
      return false;
    }
    if (selectedCategory !== 'all' && e.event_category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        e.id.toLowerCase().includes(q) ||
        e.source_ip.toLowerCase().includes(q) ||
        e.dest_ip.toLowerCase().includes(q) ||
        e.username.toLowerCase().includes(q) ||
        e.hostname.toLowerCase().includes(q) ||
        e.process_name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-cyber-text">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 cyber-panel p-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2 font-mono">
              <Activity className="w-5 h-5 text-cyber-cyan" />
              <span>Live Security Event Monitor</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              SIMULATED DEMO STREAM
            </span>
          </div>
          <p className="text-xs text-cyber-muted mt-1">
            Real-time event stream from simulated network, firewall, identity, and endpoint telemetry agents.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          {/* Start / Pause Control */}
          <button
            onClick={handleToggleMonitoring}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-bold transition-all ${
              isMonitoring
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Resume Stream</span>
              </>
            )}
          </button>

          {/* Trigger 1 Event */}
          <button
            onClick={handleManualGenerate}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#09101C] border border-cyber-border hover:border-cyber-cyan text-cyber-cyan transition-colors"
            title="Generate a single simulated event immediately"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Generate Event</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1 bg-[#09101C] border border-cyber-border rounded-lg p-1 text-[11px]">
            <span className="text-cyber-muted px-1.5">Speed:</span>
            {[
              { label: '1x', val: 4000 },
              { label: '2x', val: 2000 },
              { label: '4x', val: 1000 }
            ].map(s => (
              <button
                key={s.label}
                onClick={() => {
                  soundService.playClick();
                  setStreamSpeed(s.val);
                }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  streamSpeed === s.val
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 font-bold'
                    : 'text-cyber-muted hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#09101C] border border-cyber-border text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-cyber-muted">{isMonitoring ? 'STREAMING' : 'PAUSED'}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cyber-panel p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-cyber-muted" />
            <input
              type="text"
              placeholder="Filter by IP, username, hostname, process, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#09101C] border border-cyber-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-cyber-muted focus:outline-none focus:border-cyber-cyan font-mono"
            />
          </div>

          {/* Severity Pills */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-cyber-muted font-mono mr-1">Severity:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => {
                  soundService.playClick();
                  setSelectedSeverity(sev);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-all ${
                  selectedSeverity === sev
                    ? sev === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                      sev === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                      sev === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' :
                      sev === 'low' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                      'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 font-bold'
                    : 'bg-[#09101C] text-cyber-muted hover:text-white border border-cyber-border'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 pt-2 border-t border-cyber-border/60 overflow-x-auto text-xs font-mono">
          <span className="text-cyber-muted text-[11px] whitespace-nowrap">Category:</span>
          {['all', 'Authentication', 'Endpoint', 'Network', 'Firewall', 'Process'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundService.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/40 font-bold'
                  : 'bg-[#09101C] text-cyber-muted hover:text-white border border-cyber-border'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
          <span className="text-cyber-darkMuted text-[11px] ml-auto">
            Showing {filteredEvents.length} of {events.length} events
          </span>
        </div>
      </div>

      {/* Real-time Streaming Table */}
      <div className="cyber-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#09101C] border-b border-cyber-border text-cyber-darkMuted uppercase text-[10px]">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Host / Process</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Source IP → Dest IP</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {filteredEvents.map((evt, idx) => {
                const isJustAdded = evt.id === newestEventId;

                return (
                  <tr
                    key={`${evt.id}-${idx}`}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedEvent(evt);
                    }}
                    className={`cursor-pointer transition-all hover:bg-cyber-panelHover/80 ${
                      isJustAdded ? 'bg-cyber-cyan/15 border-l-4 border-cyber-cyan animate-pulse' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-cyber-cyan whitespace-nowrap">
                      {evt.id}
                    </td>
                    <td className="py-3 px-4 text-cyber-muted whitespace-nowrap">
                      {evt.timestamp.replace('2026-11-22T', '').replace('Z', '')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        evt.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                        evt.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#09101C] border border-cyber-border text-cyber-muted">
                        {evt.event_category}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-white">
                      <span className="text-cyber-cyan font-bold">{evt.hostname}</span>
                      {evt.process_name && (
                        <span className="text-cyber-darkMuted text-[11px] block">{evt.process_name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-cyber-muted whitespace-nowrap">
                      {evt.username}
                    </td>
                    <td className="py-3 px-4 text-cyber-muted whitespace-nowrap text-[11px]">
                      <span className="text-white font-bold">{evt.source_ip}</span> → <span>{evt.dest_ip}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-xs text-cyber-muted max-w-sm truncate">
                      {evt.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Inspector Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-cyber-border flex items-center justify-between bg-[#080D18]/80">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-sm font-bold text-cyber-cyan">{selectedEvent.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  selectedEvent.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  selectedEvent.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                  selectedEvent.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {selectedEvent.severity}
                </span>
                <span className="text-xs text-cyber-muted font-mono">{selectedEvent.timestamp}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-cyber-muted hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
              <div>
                <h4 className="text-cyber-darkMuted uppercase text-[10px] tracking-wider mb-1 font-bold">
                  Description
                </h4>
                <p className="text-white font-sans text-sm bg-[#080D18] p-3 rounded-lg border border-cyber-border">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Entity Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded bg-[#080D18] border border-cyber-border">
                  <div className="text-[10px] text-cyber-darkMuted uppercase">Hostname</div>
                  <div className="text-cyber-cyan font-bold truncate">{selectedEvent.hostname}</div>
                </div>
                <div className="p-2.5 rounded bg-[#080D18] border border-cyber-border">
                  <div className="text-[10px] text-cyber-darkMuted uppercase">Principal User</div>
                  <div className="text-white font-bold truncate">{selectedEvent.username}</div>
                </div>
                <div className="p-2.5 rounded bg-[#080D18] border border-cyber-border">
                  <div className="text-[10px] text-cyber-darkMuted uppercase">Source IP</div>
                  <div className="text-amber-400 font-bold truncate">{selectedEvent.source_ip}</div>
                </div>
                <div className="p-2.5 rounded bg-[#080D18] border border-cyber-border">
                  <div className="text-[10px] text-cyber-darkMuted uppercase">Process Name</div>
                  <div className="text-cyber-violet font-bold truncate">{selectedEvent.process_name || 'N/A'}</div>
                </div>
              </div>

              {/* Raw JSON Payload */}
              <div>
                <div className="text-cyber-darkMuted uppercase text-[10px] tracking-wider mb-1 font-bold flex items-center justify-between">
                  <span>Raw Telemetry Payload (Sensor Output)</span>
                  <span className="text-emerald-400">Validated JSON</span>
                </div>
                <pre className="bg-[#080D18] p-3 rounded-lg border border-cyber-border text-cyber-cyan text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedEvent.raw_payload || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-cyber-border bg-[#080D18]/80 flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyber-muted">
                Simulated Event ID: {selectedEvent.id}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    soundService.playClick();
                    setSelectedEvent(null);
                    onNavigate('copilot');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 text-xs font-mono hover:bg-cyber-cyan/25 transition-colors flex items-center space-x-1"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Analyze with Copilot →</span>
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#080D18] border border-cyber-border text-white text-xs font-mono hover:bg-cyber-panel transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
