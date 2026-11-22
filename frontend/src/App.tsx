import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SearchModal } from './components/layout/SearchModal';

import { Overview } from './pages/Overview';
import { LiveMonitor } from './pages/LiveMonitor';
import { SecurityEvents } from './pages/SecurityEvents';
import { IncidentWorkspace } from './pages/IncidentWorkspace';
import { AttackGraphPage } from './pages/AttackGraphPage';
import { MitreAttack } from './pages/MitreAttack';
import { RiskIntelligence } from './pages/RiskIntelligence';
import { CopilotPage } from './pages/CopilotPage';
import { ResponseSimulator } from './pages/ResponseSimulator';
import { ThreatReports } from './pages/ThreatReports';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { UserProfile, PRESET_USERS } from './types/auth';

import { Incident, SecurityEvent, api } from './services/api';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('t2r_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return PRESET_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('t2r_auth') === 'true';
  });

  const [currentModule, setCurrentModule] = useState<string>('overview');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-2026-001');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial dataset
  const loadData = useCallback(async () => {
    try {
      const [incRes, evtRes] = await Promise.all([
        api.getIncidents(),
        api.getEvents({ limit: 100 })
      ]);
      setIncidents(incRes.incidents || []);
      setEvents(evtRes.events || []);
      if (incRes.incidents && incRes.incidents.length > 0) {
        setSelectedIncidentId(prev => {
          const exists = incRes.incidents.some((i: Incident) => i.id === prev);
          return exists ? prev : incRes.incidents[0].id;
        });
      }
    } catch {
      // offline or loading error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen to WebSocket broadcasts for real-time live events
    const disconnectWs = api.connectWebSocket((msg) => {
      if (msg.type === 'NEW_EVENT' && msg.event) {
        setEvents(prev => {
          if (prev.some(e => e.id === msg.event.id)) return prev;
          return [msg.event, ...prev.slice(0, 199)];
        });
      } else if (msg.type === 'INCIDENT_UPDATED' && msg.incident) {
        setIncidents(prev => prev.map(i => i.id === msg.incident.id ? msg.incident : i));
      } else if (msg.type === 'DEMO_RESET') {
        loadData();
      }
    });

    return () => {
      disconnectWs();
    };
  }, [loadData]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('t2r_auth', 'true');
    localStorage.setItem('t2r_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('t2r_auth');
  };

  const handleIncidentUpdated = (updated: Incident) => {
    setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleNewEvent = (evt: SecurityEvent) => {
    setEvents(prev => {
      if (prev.some(e => e.id === evt.id)) return prev;
      return [evt, ...prev.slice(0, 199)];
    });
  };

  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'Closed').length;
  const activeCount = incidents.filter(i => i.status !== 'Closed').length;

  // Render Login Gateway if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-cyber-bg text-cyber-text flex flex-col font-sans selection:bg-cyber-cyan selection:text-cyber-bg">
      {/* Top Navigation */}
      <Navbar
        currentModule={currentModule}
        onNavigate={setCurrentModule}
        onOpenSearch={() => setIsSearchOpen(true)}
        incidentsCount={incidents.length}
        criticalCount={criticalCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Body: Fixed 250px Sidebar + Active Module Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentModule={currentModule}
          onNavigate={setCurrentModule}
          activeIncidentsCount={activeCount}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Workspace Display Area */}
        <main className="flex-1 overflow-y-auto bg-cyber-bg">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-cyber-cyan font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping mr-2" />
              Initializing Threat2Risk Cyber Intelligence Platform...
            </div>
          ) : (
            <>
              {currentModule === 'overview' && (
                <Overview
                  incidents={incidents}
                  events={events}
                  onSelectIncident={(id) => { setSelectedIncidentId(id); }}
                  onNavigate={setCurrentModule}
                />
              )}

              {currentModule === 'live-monitor' && (
                <LiveMonitor
                  events={events}
                  onNewEvent={handleNewEvent}
                  onNavigate={setCurrentModule}
                  onSelectIncident={(id) => { setSelectedIncidentId(id); }}
                />
              )}

              {currentModule === 'events' && (
                <SecurityEvents
                  events={events}
                  onNavigate={setCurrentModule}
                  onSelectIncident={(id) => { setSelectedIncidentId(id); }}
                />
              )}

              {currentModule === 'investigation' && (
                <IncidentWorkspace
                  incidents={incidents}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={setSelectedIncidentId}
                  onNavigate={setCurrentModule}
                  onIncidentUpdated={handleIncidentUpdated}
                />
              )}

              {currentModule === 'attack-graph' && (
                <AttackGraphPage
                  incidents={incidents}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={setSelectedIncidentId}
                  onNavigate={setCurrentModule}
                />
              )}

              {currentModule === 'mitre' && (
                <MitreAttack
                  incidents={incidents}
                  onNavigate={setCurrentModule}
                  onSelectIncident={(id) => { setSelectedIncidentId(id); }}
                />
              )}

              {currentModule === 'risk' && (
                <RiskIntelligence
                  incidents={incidents}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={setSelectedIncidentId}
                  onNavigate={setCurrentModule}
                />
              )}

              {currentModule === 'copilot' && (
                <CopilotPage
                  incidents={incidents}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={setSelectedIncidentId}
                  onNavigate={setCurrentModule}
                />
              )}

              {currentModule === 'simulator' && (
                <ResponseSimulator
                  incidents={incidents}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={setSelectedIncidentId}
                  onNavigate={setCurrentModule}
                />
              )}

              {currentModule === 'reports' && (
                <ThreatReports
                  incidents={incidents}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={setSelectedIncidentId}
                  onNavigate={setCurrentModule}
                />
              )}

              {currentModule === 'settings' && (
                <SettingsPage
                  onResetComplete={loadData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        incidents={incidents}
        events={events}
        onSelectIncident={setSelectedIncidentId}
        onNavigate={setCurrentModule}
      />
    </div>
  );
}

export default App;
