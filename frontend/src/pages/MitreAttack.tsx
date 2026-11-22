import React, { useState } from 'react';
import {
  Grid3X3,
  ShieldAlert,
  Search,
  X
} from 'lucide-react';
import { Incident } from '../services/api';
import { soundService } from '../services/sound';

interface MitreAttackProps {
  incidents: Incident[];
  onNavigate: (module: string) => void;
  onSelectIncident: (id: string) => void;
}

interface MatrixColumn {
  tactic: string;
  techniques: Array<{
    id: string;
    name: string;
    description: string;
    detection: string;
  }>;
}

export const MitreAttack: React.FC<MitreAttackProps> = ({
  incidents,
  onNavigate,
  onSelectIncident
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'observed'>('all');
  const [search, setSearch] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<any | null>(null);

  // Aggregate observed & potential techniques across all incidents
  const mappedTechniquesMap = new Map<string, {
    technique_id: string;
    technique_name: string;
    tactic: string;
    confidence: 'confirmed' | 'potential';
    evidence_events: string[];
    description: string;
    incident_id: string;
  }>();

  incidents.forEach(inc => {
    inc.mitre_techniques.forEach(t => {
      mappedTechniquesMap.set(t.technique_id, {
        ...t,
        incident_id: inc.id
      });
    });
  });

  const matrixColumns: MatrixColumn[] = [
    {
      tactic: 'Initial Access',
      techniques: [
        { id: 'T1190', name: 'Exploit Public Application', description: 'Adversaries exploit weaknesses in Internet-facing applications to gain initial code execution.', detection: 'WAF signatures, reverse proxy error bursts, child processes spawned by web server daemons.' },
        { id: 'T1566', name: 'Phishing', description: 'Delivering malicious links or attachments to user mailboxes.', detection: 'Email gateway scanning, suspicious attachment types.' },
        { id: 'T1078', name: 'Valid Accounts', description: 'Adversaries obtain and abuse existing account credentials.', detection: 'Impossible travel anomalies, unexpected logon hours.' }
      ]
    },
    {
      tactic: 'Execution',
      techniques: [
        { id: 'T1204.002', name: 'Malicious File', description: 'User execution of weaponized attachment (e.g. HTA, macro, script).', detection: 'Office applications spawning cmd, powershell, or mshta.' },
        { id: 'T1059.001', name: 'PowerShell', description: 'Execution of PowerShell scripts and base64 encoded command arguments.', detection: 'Script block logging (Event ID 4104), AMSI inspection alerts.' },
        { id: 'T1059.003', name: 'Windows Command Shell', description: 'Execution of cmd.exe commands.', detection: 'Process creation auditing (Event ID 4688).' }
      ]
    },
    {
      tactic: 'Privilege Escalation',
      techniques: [
        { id: 'T1134', name: 'Access Token Manipulation', description: 'Adversaries modify or duplicate security tokens to operate with elevated privileges.', detection: 'Sysmon Event ID 10 (ProcessAccess) with SeDebugPrivilege flags.' },
        { id: 'T1068', name: 'Exploitation for Privilege Escalation', description: 'Exploiting software vulnerabilities in local system kernel or drivers.', detection: 'Unexpected privilege additions in user token.' }
      ]
    },
    {
      tactic: 'Defense Evasion',
      techniques: [
        { id: 'T1078.002', name: 'Domain Accounts', description: 'Abusing valid Domain Admin account to blend in with legitimate enterprise operations.', detection: 'Kerberos TGT requests from foreign or untrusted IP subnets.' },
        { id: 'T1562.001', name: 'Disable Security Tools', description: 'Attempting to terminate antivirus or tamper with AMSI memory.', detection: 'EDR service state transitions, tamper protection logs.' }
      ]
    },
    {
      tactic: 'Credential Access',
      techniques: [
        { id: 'T1110.001', name: 'Password Spraying', description: 'Testing common passwords against multiple domain accounts simultaneously.', detection: 'Multiple 4771 Kerberos pre-auth failures with code 0x18 within a short temporal window.' },
        { id: 'T1003.001', name: 'LSASS Memory Dumping', description: 'Reading memory of lsass.exe to extract plaintext passwords and NTLM hashes.', detection: 'Process handle opened to lsass.exe via rundll32 or comsvcs.dll.' },
        { id: 'T1003.003', name: 'NTDS Database Extraction', description: 'Creating volume shadow copy to extract Active Directory database (ntds.dit).', detection: 'Command-line invocation of ntdsutil.exe with "ifm" parameters.' }
      ]
    },
    {
      tactic: 'Discovery',
      techniques: [
        { id: 'T1083', name: 'File & Directory Discovery', description: 'Enumerating local file systems to find backups, database dumps, and credentials.', detection: 'High volume directory enumeration commands under service accounts.' },
        { id: 'T1018', name: 'Remote System Discovery', description: 'Scanning internal subnets on port 445 (SMB) or 3389 (RDP).', detection: 'Endpoint initiating TCP SYN sweeps to internal /24 subnets.' }
      ]
    },
    {
      tactic: 'Lateral Movement',
      techniques: [
        { id: 'T1021.002', name: 'SMB / Admin Shares', description: 'Leveraging administrative shares (C$, ADMIN$) to move laterally between servers.', detection: 'Event ID 5140 (A network share object was accessed) from non-admin endpoints.' },
        { id: 'T1021.001', name: 'Remote Desktop Protocol', description: 'Adversary connecting to interactive desktop sessions.', detection: 'Logon Type 10 events across internal hosts.' }
      ]
    },
    {
      tactic: 'Exfiltration',
      techniques: [
        { id: 'T1041', name: 'Exfiltration Over C2', description: 'Stealing data by transmitting it over established encrypted command channel.', detection: 'High volume outbound byte count to external non-CDN IP addresses.' },
        { id: 'T1560.001', name: 'Archive via Utility', description: 'Compressing harvested files into tar.gz or zip packages prior to egress.', detection: 'Execution of tar or 7z utilities targeting database backup directories.' }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto text-cyber-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cyber-panel p-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2 font-mono">
              <Grid3X3 className="w-5 h-5 text-cyber-cyan" />
              <span>MITRE ATT&CK Enterprise Matrix</span>
            </h1>
            <span className="text-xs font-mono text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
              v14.1 Enterprise
            </span>
          </div>
          <p className="text-xs text-cyber-muted mt-1">
            Tactics and techniques observed across incidents. Highlighting confirmed evidence vs potential threat mapping.
          </p>
        </div>

        {/* Matrix Filter & Search */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="flex items-center space-x-1 bg-[#09101C] border border-cyber-border rounded-lg p-1">
            <button
              onClick={() => { soundService.playClick(); setFilterMode('all'); }}
              className={`px-3 py-1 rounded transition-colors ${
                filterMode === 'all' ? 'bg-cyber-panel text-white border border-cyber-border font-bold' : 'text-cyber-muted hover:text-white'
              }`}
            >
              All Matrix
            </button>
            <button
              onClick={() => { soundService.playClick(); setFilterMode('observed'); }}
              className={`px-3 py-1 rounded transition-colors ${
                filterMode === 'observed' ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 font-bold' : 'text-cyber-muted hover:text-white'
              }`}
            >
              Observed Only ({mappedTechniquesMap.size})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-cyber-muted" />
            <input
              type="text"
              placeholder="Search techniques (e.g. T1003)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#09101C] border border-cyber-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-cyber-muted focus:outline-none focus:border-cyber-cyan w-48 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Matrix Legend */}
      <div className="flex flex-wrap items-center gap-4 bg-[#09101C] p-3.5 rounded-xl border border-cyber-border text-xs font-mono">
        <span className="text-cyber-darkMuted uppercase font-bold text-[10px]">Mapping Legend:</span>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-cyber-cyan/20 border border-cyber-cyan shadow-glowCyan" />
          <span className="text-white">Confirmed Telemetry ({Array.from(mappedTechniquesMap.values()).filter(t => t.confidence === 'confirmed').length})</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500 border-dashed" />
          <span className="text-white">Potential Mapping ({Array.from(mappedTechniquesMap.values()).filter(t => t.confidence === 'potential').length})</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded bg-cyber-panel border border-cyber-border" />
          <span className="text-cyber-muted">Baseline Framework Technique (Unobserved)</span>
        </div>
      </div>

      {/* MITRE ATT&CK Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 overflow-x-auto pb-4">
        {matrixColumns.map((col) => {
          const matchingTechniques = col.techniques.filter((tech) => {
            const mapped = mappedTechniquesMap.get(tech.id);
            if (filterMode === 'observed' && !mapped) return false;
            if (search) {
              const q = search.toLowerCase();
              return tech.id.toLowerCase().includes(q) || tech.name.toLowerCase().includes(q);
            }
            return true;
          });

          return (
            <div key={col.tactic} className="cyber-panel flex flex-col min-w-[170px]">
              {/* Tactic Header */}
              <div className="p-3 border-b border-cyber-border bg-[#09101C] text-center">
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider truncate">
                  {col.tactic}
                </h3>
                <span className="text-[10px] font-mono text-cyber-darkMuted block">
                  {matchingTechniques.length} techniques
                </span>
              </div>

              {/* Technique Cards */}
              <div className="p-2 space-y-2 flex-1">
                {matchingTechniques.map((tech) => {
                  const mapped = mappedTechniquesMap.get(tech.id);
                  const isConfirmed = mapped?.confidence === 'confirmed';
                  const isPotential = mapped?.confidence === 'potential';

                  return (
                    <div
                      key={tech.id}
                      onClick={() => {
                        soundService.playClick();
                        setSelectedTechnique({
                          ...tech,
                          mappedData: mapped
                        });
                      }}
                      className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                        isConfirmed
                          ? 'bg-cyber-cyan/15 border border-cyber-cyan shadow-glowCyan hover:bg-cyber-cyan/25'
                          : isPotential
                          ? 'bg-amber-500/15 border border-amber-500/60 border-dashed hover:bg-amber-500/25'
                          : 'bg-[#080D18] border border-cyber-border hover:border-cyber-borderLight hover:bg-cyber-panelHover'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className={isConfirmed ? 'text-cyber-cyan font-bold' : isPotential ? 'text-amber-400 font-bold' : 'text-cyber-darkMuted'}>
                          {tech.id}
                        </span>
                        {isConfirmed && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                        )}
                        {isPotential && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <div className="text-xs font-medium text-white leading-tight font-sans line-clamp-2">
                        {tech.name}
                      </div>

                      {mapped && (
                        <div className="mt-1.5 pt-1.5 border-t border-cyber-border/50 text-[9px] font-mono flex items-center justify-between">
                          <span className={isConfirmed ? 'text-cyber-cyan font-bold' : 'text-amber-400'}>
                            {mapped.confidence.toUpperCase()}
                          </span>
                          <span className="text-cyber-muted truncate max-w-[65px]">{mapped.incident_id}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MITRE Technique Details Drawer Modal */}
      {selectedTechnique && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-sm font-bold text-cyber-cyan">{selectedTechnique.id}</span>
                <span className="text-white font-bold text-sm">{selectedTechnique.name}</span>
              </div>
              <button
                onClick={() => setSelectedTechnique(null)}
                className="text-cyber-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Mapping Status Badge */}
              {selectedTechnique.mappedData ? (
                <div className={`p-3 rounded-lg border flex items-center justify-between ${
                  selectedTechnique.mappedData.confidence === 'confirmed'
                    ? 'bg-cyber-cyan/10 border-cyber-cyan/40 text-cyber-cyan'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                }`}>
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>STATUS: {selectedTechnique.mappedData.confidence.toUpperCase()} DETECTION</span>
                  </div>
                  <span className="text-[11px] underline cursor-pointer" onClick={() => {
                    onSelectIncident(selectedTechnique.mappedData.incident_id);
                    onNavigate('investigation');
                    setSelectedTechnique(null);
                  }}>
                    Linked to {selectedTechnique.mappedData.incident_id} →
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-[#080D18] border border-cyber-border text-cyber-muted">
                  No active incidents currently exhibiting this specific technique.
                </div>
              )}

              <div>
                <span className="text-[10px] text-cyber-darkMuted uppercase font-bold block mb-1">
                  Technique Description
                </span>
                <p className="font-sans text-xs text-white leading-relaxed bg-[#080D18] p-3 rounded-lg border border-cyber-border">
                  {selectedTechnique.description}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-cyber-darkMuted uppercase font-bold block mb-1">
                  Detection Guidance & Sensor Telemetry
                </span>
                <p className="font-sans text-xs text-cyber-muted bg-[#080D18] p-3 rounded-lg border border-cyber-border">
                  {selectedTechnique.detection}
                </p>
              </div>

              {selectedTechnique.mappedData?.evidence_events && (
                <div>
                  <span className="text-[10px] text-cyber-darkMuted uppercase font-bold block mb-1">
                    Supporting Sensor Events
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTechnique.mappedData.evidence_events.map((evt: string) => (
                      <span key={evt} className="px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 text-xs font-bold">
                        {evt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-end">
              <button
                onClick={() => setSelectedTechnique(null)}
                className="px-4 py-2 bg-[#080D18] border border-cyber-border text-white text-xs font-mono rounded-lg hover:bg-cyber-panel transition-colors"
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
