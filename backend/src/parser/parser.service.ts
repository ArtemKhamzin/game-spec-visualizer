import { Injectable } from '@nestjs/common';

interface Node {
  id: string;
  type: string;
  data: any;
}

@Injectable()
export class ParserService {
  parseSpecFile(content: string): any {
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

    const nodes: Node[] = [];
    const edges: any[] = [];
    let currentEntity: Node | null = null;
    let lastState: Node | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('Entity')) {
        const match = line.match(/Entity (\w+)\s*{/);
        if (match && match[1]) {
          const entityName = match[1];
          currentEntity = {
            id: `${nodes.length + 1}`,
            type: 'entity',
            data: { label: entityName, attributes: {} },
          };
          nodes.push(currentEntity);
        }
      } else if (line.includes(':')) {
        if (currentEntity) {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const rest = parts.slice(1).join(':').trim();
            currentEntity.data.attributes[key] = rest;
          }
        }
      } else if (line.startsWith('State')) {
        const match = line.match(/State (\w+)\s*{/);
        if (match && match[1]) {
          const stateName = match[1];
          lastState = {
            id: `${nodes.length + 1}`,
            type: 'state',
            data: { label: stateName, condition: '' },
          };
          nodes.push(lastState);
        }
      } else if (
        lastState !== null &&  // ✅ Проверяем, что lastState не null
        (line.includes('>') || line.includes('<') || line.includes('=='))
      ) {
        lastState.data.condition = line; // ✅ Теперь TypeScript не ругается
      } else if (line.startsWith('Event')) {
        const match = line.match(/Event (\w+)\s*{/);
        if (match && match[1]) {
          const eventName = match[1];
          nodes.push({
            id: `${nodes.length + 1}`,
            type: 'event',
            data: { label: eventName, requires: '', effect: '', probability: null },
          });
        }
      } else if (line.startsWith('Rule')) {
        const match = line.match(/Rule (\w+)\s*{/);
        if (match && match[1]) {
          const ruleName = match[1];
          nodes.push({
            id: `${nodes.length + 1}`,
            type: 'rule',
            data: { label: ruleName, when: '', effect: '' },
          });
        }
      }
    }

    return { nodes, edges };
  }
}
