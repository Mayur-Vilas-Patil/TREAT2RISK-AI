import React, { useState, useEffect } from 'react';
import { Search, X, ShieldAlert, Server, User } from 'lucide-react';
import { Incident, SecurityEvent } from '../../services/api';
import { soundService } from '../../services/sound';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  events: SecurityEvent[];
  onSelectIncident: (id: string) => void;
  onNavigate: (module: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  incidents,
  events,
  onSelectIncident,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingIncidents = q ? incidents.filter(i => 
    i.id.toLowerCase().includes(q) ||
    i.title.toLowerCase().includes(q) ||
    i.affected_hosts.some(h => h.toLowerCase().includes(q)) ||
    i.affected_users.some(u => u.toLowerCase().includes(q)) ||
    i.source_ips.some(ip => ip.includes(q))
  ) : incidents.slice(0, 3);

  const matchingHosts = q ? Array.from(new Set([
    ...incidents.flatMap(i => i.affected_hosts),
    ...events.map(e => e.hostname)
  ])).filter(h => h.toLowerCase().includes(q)) : ['DC-CORP-01', 'WS-FIN-042', 'WEB-PROD-01'];

  const matchingUsers = q ? Array.from(new Set([
    ...incidents.flatMap(i => i.affected_users),
    ...events.map(e => e.username)
  ])).filter(u => u.toLowerCase().includes(q)) : ['s.patel', 'm.reed', 'www-data'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-[#111C2D] border border-cyber-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-cyber-border flex items-center space-x-3 bg-[#080D18]/80">
          <Search className="w-5 h-5 text-cyber-cyan" />
          <input
            type="text"
            placeholder="Search incidents, IPs, hosts, usernames, or MITRE IDs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-cyber-muted font-sans"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-cyber-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-cyber-panel border border-cyber-border rounded text-cyber-darkMuted">ESC</kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyber-darkMuted mb-2 flex items-center justify-between">
              <span>Security Incidents</span>
              <span>{matchingIncidents.length} found</span>
            </div>
            <div className="space-y-1.5">
              {matchingIncidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => {
                    soundService.playClick();
                    onSelectIncident(inc.id);
                    onNavigate('investigation');
                    onClose();
                  }}
                  className="p-3 rounded-lg bg-[#080D18] border border-cyber-border hover:border-cyber-cyan/50 hover:bg-cyber-panelHover cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className={`w-4 h-4 ${inc.severity === 'critical' ? 'text-cyber-critical' : 'text-cyber-high'}`} />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyber-cyan transition-colors">
                        <span className="font-mono text-cyber-cyan mr-2">{inc.id}</span>
                        {inc.title}
                      </div>
                      <div className="text-[11px] text-cyber-muted font-mono">
                        Hosts: {inc.affected_hosts.join(', ')} • Users: {inc.affected_users.join(', ')}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    inc.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  }`}>
                    Risk {inc.risk_score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Entity Jumps: Hosts & Users */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-cyber-border">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyber-darkMuted mb-1.5 flex items-center space-x-1.5">
                <Server className="w-3 h-3 text-cyber-cyan" />
                <span>Host Assets</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchingHosts.slice(0, 6).map(h => (
                  <button
                    key={h}
                    onClick={() => {
                      soundService.playClick();
                      onNavigate('attack-graph');
                      onClose();
                    }}
                    className="px-2 py-1 rounded bg-[#080D18] border border-cyber-border hover:border-cyber-cyan/40 text-[11px] font-mono text-cyber-muted hover:text-white transition-colors"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyber-darkMuted mb-1.5 flex items-center space-x-1.5">
                <User className="w-3 h-3 text-cyber-violet" />
                <span>User Accounts</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchingUsers.slice(0, 6).map(u => (
                  <button
                    key={u}
                    onClick={() => {
                      soundService.playClick();
                      onNavigate('events');
                      onClose();
                    }}
                    className="px-2 py-1 rounded bg-[#080D18] border border-cyber-border hover:border-cyber-violet/40 text-[11px] font-mono text-cyber-muted hover:text-white transition-colors"
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-cyber-border bg-[#080D18] text-[11px] font-mono text-cyber-darkMuted flex items-center justify-between">
          <span>Navigate with arrows • Enter to inspect</span>
          <button onClick={onClose} className="hover:text-white">Close [ESC]</button>
        </div>
      </div>
    </div>
  );
};
