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
};

export function graphToSpec(nodes: Node<NodeData>[], edges: Edge[]): string {
  const entityNodes = nodes.filter(n => n.data.nodeType === 'entity');
  const eventNodes  = nodes.filter(n => n.data.nodeType === 'event');
  const ruleNodes   = nodes.filter(n => n.data.nodeType === 'rule');

  const outgoing = (id: string, type: string) =>
    edges.filter(e => e.source === id && e.data?.edgeType === type);
  const incoming = (id: string, type: string) =>
    edges.filter(e => e.target === id && e.data?.edgeType === type);

  const renderEntity = (ent: Node<NodeData>): string => {
    let attrsArray: { name: string; value: string }[] = [];
    const raw = ent.data.attributes;
    if (Array.isArray(raw)) {
      attrsArray = raw.map(a => ({
        name: a.name,
        value: a.value
      }));
    } else if (raw && typeof raw === 'object') {
      attrsArray = Object.entries(raw).map(([name, val]) => ({
        name,
        value: String(val)
      }));
    }
    const attrsText = attrsArray
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
    const parts: string[] = [];
    if (ev.data.requires)    parts.push(`    Requires: ${ev.data.requires}`);
    if (ev.data.effect)      parts.push(`    Effect: ${ev.data.effect}`);
    if (ev.data.probability) parts.push(`    P[${ev.data.probability}]`);

    outgoing(ev.id, 'target').forEach(e => {
      const tgt = nodes.find(n => n.id === e.target);
      if (tgt) parts.push(`    Target: ${tgt.data.label}`);
    });

    incoming(ev.id, 'trigger').forEach(e => {
      const src = nodes.find(n => n.id === e.source);
      if (src) parts.push(`    Trigger: ${src.data.label}`);
    });

    return `    Event ${ev.data.label} {\n${parts.join('\n')}\n    }`;
  };

  const renderRule = (r: Node<NodeData>): string => {
    const parts: string[] = [];
    if (r.data.when)   parts.push(`    When: ${r.data.when}`);
    if (r.data.effect) parts.push(`    Effect: ${r.data.effect}`);
    return `Rule ${r.data.label} {\n${parts.join('\n')}\n}`;
  };

  const sections: string[] = [];
  entityNodes.forEach(ent => sections.push(renderEntity(ent)));
  ruleNodes.forEach(rule => sections.push(renderRule(rule)));

  return sections.length ? sections.join('\n\n') : '';
}
