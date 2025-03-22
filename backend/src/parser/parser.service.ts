import { Injectable } from '@nestjs/common';

interface Node {
  id: string;
  type: 'entity' | 'event' | 'rule';
  data: any;
}

interface Edge {
  source: string;
  target: string;
  type: string;
}

@Injectable()
export class ParserService {
  parseSpecFile(content: string): { success: boolean; data: { nodes: Node[]; edges: Edge[] } } {
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let index = 0;
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeId = 1;

    const entityMap: Record<string, string> = {};
    const eventMap: Record<string, string> = {};

    const clean = (line: string): string =>
      line.endsWith('}') ? line.slice(0, -1).trim() : line;

    const nextId = () => String(nodeId++);

    while (index < lines.length) {
      const line = clean(lines[index]);

      // === ENTITY ===
      if (line.startsWith('Entity')) {
        const entityName = line.split(/\s+/)[1];
        const entityId = nextId();
        const entityNode: Node = {
          id: entityId,
          type: 'entity',
          data: {
            label: entityName,
            attributes: {}
          }
        };
        entityMap[entityName] = entityId;
        nodes.push(entityNode);
        index++;

        while (index < lines.length && lines[index] !== '}') {
          const inner = clean(lines[index]);

          // --- State block
          if (inner.startsWith('State')) {
            index++;
            while (index < lines.length && lines[index] !== '}') {
              const stateLine = clean(lines[index]);
              const [key, ...rest] = stateLine.split(':');
              if (key && rest.length > 0) {
                entityNode.data.attributes[key.trim()] = rest.join(':').trim();
              }
              index++;
            }
            index++; // skip }
          }

          // --- Event block
          else if (inner.startsWith('Event')) {
            const eventName = inner.split(/\s+/)[1];
            const eventId = nextId();
            const eventNode: Node = {
              id: eventId,
              type: 'event',
              data: {
                label: eventName,
                target: '',
                requires: '',
                effect: '',
                probability: '',
                trigger: ''
              }
            };

            // Карта: "Player.Attack" → eventId
            eventMap[`${entityNode.data.label}.${eventName}`] = eventId;

            index++;
            while (index < lines.length && lines[index] !== '}') {
              const eLine = clean(lines[index]);
              if (eLine.startsWith('Target:')) {
                eventNode.data.target = eLine.replace('Target:', '').trim();
              } else if (eLine.startsWith('Requires:')) {
                eventNode.data.requires = eLine.replace('Requires:', '').trim();
              } else if (eLine.startsWith('Effect:')) {
                eventNode.data.effect = eLine.replace('Effect:', '').trim();
              } else if (eLine.startsWith('P[')) {
                eventNode.data.probability += (eventNode.data.probability ? ' ' : '') + eLine;
              } else if (eLine.startsWith('Trigger:')) {
                eventNode.data.trigger = eLine.replace('Trigger:', '').trim();
              }
              index++;
            }
            index++; // skip }

            nodes.push(eventNode);

            // owns-event
            edges.push({ source: entityId, target: eventId, type: 'owns-event' });

            // target → entity
            if (eventNode.data.target && entityMap[eventNode.data.target]) {
              edges.push({
                source: eventId,
                target: entityMap[eventNode.data.target],
                type: 'target'
              });
            }
          } else {
            index++;
          }
        }

        index++; // skip entity }
      }

      // === RULE ===
      else if (line.startsWith('Rule')) {
        const ruleName = line.split(/\s+/)[1];
        const ruleId = nextId();
        const ruleNode: Node = {
          id: ruleId,
          type: 'rule',
          data: {
            label: ruleName,
            when: '',
            effect: '',
            temporal: ''
          }
        };
        index++;
        while (index < lines.length && lines[index] !== '}') {
          const rLine = clean(lines[index]);
          if (rLine.startsWith('When:')) {
            ruleNode.data.when = rLine.replace('When:', '').trim();
          } else if (rLine.startsWith('Effect:')) {
            ruleNode.data.effect = rLine.replace('Effect:', '').trim();
          } else if (
            rLine.startsWith('G(') ||
            rLine.startsWith('F(') ||
            rLine.startsWith('P[') ||
            rLine.includes('->')
          ) {
            ruleNode.data.temporal += (ruleNode.data.temporal ? ' ' : '') + rLine;
          }
          index++;
        }
        index++; // skip }
        nodes.push(ruleNode);

        // rule-effect (привязываем ко всем entity)
        for (const entId of Object.values(entityMap)) {
          edges.push({ source: ruleId, target: entId, type: 'rule-effect' });
        }
      }

      else {
        index++;
      }
    }

    // === TRIGGERS ===
    for (const node of nodes) {
      if (node.type === 'event' && node.data.trigger) {
        const triggerKey = node.data.trigger.includes('.')
          ? node.data.trigger
          : `Player.${node.data.trigger}`;
        if (eventMap[triggerKey]) {
          edges.push({
            source: eventMap[triggerKey],
            target: node.id,
            type: 'trigger'
          });
        }
      }
    }

    return {
      success: true,
      data: {
        nodes,
        edges
      }
    };
  }
}
