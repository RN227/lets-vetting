// Type definitions for LetsVet

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
}

export interface TriageSession {
  id: string;
  petId: string;
  symptoms: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  timestamp: Date;
}
