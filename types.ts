export interface Source {
  title: string;
  uri: string;
}

export interface PersonProfile {
  name: string;
  role: string;
  cultScore: number; // 0 to 10
  diagnosis: string;
  background: string;
  conspiracies: string;
  verdict: 'SAFE' | 'CAUTION' | 'DANGER' | 'CULT_LEADER';
  imageUrl?: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
    telegram?: string;
    farcaster?: string;
  };
}

export interface AnalysisResult {
  protocol: string;
  summary: string;
  profiles: PersonProfile[];
  sources: Source[];
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}