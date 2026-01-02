
export interface Participant {
  id: string;
  name: string;
}

export interface Winner {
  id: string;
  name: string;
  prize?: string;
  timestamp: number;
}

export type AppTab = 'input' | 'draw' | 'grouping';

export interface Group {
  id: number;
  name: string;
  members: Participant[];
}
