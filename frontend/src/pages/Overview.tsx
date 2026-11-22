import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Server,
  Globe,
  Clock,
  Activity,
  ArrowUpRight,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Radio,
  Search,
  Filter,
  CheckCircle,
  Flame,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';
import { Incident, SecurityEvent } from '../services/api';
import { soundService } from '../services/sound';

interface OverviewProps {
  incidents: Incident[];
  events: SecurityEvent[];
  onSelectIncident: (id: string) => void;
  onNavigate: (module: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  incidents,
  events,
  onSelectIncident,
  onNavigate
}) => {
  const [activitySearch, setActivitySearch] = useState('');
  const [activitySeverity, setActivitySeverity] = useState('all');

  // KPIs calculated from real data
  const totalEvents = events.length;
  const activeIncidents = incidents.filter(i => i.status !== 'Closed').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
  
  const highRiskAssets = Array.from(new Set(
    incidents.filter(i => i.severity === 'critical' || i.severity === 'high')
      .flatMap(i => i.affected_hosts)
  ));

  const suspiciousIPs = Array.from(new Set(
    incidents.flatMap(i => i.source_ips).filter(ip => !ip.startsWith('10.'))
  ));

  const primaryIncident = incidents.find(i => i.severity === 'critical') || incidents[0];

  // A. Security Events Over Time
  const timelineData = [
    { time: '08:00', total: 14, attacks: 4 },
    { time: '08:15', total: 42, attacks: 28 }, // Incident A spray
    { time: '08:30', total: 19, attacks: 8 },
    { time: '08:45', total: 12, attacks: 3 },
    { time: '09:00', total: 38, attacks: 22 }, // Incident B malware
    { time: '09:15', total: 21, attacks: 9 },
    { time: '09:30', total: 16, attacks: 5 },
    { time: '09:45', total: 14, attacks: 4 },
    { time: '10:00', total: 26, attacks: 14 },
    { time: '10:15', total: 52, attacks: 38 }, // Incident C web exploit
    { time: '10:30', total: 20, attacks: 7 },
  ];

  // B. Threat Severity Distribution
  const severityCounts = {
    critical: events.filter(e => e.severity === 'critical').length,
    high: events.filter(e => e.severity === 'high').length,
    medium: events.filter(e => e.severity === 'medium').length,
    low: events.filter(e => e.severity === 'low').length,
  };

  const donutData = [
    { name: 'Critical', value: severityCounts.critical || 4, color: '#EF4444' },
    { name: 'High', value: severityCounts.high || 6, color: '#F97316' },
    { name: 'Medium', value: severityCounts.medium || 5, color: '#F59E0B' },
    { name: 'Low', value: severityCounts.low || 8, color: '#10B981' },
  ];

  // C. Incident Creation vs Containment Trend
  const incidentTrendData = [
    { day: 'Mon', detected: 2, contained: 2 },
    { day: 'Tue', detected: 4, contained: 3 },
    { day: 'Wed', detected: 1, contained: 2 },
    { day: 'Thu', detected: 3, contained: 2 },
    { day: 'Fri', detected: 5, contained: 4 },
    { day: 'Sat', detected: 2, contained: 1 },
    { day: 'Sun', detected: 3, contained: 1 },
  ];

  // D. Top Threat Sources
  const threatSources = [
    { ip: '185.220.101.5', geo: 'Seychelles / Tor Exit', target: 'DC-CORP-01', attempts: 18, risk: 'Critical', incidentId: 'INC-2026-001' },
    { ip: '91.240.118.82', geo: 'Bulletproof ASN 49981', target: 'WEB-PROD-01', attempts: 12, risk: 'Critical', incidentId: 'INC-2026-003' },
    { ip: '193.142.146.88', geo: 'Offshore Staging VPS', target: 'WS-FIN-042', attempts: 9, risk: 'High', incidentId: 'INC-2026-002' },
    { ip: '45.154.255.8', geo: 'Netherlands / VPN', target: 'GATEWAY-01', attempts: 6, risk: 'Medium', incidentId: null },
  ];

  // Filtered recent activity
  const filteredEvents = events.filter(e => {
    if (activitySeverity !== 'all' && e.severity.toLowerCase() !== activitySeverity.toLowerCase()) return false;
    if (activitySearch) {
      const q = activitySearch.toLowerCase();
      return (
        e.id.toLowerCase().includes(q) ||
        e.source_ip.toLowerCase().includes(q) ||
        e.username.toLowerCase().includes(q) ||
        e.hostname.toLowerCase().includes(q) ||
        e.event_category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-cyber-text">
      {/* 1. Header & Live SOC Status Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-3">
            <span>SOC Command Center</span>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
              DEFCON 2
            </span>
          </h1>
          <p className="text-xs text-cyber-muted mt-1">
            Unified Security Monitoring, Attack Correlation & Risk Intelligence.
          </p>
        </div>

        {/* Professional Status Panel */}
        <div className="flex flex-wrap items-center gap-3 bg-cyber-panel border border-cyber-border rounded-xl p-2.5 text-xs font-mono">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#09101C] border border-cyber-border">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-cyber-muted text-[11px]">Monitoring:</span>
            <span className="text-white font-semibold">Active Stream</span>
          </div>

          <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#09101C] border border-cyber-border">
            <span className="text-cyber-muted text-[11px]">Sensors:</span>
            <span className="text-cyber-cyan font-semibold">4 Active (EDR, WAF, AD, Net)</span>
          </div>

          <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#09101C] border border-cyber-border">
            <span className="text-cyber-muted text-[11px]">Ingestion:</span>
            <span className="text-white font-semibold">14.2 EPS</span>
          </div>

          <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#09101C] border border-cyber-border">
            <span className="text-cyber-muted text-[11px]">Last Sync:</span>
            <span className="text-emerald-400 font-semibold">Live (UTC)</span>
          </div>
        </div>
      </div>

      {/* 2. Featured Active Incident Alert Card */}
      {primaryIncident && (
        <div className="bg-gradient-to-r from-red-950/60 via-cyber-panel to-cyber-panel border border-red-500/50 rounded-xl p-5 shadow-glowCritical transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 mt-0.5 shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-red-400">{primaryIncident.id}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 uppercase">
                    CRITICAL SEVERITY
                  </span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                    RISK SCORE {primaryIncident.risk_score}/100
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {primaryIncident.title}
                </h3>
                <p className="text-xs text-cyber-muted font-sans max-w-4xl line-clamp-2">
                  {primaryIncident.summary}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-cyber-darkMuted pt-1">
                  <span>Target Asset: <strong className="text-white">{primaryIncident.affected_hosts.join(', ')}</strong></span>
                  <span>•</span>
                  <span>Origin IP: <strong className="text-red-400">{primaryIncident.source_ips.join(', ')}</strong></span>
                  <span>•</span>
                  <span>Compromised User: <strong className="text-white">{primaryIncident.affected_users.join(', ')}</strong></span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-3">
              <button
                onClick={() => {
                  soundService.playAlert();
                  onSelectIncident(primaryIncident.id);
                  onNavigate('investigation');
                }}
                className="px-4 py-2.5 rounded-lg bg-cyber-critical hover:bg-red-600 text-white font-mono text-xs font-bold transition-all shadow-glowCritical flex items-center space-x-2"
              >
                <span>Investigate Incident</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Six Separate KPI Cards (12-column grid: 2 cols each on lg) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Events */}
        <div className="cyber-panel-interactive p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyber-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Events</span>
            <Activity className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">{totalEvents}</div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center mt-0.5">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.2 EPS
            </span>
          </div>
          <div className="text-[10px] text-cyber-darkMuted">Correlated Telemetry Logs</div>
        </div>

        {/* Card 2: Active Incidents */}
        <div className="cyber-panel-interactive p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyber-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-cyber-high" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">{activeIncidents}</div>
            <span className="text-[10px] font-mono text-cyber-high flex items-center mt-0.5">
              3 Confirmed Chains
            </span>
          </div>
          <div className="text-[10px] text-cyber-darkMuted">Under SOC Investigation</div>
        </div>

        {/* Card 3: Critical Incidents */}
        <div className="cyber-panel-interactive p-4 flex flex-col justify-between border-red-500/30">
          <div className="flex items-center justify-between text-cyber-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider text-red-400">Critical Incidents</span>
            <ShieldAlert className="w-4 h-4 text-cyber-critical" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-cyber-critical">{criticalIncidents}</div>
            <span className="text-[10px] font-mono text-red-400 flex items-center mt-0.5">
              P0 Action Required
            </span>
          </div>
          <div className="text-[10px] text-cyber-darkMuted">Domain / DB Impact</div>
        </div>

        {/* Card 4: High-Risk Assets */}
        <div className="cyber-panel-interactive p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyber-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">High-Risk Assets</span>
            <Server className="w-4 h-4 text-cyber-violet" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">{highRiskAssets.length || 3}</div>
            <span className="text-[10px] font-mono text-cyber-violet flex items-center mt-0.5">
              Tier 0 & Tier 1
            </span>
          </div>
          <div className="text-[10px] text-cyber-darkMuted truncate">{highRiskAssets.slice(0, 2).join(', ')}</div>
        </div>

        {/* Card 5: Suspicious IPs */}
        <div className="cyber-panel-interactive p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyber-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">Suspicious IPs</span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">{suspiciousIPs.length || 3}</div>
            <span className="text-[10px] font-mono text-amber-400 flex items-center mt-0.5">
              Adversary Nodes
            </span>
          </div>
          <div className="text-[10px] text-cyber-darkMuted">Perimeter Block Candidate</div>
        </div>

        {/* Card 6: MTTI */}
        <div className="cyber-panel-interactive p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyber-muted">
            <span className="text-[11px] font-mono uppercase tracking-wider">MTTI (Mean Time)</span>
            <Clock className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">4.2 <span className="text-xs font-normal text-cyber-muted">min</span></div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center mt-0.5">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> -68% vs baseline
            </span>
          </div>
          <div className="text-[10px] text-cyber-darkMuted">Autonomous Correlation</div>
        </div>
      </div>

      {/* 4. Real Charts (12-column grid: 7 cols & 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* A. Security Events Over Time Area Chart (7 columns) */}
        <div className="lg:col-span-7 cyber-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <span>Security Events Over Time</span>
                <span className="text-[10px] text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-1.5 py-0.2 rounded font-normal">
                  24h Telemetry
                </span>
              </h3>
              <p className="text-xs text-cyber-muted">Total ingested sensor volume vs correlated threat spikes</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1.5 text-cyber-cyan">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyber-cyan" />
                <span>Ingested</span>
              </span>
              <span className="flex items-center space-x-1.5 text-cyber-critical">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyber-critical" />
                <span>Correlated Attack</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00D5FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="areaAttack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1A2A42" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111C2D', borderColor: '#1A2A42', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey="total" stroke="#00D5FF" strokeWidth={2} fillOpacity={1} fill="url(#areaTotal)" name="Ingested Events" />
                <Area type="monotone" dataKey="attacks" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#areaAttack)" name="Correlated Attacks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. Threat Severity Distribution Donut Chart (5 columns) */}
        <div className="lg:col-span-5 cyber-panel p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono">Threat Severity Distribution</h3>
              <p className="text-xs text-cyber-muted">Classification of {totalEvents} ingested events</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#09101C] text-cyber-muted border border-cyber-border">
              All Sensors
            </span>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111C2D', borderColor: '#1A2A42', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono text-cyber-muted uppercase">TOTAL</span>
              <span className="text-2xl font-bold font-mono text-white">{totalEvents}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyber-border/60 text-xs font-mono">
            {donutData.map(d => (
              <div key={d.name} className="flex items-center justify-between p-1.5 rounded bg-[#09101C] border border-cyber-border/40">
                <span className="flex items-center space-x-1.5 text-cyber-muted">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                  <span>{d.name}</span>
                </span>
                <span className="text-white font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Second Chart Row: Incident Trend & Top Threat Ingress Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* C. Incident Trend Bar Chart (5 columns) */}
        <div className="lg:col-span-5 cyber-panel p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyber-cyan" />
                <span>Incident Creation vs Containment</span>
              </h3>
              <p className="text-xs text-cyber-muted">Weekly MTTC containment throughput</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1A2A42" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111C2D', borderColor: '#1A2A42', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="detected" fill="#F97316" name="Detected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contained" fill="#10B981" name="Contained" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] font-mono text-cyber-darkMuted pt-2 border-t border-cyber-border/60 flex justify-between">
            <span>Average Resolution: 18m</span>
            <span className="text-emerald-400">SOC SLA Met 94%</span>
          </div>
        </div>

        {/* D. Top Threat Ingress Sources Table (7 columns) */}
        <div className="lg:col-span-7 cyber-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
                <Globe className="w-4 h-4 text-red-400" />
                <span>Top Threat Ingress Sources</span>
              </h3>
              <p className="text-xs text-cyber-muted">Correlated origin addresses linked to multi-stage incident scenarios</p>
            </div>
            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('simulator');
              }}
              className="text-xs text-cyber-cyan hover:underline font-mono"
            >
              Simulate Perimeter Block →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cyber-border text-cyber-darkMuted font-mono uppercase text-[10px]">
                  <th className="pb-2">Source IP</th>
                  <th className="pb-2">ASN / Geolocation</th>
                  <th className="pb-2">Target Host</th>
                  <th className="pb-2">Events</th>
                  <th className="pb-2">Linked Incident</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/40 font-mono text-xs">
                {threatSources.map((ts) => (
                  <tr key={ts.ip} className="hover:bg-cyber-panelHover/60 transition-colors">
                    <td className="py-2.5 font-bold text-white flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span>{ts.ip}</span>
                    </td>
                    <td className="py-2.5 text-cyber-muted font-sans text-xs">{ts.geo}</td>
                    <td className="py-2.5 text-cyber-cyan">{ts.target}</td>
                    <td className="py-2.5 text-white font-bold">{ts.attempts}</td>
                    <td className="py-2.5">
                      {ts.incidentId ? (
                        <button
                          onClick={() => {
                            soundService.playClick();
                            onSelectIncident(ts.incidentId!);
                            onNavigate('investigation');
                          }}
                          className="text-cyber-cyan hover:underline flex items-center space-x-1"
                        >
                          <span>{ts.incidentId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-cyber-darkMuted">Uncorrelated</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => {
                          soundService.playClick();
                          onNavigate('simulator');
                        }}
                        className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition-colors"
                      >
                        Simulate Block
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. Recent Security Activity Professional Event Table */}
      <div className="cyber-panel p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyber-cyan" />
              <span>Recent Security Activity Feed</span>
              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
            </h3>
            <p className="text-xs text-cyber-muted">Streaming chronologically from endpoint, identity, and firewall agents</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-cyber-muted" />
              <input
                type="text"
                placeholder="Search events..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="bg-[#09101C] border border-cyber-border rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder:text-cyber-muted focus:outline-none focus:border-cyber-cyan font-mono w-44"
              />
            </div>

            <select
              value={activitySeverity}
              onChange={(e) => {
                soundService.playClick();
                setActivitySeverity(e.target.value);
              }}
              className="bg-[#09101C] border border-cyber-border rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              onClick={() => {
                soundService.playClick();
                onNavigate('events');
              }}
              className="text-xs text-cyber-cyan hover:underline font-mono pl-2"
            >
              View All {totalEvents} Events →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#09101C] border-b border-cyber-border text-cyber-darkMuted uppercase text-[10px]">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Host</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/40">
              {filteredEvents.slice(0, 7).map((e, idx) => (
                <tr key={`${e.id}-${idx}`} className="hover:bg-cyber-panelHover/60 transition-colors">
                  <td className="py-2 px-3 text-cyber-muted whitespace-nowrap">
                    {e.timestamp.replace('2026-11-22T', '').replace('Z', ' UTC')}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      e.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      e.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                      e.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {e.severity}
                    </span>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#09101C] border border-cyber-border text-cyber-muted">
                      {e.event_category}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-cyber-cyan whitespace-nowrap">
                    {e.source_ip}
                  </td>
                  <td className="py-2 px-3 text-white whitespace-nowrap">
                    {e.username}
                  </td>
                  <td className="py-2 px-3 text-cyber-cyan whitespace-nowrap">
                    {e.hostname}
                  </td>
                  <td className="py-2 px-3 font-sans text-xs text-cyber-muted max-w-sm truncate">
                    {e.description}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                      CAPTURED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
