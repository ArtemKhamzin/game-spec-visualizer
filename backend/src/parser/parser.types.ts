export interface Node {
  id: string;
  type: 'entity' | 'event' | 'rule'; // ✅ добавили 'event'
  data: any;
}

export interface Edge {
  source: string;
  target: string;
  type: string;
}
