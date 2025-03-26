export interface Node {
  id: string;
  type: 'entity' | 'event' | 'rule';
  data: any;
}

export interface Edge {
  source: string;
  target: string;
  type: string;
}
