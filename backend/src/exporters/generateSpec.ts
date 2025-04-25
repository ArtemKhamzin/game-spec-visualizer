import { Edge, Node } from 'reactflow';

type NodeData = {
  nodeType: 'entity' | 'event' | 'rule';
  label: string;
  attributes?: any;
  requires?: string;
  effect?: string;
  probability?: string;
  trigger?: string;
  target?: string;
  entityId?: string;
  when?: string;
  temporal?: string;
};

export function graphToSpec(nodes: Node<NodeData>[], edges: Edge[]): string {
  const entityNodes = nodes.filter(n => n.data.nodeType === 'entity');
  
  const ruleNodes   = nodes.filter(n => n.data.nodeType === 'rule');

  const outgoing = (id: string, type: string) =>
    edges.filter(e => e.source === id && e.data?.edgeType === type);
  const incoming = (id: string, type: string) =>
    edges.filter(e => e.target === id && e.data?.edgeType === type);

  const normalizeAttributes = (raw: any): { name: string; value: string }[] => {
    if (Array.isArray(raw)) {
      return raw.map(a => ({ name: a.name, value: a.value }));
    } else if (raw && typeof raw === 'object') {
      return Object.entries(raw).map(([name, val]) => ({
        name,
        value: String(val)
      }));
    }
    return [];
  };

  const renderEntity = (ent: Node<NodeData>): string => {
    const attrsArr = normalizeAttributes(ent.data.attributes);
    const attrsText = attrsArr
      .map(a => `        ${a.name}: ${a.value}`)
      .join('\n');

    const myEvents = outgoing(ent.id, 'owns-event')
      .map(e => nodes.find(n => n.id === e.target))
      .filter((n): n is Node<NodeData> => !!n && n.data.nodeType === 'event');

    const eventsText = myEvents.map(renderEvent).join('\n\n');

    return `Entity ${ent.data.label} {
    State {
${attrsText}
    }

${eventsText}
}`;
  };

  const renderEvent = (ev: Node<NodeData>): string => {
    const lines: string[] = [];
    lines.push(`    Event ${ev.data.label} {`);

    if (ev.data.requires) {
      lines.push(`        Requires: ${ev.data.requires}`);
    }

    outgoing(ev.id, 'target').forEach(e => {
      const tgt = nodes.find(n => n.id === e.target);
      if (tgt) lines.push(`        Target: ${tgt.data.label}`);
    });

    incoming(ev.id, 'trigger').forEach(e => {
      const src = nodes.find(n => n.id === e.source);
      if (src) lines.push(`        Trigger: ${src.data.label}`);
    });

    if (ev.data.effect) {
      lines.push(`        Effect: ${ev.data.effect}`);
    }

    if (ev.data.probability) {
      ev.data.probability
        .split('#end#')
        .map(p => p.trim())
        .filter(Boolean)
        .forEach(p => {
          if (/^P\[.*\]/.test(p)) {
            lines.push(`        ${p}`);
          } else {
            lines.push(`        P[${p}]`);
          }
        });
    }

    lines.push(`    }`);
    return lines.join('\n');
  };

  const renderRule = (r: Node<NodeData>): string => {
    const lines: string[] = [];
    lines.push(`Rule ${r.data.label} {`);
    if (r.data.when)   lines.push(`    When: ${r.data.when}`);
    if (r.data.effect) lines.push(`    Effect: ${r.data.effect}`);

    if (r.data.temporal) {
      r.data.temporal
        .split('#end#')
        .map(t => t.trim())
        .filter(Boolean)
        .forEach(t => lines.push(`    ${t}`));
    }

    lines.push(`}`);
    return lines.join('\n');
  };

  const sections: string[] = [];
  entityNodes.forEach(ent => sections.push(renderEntity(ent)));
  ruleNodes.forEach(rule => sections.push(renderRule(rule)));

  return sections.length ? sections.join('\n\n') : '';
}
