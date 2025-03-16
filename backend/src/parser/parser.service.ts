import { Injectable } from '@nestjs/common';

interface Node {
  id: string;
  type: string;
  data: any;
}

@Injectable()
export class ParserService {
  parseSpecFile(content: string): any {
    // Разбиваем файл на строки, обрезаем пробелы и фильтруем пустые строки
    let lines = content.split('\n').map(line => line.trim()).filter(line => line !== '');

    const nodes: Node[] = [];
    const edges: any[] = [];
    let currentBlockType: string | null = null;
    let currentBlock: Node | null = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Если строка равна "}", пропускаем её
      if (line === "}") {
        continue;
      }
      // Если строка заканчивается на "}", удаляем закрывающую скобку
      if (line.endsWith("}")) {
        line = line.slice(0, -1).trim();
        if (line === "") {
          continue;
        }
      }

      // Если строка начинается с ключевого слова, создаём новый блок
      if (line.startsWith('Entity')) {
        currentBlockType = 'entity';
        const match = line.match(/Entity (\w+)\s*{/);
        if (match && match[1]) {
          currentBlock = {
            id: `${nodes.length + 1}`,
            type: 'entity',
            data: { label: match[1], attributes: {} }
          };
          nodes.push(currentBlock);
        }
        continue;
      } else if (line.startsWith('State')) {
        currentBlockType = 'state';
        const match = line.match(/State (\w+)\s*{/);
        if (match && match[1]) {
          currentBlock = {
            id: `${nodes.length + 1}`,
            type: 'state',
            data: { label: match[1], condition: '' }
          };
          nodes.push(currentBlock);
        }
        continue;
      } else if (line.startsWith('Event')) {
        currentBlockType = 'event';
        const match = line.match(/Event (\w+)\s*{/);
        if (match && match[1]) {
          currentBlock = {
            id: `${nodes.length + 1}`,
            type: 'event',
            data: { label: match[1], requires: '', effect: '', probability: null }
          };
          nodes.push(currentBlock);
        }
        continue;
      } else if (line.startsWith('Rule')) {
        currentBlockType = 'rule';
        const match = line.match(/Rule (\w+)\s*{/);
        if (match && match[1]) {
          currentBlock = {
            id: `${nodes.length + 1}`,
            type: 'rule',
            data: { label: match[1], when: '', effect: '' }
          };
          nodes.push(currentBlock);
        }
        continue;
      } else if (line.startsWith('Trigger')) {
        currentBlockType = 'trigger';
        const match = line.match(/Trigger (\w+)\s*{/);
        if (match && match[1]) {
          currentBlock = {
            id: `${nodes.length + 1}`,
            type: 'trigger',
            data: { label: match[1], when: '', effect: '' }
          };
          nodes.push(currentBlock);
        }
        continue;
      } else if (line.startsWith('TemporalOperator')) {
        currentBlockType = 'temporal';
        const match = line.match(/TemporalOperator (\w+)\s*{/);
        if (match && match[1]) {
          currentBlock = {
            id: `${nodes.length + 1}`,
            type: 'temporal',
            data: { label: match[1], formula: '' }
          };
          nodes.push(currentBlock);
        }
        continue;
      } else if (line.startsWith('ProbabilityOperator')) {
        currentBlockType = 'probability';
        const match = line.match(/ProbabilityOperator (\w+)\s*{/);
        if (match && match[1]) {
          currentBlock = {
            id: `${nodes.length + 1}`,
            type: 'probability',
            data: { label: match[1], expression: '' }
          };
          nodes.push(currentBlock);
        }
        continue;
      } else {
        // Обработка содержимого блока, если не начался новый
        if (currentBlock && currentBlockType) {
          if (currentBlockType === 'entity' && line.includes(':')) {
            const parts = line.split(':');
            if (parts.length >= 2) {
              const key = parts[0].trim();
              const rest = parts.slice(1).join(':').trim();
              currentBlock.data.attributes[key] = rest;
            }
          } else if (currentBlockType === 'state') {
            // Для State объединяем все строки условия через ' && '
            if (currentBlock.data.condition) {
              currentBlock.data.condition += ' && ' + line;
            } else {
              currentBlock.data.condition = line;
            }
          } else if (currentBlockType === 'event') {
            if (line.startsWith('Requires:')) {
              currentBlock.data.requires = line.replace('Requires:', '').trim();
            } else if (line.startsWith('Effect:')) {
              currentBlock.data.effect = line.replace('Effect:', '').trim();
            } else if (line.startsWith('Probability:')) {
              currentBlock.data.probability = line.replace('Probability:', '').trim();
            }
          } else if (currentBlockType === 'rule') {
            if (line.startsWith('When:')) {
              currentBlock.data.when = line.replace('When:', '').trim();
            } else if (line.startsWith('Effect:')) {
              currentBlock.data.effect = line.replace('Effect:', '').trim();
            }
          } else if (currentBlockType === 'trigger') {
            if (line.startsWith('When:')) {
              currentBlock.data.when = line.replace('When:', '').trim();
            } else if (line.startsWith('Effect:')) {
              currentBlock.data.effect = line.replace('Effect:', '').trim();
            }
          } else if (currentBlockType === 'temporal') {
            currentBlock.data.formula = line;
          } else if (currentBlockType === 'probability') {
            currentBlock.data.expression = line;
          }
        }
      }
    }

    return { nodes, edges };
  }
}
