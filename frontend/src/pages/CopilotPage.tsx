import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  User,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { Incident, CopilotResponse, api } from '../services/api';
import { soundService } from '../services/sound';

interface CopilotPageProps {
  incidents: Incident[];
  selectedIncidentId: string;
  onSelectIncident: (id: string) => void;
  onNavigate: (module: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  timestamp: string;
  content: string;
  data?: CopilotResponse;
}

export const CopilotPage: React.FC<CopilotPageProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onNavigate
}) => {
  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copilotStatus, setCopilotStatus] = useState<any>({
    mode_name: 'Autonomous Grounded SOC Engine (Deterministic & Zero Hallucination)'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getCopilotStatus().then(setCopilotStatus).catch(() => {});

    if (messages.length === 0 && activeIncident) {
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'copilot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `### Threat2Risk AI Investigation Copilot Active\n**Incident Context**: \`${activeIncident.id}: ${activeIncident.title}\`\n\nI am your evidence-grounded SOC co-pilot. I analyze corroborated logs across endpoint, network, and identity sensors to explain attack stories without hallucinations.\n\nClick any quick prompt below or ask custom questions regarding entities, timeline, risk factors, or remediation actions.`
        }
      ]);
    }
  }, [activeIncident?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isTyping) return;

    soundService.playClick();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      soundService.playScan();
      const res = await api.queryCopilot(text, activeIncident?.id);
      
      const copilotMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: res.response,
        data: res
      };
      setMessages(prev => [...prev, copilotMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'copilot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: 'Unable to query the local SOC knowledge base. Please check backend connection.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "What happened in this incident?",
    "Show suspicious activity associated with this user",
    "Why is this incident classified as high risk?",
    "What evidence supports this conclusion?",
    "Which assets may be affected by the blast radius?",
    "Map this activity to MITRE ATT&CK",
    "What should I investigate next?",
    "Generate an executive incident summary"
  ];

  return (
    <div className="p-6 space-y-4 max-w-[1500px] mx-auto h-[calc(100vh-4rem)] flex flex-col text-cyber-text">
      {/* Top Header & Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cyber-panel p-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 shadow-glowCyan">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white tracking-tight font-mono">AI Investigation Copilot</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {copilotStatus.mode_name}
              </span>
            </div>
            <p className="text-xs text-cyber-muted mt-0.5">
              Grounded conversational analysis with verifiable event citations and zero hallucination.
            </p>
          </div>
        </div>

        {/* Active Incident Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-cyber-muted">Context:</span>
          <select
            value={activeIncident?.id}
            onChange={(e) => {
              soundService.playClick();
              onSelectIncident(e.target.value);
            }}
            className="bg-[#09101C] border border-cyber-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none cursor-pointer"
          >
            {incidents.map(inc => (
              <option key={inc.id} value={inc.id}>
                {inc.id}: {inc.title.slice(0, 30)}...
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              soundService.playClick();
              setMessages([]);
            }}
            className="p-1.5 rounded-lg bg-[#09101C] border border-cyber-border text-cyber-muted hover:text-white"
            title="Clear Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="flex-1 cyber-panel p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono ${
                isUser
                  ? 'bg-cyber-violet/20 border border-cyber-violet/40 text-cyber-violet'
                  : 'bg-cyber-cyan/20 border border-cyber-cyan/40 text-cyber-cyan shadow-glowCyan'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-3xl rounded-xl p-4 space-y-3 ${
                isUser
                  ? 'bg-cyber-violet/15 border border-cyber-violet/30 text-white'
                  : 'bg-[#080D18] border border-cyber-border text-cyber-text'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono text-cyber-darkMuted border-b border-cyber-border/50 pb-1.5">
                  <span className="font-bold text-white">
                    {isUser ? 'Lead SOC Analyst' : 'Threat2Risk AI Copilot'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Rendered Text Body */}
                <div className="text-xs leading-relaxed font-sans space-y-2 whitespace-pre-line">
                  {msg.content}
                </div>

                {/* Grounded Metadata Pill Strip (Copilot responses) */}
                {msg.data && (
                  <div className="pt-3 border-t border-cyber-border/60 space-y-2.5 font-mono text-[11px]">
                    {/* Supporting Event IDs */}
                    {msg.data.supporting_event_ids && msg.data.supporting_event_ids.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-cyber-darkMuted uppercase text-[10px]">Citations:</span>
                        {msg.data.supporting_event_ids.map(eid => (
                          <button
                            key={eid}
                            onClick={() => {
                              soundService.playClick();
                              onNavigate('events');
                            }}
                            className="px-2 py-0.5 rounded bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan border border-cyber-cyan/30 text-[10px] font-bold transition-colors flex items-center space-x-1"
                          >
                            <span>{eid}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Confidence & Entities */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center space-x-2 text-cyber-muted">
                        <span>Confidence:</span>
                        <strong className="text-emerald-400">{msg.data.confidence}</strong>
                      </div>
                      {msg.data.related_entities && (
                        <div className="text-cyber-darkMuted">
                          Entities: <span className="text-white">{msg.data.related_entities.slice(0, 3).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Actionable recommendations */}
                    {msg.data.recommended_actions && msg.data.recommended_actions.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-[#09101C] border border-cyber-border space-y-1">
                        <span className="text-[10px] uppercase font-bold text-cyber-cyan block">
                          Suggested Investigation & Containment Actions:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-cyber-muted font-sans text-xs">
                          {msg.data.recommended_actions.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center space-x-3 text-xs font-mono text-cyber-cyan">
            <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-lg bg-[#080D18] border border-cyber-border flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
              <span>Analyzing correlated sensor logs and synthesizing grounded explanation...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Chips Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1 shrink-0 font-mono">
        <span className="text-[11px] text-cyber-darkMuted whitespace-nowrap uppercase">
          Quick Prompts:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-lg bg-[#09101C] border border-cyber-border hover:border-cyber-cyan/50 text-[11px] font-sans text-cyber-muted hover:text-white whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* User Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2 shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ask a question about this incident (e.g., 'What happened in this incident?', 'Why is risk high?')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isTyping}
            className="w-full bg-cyber-panel border border-cyber-border rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder:text-cyber-muted focus:outline-none focus:border-cyber-cyan shadow-inner font-sans"
          />
        </div>
        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="px-5 py-3 rounded-xl bg-cyber-cyan text-cyber-bg font-bold font-mono text-xs shadow-glowCyan hover:bg-cyber-cyan/90 disabled:opacity-50 transition-all flex items-center space-x-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
