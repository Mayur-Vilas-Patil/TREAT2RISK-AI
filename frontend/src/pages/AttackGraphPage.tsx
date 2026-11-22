import React, { useState } from 'react';
import {
  GitGraph,
  User,
  Server,
  Globe,
  Terminal,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Bot
} from 'lucide-react';
import { Incident } from '../services/api';
import { soundService } from '../services/sound';

interface AttackGraphPageProps {
  incidents: Incident[];
  selectedIncidentId: string;
  onSelectIncident: (id: string) => void;
  onNavigate: (module: string) => void;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'user' | 'ip' | 'host' | 'process' | 'event';
  sublabel: string;
  x: number;
  y: number;
  risk: 'critical' | 'high' | 'medium' | 'low';
  details: {
    firstSeen: string;
    description: string;
    relatedEvents: string[];
    isInferred?: boolean;
  };
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  isInferred?: boolean;
}

export const AttackGraphPage: React.FC<AttackGraphPageProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onNavigate
}) => {
  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Generate dynamic graph nodes & edges according to active incident
  const getGraphData = (): { nodes: GraphNode[]; edges: GraphEdge[] } => {
    if (activeIncident.id === 'INC-2026-001') {
      return {
        nodes: [
          {
            id: 'node-ip',
            label: '185.220.101.5',
            type: 'ip',
            sublabel: 'Adversary Exit Node',
            x: 80,
            y: 180,
            risk: 'critical',
            details: {
              firstSeen: '08:14:02Z',
              description: 'External IP originating in Seychelles / Tor VPN. Initiated Kerberos password spray burst.',
              relatedEvents: ['EVT-1001', 'EVT-1002', 'EVT-1003', 'EVT-1004']
            }
          },
          {
            id: 'node-user',
            label: 's.patel',
            type: 'user',
            sublabel: 'Domain Admin Account',
            x: 300,
            y: 180,
            risk: 'critical',
            details: {
              firstSeen: '08:16:11Z',
              description: 'Privileged domain credentials compromised. TGT issued from anomalous foreign IP.',
              relatedEvents: ['EVT-1004', 'EVT-1005']
            }
          },
          {
            id: 'node-host',
            label: 'DC-CORP-01',
            type: 'host',
            sublabel: 'Primary Domain Controller',
            x: 520,
            y: 180,
            risk: 'critical',
            details: {
              firstSeen: '08:14:02Z',
              description: 'Tier 0 infrastructure hosting Active Directory database and enterprise authentication tokens.',
              relatedEvents: ['EVT-1001', 'EVT-1004', 'EVT-1005', 'EVT-1006']
            }
          },
          {
            id: 'node-proc1',
            label: 'powershell.exe',
            type: 'process',
            sublabel: 'AMSI Bypass / Hidden Token',
            x: 740,
            y: 110,
            risk: 'critical',
            details: {
              firstSeen: '08:17:35Z',
              description: 'Hidden PowerShell session executing token impersonation to elevate privileges to SYSTEM.',
              relatedEvents: ['EVT-1005']
            }
          },
          {
            id: 'node-proc2',
            label: 'ntdsutil.exe',
            type: 'process',
            sublabel: 'NTDS.dit Snapshot Tool',
            x: 740,
            y: 260,
            risk: 'critical',
            details: {
              firstSeen: '08:19:20Z',
              description: 'Volume shadow copy IFM snapshot executed to extract all enterprise password hashes.',
              relatedEvents: ['EVT-1006']
            }
          },
          {
            id: 'node-exfil',
            label: '185.220.101.5:443',
            type: 'ip',
            sublabel: 'Staged Exfil Channel',
            x: 960,
            y: 180,
            risk: 'high',
            details: {
              firstSeen: '08:21:05Z',
              description: 'Inferred encrypted exfiltration channel transferring 1.84 MB staged data outbound.',
              relatedEvents: ['EVT-1007'],
              isInferred: true
            }
          }
        ],
        edges: [
          { from: 'node-ip', to: 'node-user', label: '1. Kerberos Password Spray' },
          { from: 'node-user', to: 'node-host', label: '2. TGT Auth Granted' },
          { from: 'node-host', to: 'node-proc1', label: '3. Token Impersonation' },
          { from: 'node-proc1', to: 'node-proc2', label: '4. AD Database Snapshot' },
          { from: 'node-proc2', to: 'node-exfil', label: '5. Possible Exfil Egress', isInferred: true }
        ]
      };
    } else if (activeIncident.id === 'INC-2026-002') {
      return {
        nodes: [
          {
            id: 'node-ip2',
            label: '193.142.146.88',
            type: 'ip',
            sublabel: 'Phishing Delivery Host',
            x: 80,
            y: 180,
            risk: 'high',
            details: {
              firstSeen: '09:02:14Z',
              description: 'Remote payload download server hosting malicious Invoice_Nov26.hta.',
              relatedEvents: ['EVT-2001']
            }
          },
          {
            id: 'node-host2',
            label: 'WS-FIN-042',
            type: 'host',
            sublabel: 'Finance Workstation',
            x: 320,
            y: 180,
            risk: 'high',
            details: {
              firstSeen: '09:02:14Z',
              description: 'Initial foothold endpoint compromised via weaponized email attachment.',
              relatedEvents: ['EVT-2001', 'EVT-2002', 'EVT-2003']
            }
          },
          {
            id: 'node-proc21',
            label: 'mshta.exe',
            type: 'process',
            sublabel: 'Script Host Runner',
            x: 540,
            y: 110,
            risk: 'high',
            details: {
              firstSeen: '09:02:14Z',
              description: 'Child process spawned by Outlook executing inline VBScript/JS.',
              relatedEvents: ['EVT-2001', 'EVT-2002']
            }
          },
          {
            id: 'node-proc22',
            label: 'lsass.exe',
            type: 'process',
            sublabel: 'Target of MiniDump',
            x: 540,
            y: 260,
            risk: 'critical',
            details: {
              firstSeen: '09:04:15Z',
              description: 'Local Security Authority Subsystem targeted for plaintext credential extraction.',
              relatedEvents: ['EVT-2003']
            }
          },
          {
            id: 'node-target2',
            label: 'FS-CORP-02',
            type: 'host',
            sublabel: 'Financial File Server',
            x: 780,
            y: 180,
            risk: 'high',
            details: {
              firstSeen: '09:07:22Z',
              description: 'Target of lateral SMB ADMIN$ connection attempt using harvested credentials.',
              relatedEvents: ['EVT-2004', 'EVT-2005'],
              isInferred: true
            }
          }
        ],
        edges: [
          { from: 'node-ip2', to: 'node-host2', label: '1. Phishing Macro Executed' },
          { from: 'node-host2', to: 'node-proc21', label: '2. Stager Spawned' },
          { from: 'node-proc21', to: 'node-proc22', label: '3. LSASS Dump Intercepted' },
          { from: 'node-proc22', to: 'node-target2', label: '4. Lateral SMB Probe', isInferred: true }
        ]
      };
    } else {
      return {
        nodes: [
          {
            id: 'node-ip3',
            label: '91.240.118.82',
            type: 'ip',
            sublabel: 'Bulletproof ASN 49981',
            x: 80,
            y: 180,
            risk: 'critical',
            details: {
              firstSeen: '10:12:00Z',
              description: 'Origin of CVE-2023-38606 exploit payload and destination of 5.8 GB data exfiltration.',
              relatedEvents: ['EVT-3001', 'EVT-3005']
            }
          },
          {
            id: 'node-host3',
            label: 'WEB-PROD-01',
            type: 'host',
            sublabel: 'Public Web Portal',
            x: 320,
            y: 180,
            risk: 'critical',
            details: {
              firstSeen: '10:12:00Z',
              description: 'Internet-facing Linux server compromised with persistent web shell in uploads folder.',
              relatedEvents: ['EVT-3001', 'EVT-3002', 'EVT-3003']
            }
          },
          {
            id: 'node-proc31',
            label: 'sysinfo.php',
            type: 'process',
            sublabel: 'Web Shell Backdoor',
            x: 540,
            y: 110,
            risk: 'critical',
            details: {
              firstSeen: '10:13:22Z',
              description: 'Executable PHP script dropped to maintain persistent interactive command execution.',
              relatedEvents: ['EVT-3002', 'EVT-3003']
            }
          },
          {
            id: 'node-proc32',
            label: 'tar / gzip',
            type: 'process',
            sublabel: 'Data Archival Utility',
            x: 540,
            y: 260,
            risk: 'high',
            details: {
              firstSeen: '10:17:45Z',
              description: 'Packaged customer database dumps into /tmp/.stage_archive.tgz.',
              relatedEvents: ['EVT-3004']
            }
          },
          {
            id: 'node-c2',
            label: '91.240.118.82:8443',
            type: 'ip',
            sublabel: 'Confirmed Exfil Sink',
            x: 780,
            y: 180,
            risk: 'critical',
            details: {
              firstSeen: '10:20:30Z',
              description: 'High-speed egress connection transferring 5.8 GB of sensitive customer database records.',
              relatedEvents: ['EVT-3005']
            }
          }
        ],
        edges: [
          { from: 'node-ip3', to: 'node-host3', label: '1. RCE Exploit Injected' },
          { from: 'node-host3', to: 'node-proc31', label: '2. Web Shell Dropped' },
          { from: 'node-proc31', to: 'node-proc32', label: '3. DB Backup Packaged' },
          { from: 'node-proc32', to: 'node-c2', label: '4. 5.8 GB Exfiltrated' }
        ]
      };
    }
  };

  const { nodes, edges } = getGraphData();

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4 text-cyber-violet" />;
      case 'host': return <Server className="w-4 h-4 text-cyber-cyan" />;
      case 'ip': return <Globe className="w-4 h-4 text-red-400" />;
      case 'process': return <Terminal className="w-4 h-4 text-amber-400" />;
      default: return <ShieldAlert className="w-4 h-4 text-cyber-cyan" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-cyber-text">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cyber-panel p-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2 font-mono">
              <GitGraph className="w-5 h-5 text-cyber-cyan" />
              <span>Interactive Attack Graph & Progression</span>
            </h1>
            <span className="text-xs font-mono text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
              {activeIncident.id}
            </span>
          </div>
          <p className="text-xs text-cyber-muted mt-1">
            Reconstructed attack topology. Solid links represent confirmed telemetry; dashed links indicate inferred progression.
          </p>
        </div>

        {/* Incident Switcher & Zoom Controls */}
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

          <div className="flex items-center space-x-1 bg-[#09101C] border border-cyber-border rounded-lg p-1">
            <button
              onClick={() => { soundService.playClick(); setZoom(Math.max(0.6, zoom - 0.15)); }}
              className="p-1 rounded hover:bg-cyber-panel text-cyber-muted hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono text-cyber-muted px-1.5">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => { soundService.playClick(); setZoom(Math.min(1.5, zoom + 0.15)); }}
              className="p-1 rounded hover:bg-cyber-panel text-cyber-muted hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => { soundService.playClick(); setZoom(1); }}
              className="p-1 rounded hover:bg-cyber-panel text-cyber-muted hover:text-white"
              title="Reset Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph Canvas */}
      <div className="relative cyber-panel overflow-hidden min-h-[520px] flex items-center justify-center p-4">
        {/* Subtle Cyber Grid Background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#00D5FF 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* SVG Canvas for Edges & Nodes */}
        <svg
          viewBox="0 0 1100 420"
          className="w-full max-w-5xl h-auto transition-transform duration-200 select-none"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <defs>
            <marker
              id="arrow-confirmed"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#00D5FF" />
            </marker>

            <marker
              id="arrow-inferred"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
            </marker>
          </defs>

          {/* Render Connecting Edges */}
          {edges.map((edge, idx) => {
            const sourceNode = nodes.find(n => n.id === edge.from);
            const targetNode = nodes.find(n => n.id === edge.to);
            if (!sourceNode || !targetNode) return null;

            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2;

            return (
              <g key={idx} className="transition-all">
                <path
                  d={`M ${sourceNode.x + 40} ${sourceNode.y + 25} Q ${midX} ${midY - 10} ${targetNode.x - 10} ${targetNode.y + 25}`}
                  stroke={edge.isInferred ? '#F59E0B' : '#00D5FF'}
                  strokeWidth={2}
                  strokeDasharray={edge.isInferred ? '6,4' : undefined}
                  fill="none"
                  markerEnd={edge.isInferred ? 'url(#arrow-inferred)' : 'url(#arrow-confirmed)'}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                />
                <text
                  x={midX}
                  y={midY - 14}
                  fill={edge.isInferred ? '#FCD34D' : '#E2E8F0'}
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="select-none bg-[#080D18] px-1"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => {
                  soundService.playClick();
                  setSelectedNode(node);
                }}
                className="cursor-pointer group"
              >
                {/* Node Box */}
                <rect
                  x="-10"
                  y="0"
                  width="135"
                  height="54"
                  rx="8"
                  fill="#111C2D"
                  stroke={isSelected ? '#00D5FF' : '#1A2A42'}
                  strokeWidth={isSelected ? 2 : 1.5}
                  className="group-hover:stroke-cyber-cyan transition-colors"
                />

                {/* Status Glow bar */}
                <rect
                  x="-10"
                  y="0"
                  width="4"
                  height="54"
                  rx="2"
                  fill={node.risk === 'critical' ? '#EF4444' : '#00D5FF'}
                />

                {/* Node Label Text */}
                <text
                  x="12"
                  y="22"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="select-none group-hover:fill-cyber-cyan transition-colors"
                >
                  {node.label.length > 12 ? node.label.slice(0, 11) + '..' : node.label}
                </text>

                {/* Node Sublabel Text */}
                <text
                  x="12"
                  y="38"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="sans-serif"
                  className="select-none"
                >
                  {node.sublabel.length > 17 ? node.sublabel.slice(0, 16) + '..' : node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Graph Legend Overlay */}
        <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-[#09101C]/90 border border-cyber-border backdrop-blur-md text-[11px] font-mono space-y-1.5 pointer-events-auto">
          <div className="font-bold text-white text-[10px] uppercase tracking-wider mb-1">Graph Legend</div>
          <div className="flex items-center space-x-2 text-cyber-cyan">
            <span className="w-4 h-0.5 bg-cyber-cyan" />
            <span>Solid Line: Confirmed Event Link</span>
          </div>
          <div className="flex items-center space-x-2 text-amber-400">
            <span className="w-4 h-0.5 bg-amber-400 border-dashed border-t-2" />
            <span>Dashed Line: Inferred Kill-Chain Path</span>
          </div>
          <div className="flex items-center space-x-3 pt-1 text-cyber-muted text-[10px]">
            <span>Click any node to inspect evidence</span>
          </div>
        </div>
      </div>

      {/* Node Detail Drawer / Inspection Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div className="flex items-center space-x-2.5">
                {getNodeIcon(selectedNode.type)}
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{selectedNode.label}</h3>
                  <span className="text-[10px] text-cyber-muted font-mono">{selectedNode.sublabel}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-cyber-muted hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#080D18] border border-cyber-border space-y-1">
                <span className="text-[10px] text-cyber-darkMuted uppercase block">Forensic Description</span>
                <p className="font-sans text-xs text-white leading-relaxed">
                  {selectedNode.details.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-[#080D18] border border-cyber-border">
                  <span className="text-cyber-darkMuted text-[10px] block">NODE TYPE</span>
                  <span className="text-cyber-cyan font-bold uppercase">{selectedNode.type}</span>
                </div>
                <div className="p-2.5 rounded bg-[#080D18] border border-cyber-border">
                  <span className="text-cyber-darkMuted text-[10px] block">FIRST OBSERVED</span>
                  <span className="text-white font-bold">{selectedNode.details.firstSeen}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-cyber-darkMuted uppercase block mb-1">
                  Corroborating Event IDs
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.details.relatedEvents.map(evt => (
                    <span
                      key={evt}
                      className="px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 text-xs font-bold"
                    >
                      {evt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-cyber-border flex items-center justify-between">
              <button
                onClick={() => {
                  soundService.playClick();
                  setSelectedNode(null);
                  onNavigate('copilot');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 text-xs font-mono hover:bg-cyber-cyan/25 flex items-center space-x-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Copilot About Node</span>
              </button>

              <button
                onClick={() => setSelectedNode(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#080D18] border border-cyber-border text-white text-xs font-mono hover:bg-cyber-panel transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
