export interface UserProfile {
  name: string;
  email: string;
  role: string;
  tier: string;
  clearance: string;
  avatar: string;
}

export const PRESET_USERS: UserProfile[] = [
  {
    name: 'Alex Vance',
    email: 'alex.vance@defense.soc',
    role: 'Lead Incident Commander',
    tier: 'Tier 3 SOC Lead',
    clearance: 'TOP SECRET // NOFORN',
    avatar: 'AV'
  },
  {
    name: 'Jordan Lee',
    email: 'jordan.lee@threat.soc',
    role: 'Senior Threat Hunter',
    tier: 'Tier 2 SOC Analyst',
    clearance: 'SECRET // NATO READY',
    avatar: 'JL'
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@intel.soc',
    role: 'Threat Intelligence Architect',
    tier: 'Tier 3 Intel Lead',
    clearance: 'TOP SECRET // SPECIAL ACCESS',
    avatar: 'ER'
  },
  {
    name: 'SIH Evaluator',
    email: 'juror@sih2026.gov.in',
    role: 'Smart India Hackathon Juror',
    tier: 'Jury Evaluation Access',
    clearance: 'EXECUTIVE DISCLOSURE',
    avatar: 'SIH'
  }
];
