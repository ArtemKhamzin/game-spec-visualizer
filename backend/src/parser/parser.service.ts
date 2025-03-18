import { Injectable } from '@nestjs/common';

interface Node {
  id: string;
  type: string;
  data: any;
}

interface Edge {
  source: string;
  target: string;
  type: string;
}

@Injectable()
export class ParserService {
  parseSpecFile(content: string): any {
    // Разбиваем файл на строки и удаляем пустые
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let index = 0;
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nodeId = 1;

    // Карты для поиска уже созданных узлов по именам
    const entityMap: Record<string, string> = {};
    const eventMap: Record<string, string> = {};

    // Функция очистки строки от завершающих скобок
    const cleanLine = (line: string): string => {
      if (line === "}") return "";
      if (line.endsWith("}")) return line.slice(0, -1).trim();
      return line;
    };

    // Функция создания нового узла и увеличения nodeId
    const createNode = (type: string, data: any): Node => {
      const node: Node = { id: String(nodeId++), type, data };
      nodes.push(node);
      return node;
    };

    while (index < lines.length) {
      let line = cleanLine(lines[index]);
      if (line === "") {
        index++;
        continue;
      }

      // Обработка сущности
      if (line.startsWith('Entity')) {
        const entityMatch = line.match(/Entity (\w+)\s*{/);
        if (entityMatch) {
          const entityName = entityMatch[1];
          const entityNode = createNode('entity', { label: entityName, events: [] });
          entityMap[entityName] = entityNode.id;
          index++; // Переходим внутрь блока Entity

          // Внутри Entity обрабатываем вложенные блоки
          while (index < lines.length && lines[index] !== "}") {
            let nestedLine = cleanLine(lines[index]);
            // Обработка блока State внутри Entity
            if (nestedLine.startsWith('State')) {
              index++; // Пропускаем "State {"
              while (index < lines.length && lines[index] !== "}") {
                let stateLine = cleanLine(lines[index]);
                // Разбиваем строку по двоеточию
                const parts = stateLine.split(':');
                if (parts.length >= 2) {
                  const key = parts[0].trim();
                  const value = parts.slice(1).join(':').trim();
                  // Создаем узел для каждого атрибута (state)
                  const stateNode = createNode('state', { label: key, value });
                  // Связываем сущность с состоянием
                  edges.push({ source: entityNode.id, target: stateNode.id, type: "attribute" });
                }
                index++;
              }
              index++; // Пропускаем закрывающую скобку для State
              continue;
            }
            // Обработка блока Event внутри Entity
            else if (nestedLine.startsWith('Event')) {
              const eventMatch = nestedLine.match(/Event (\w+)\s*{/);
              if (eventMatch) {
                const eventName = eventMatch[1];
                const eventNode = createNode('event', {
                  label: eventName,
                  target: "",
                  requires: "",
                  effect: "",
                  probability: "",
                  trigger: ""
                });
                eventMap[eventName] = eventNode.id;
                // Связь: Entity → Event (действие)
                edges.push({ source: entityNode.id, target: eventNode.id, type: "action" });
                index++; // Переходим внутрь блока Event
                while (index < lines.length && lines[index] !== "}") {
                  let eventLine = cleanLine(lines[index]);
                  if (eventLine.startsWith('Target:')) {
                    eventNode.data.target = eventLine.replace('Target:', '').trim();
                  } else if (eventLine.startsWith('Requires:')) {
                    eventNode.data.requires = eventLine.replace('Requires:', '').trim();
                  } else if (eventLine.startsWith('Effect:')) {
                    eventNode.data.effect = eventLine.replace('Effect:', '').trim();
                  } else if (eventLine.startsWith('P[')) {
                    if (eventNode.data.probability) {
                      eventNode.data.probability += " " + eventLine;
                    } else {
                      eventNode.data.probability = eventLine;
                    }
                  } else if (eventLine.startsWith('Trigger:')) {
                    eventNode.data.trigger = eventLine.replace('Trigger:', '').trim();
                  }
                  index++;
                }
                index++; // Пропускаем закрывающую скобку для Event

                // Если у события задан target, добавляем связь Event → Target (если целевая сущность найдена)
                if (eventNode.data.target && entityMap[eventNode.data.target]) {
                  edges.push({ source: eventNode.id, target: entityMap[eventNode.data.target], type: "target" });
                }
                // Если у события задан trigger, добавляем связь от триггерного события к текущему (если найдено)
                if (eventNode.data.trigger && eventMap[eventNode.data.trigger]) {
                  edges.push({ source: eventMap[eventNode.data.trigger], target: eventNode.id, type: "trigger" });
                }
                continue;
              } else {
                index++;
              }
            } else {
              index++;
            }
          }
          index++; // Пропускаем закрывающую скобку для Entity
          continue;
        } else {
          index++;
          continue;
        }
      }
      // Обработка глобального блока Rule
      else if (line.startsWith('Rule')) {
        const ruleMatch = line.match(/Rule (\w+)\s*{/);
        if (ruleMatch) {
          const ruleName = ruleMatch[1];
          const ruleNode = createNode('rule', { label: ruleName, when: "", effect: "", temporal: "" });
          index++;
          while (index < lines.length && lines[index] !== "}") {
            let ruleLine = cleanLine(lines[index]);
            if (ruleLine.startsWith('When:')) {
              if (ruleNode.data.when) {
                ruleNode.data.when += " && " + ruleLine.replace('When:', '').trim();
              } else {
                ruleNode.data.when = ruleLine.replace('When:', '').trim();
              }
            } else if (ruleLine.startsWith('Effect:')) {
              ruleNode.data.effect = ruleLine.replace('Effect:', '').trim();
            } else if (ruleLine.startsWith('G(') || ruleLine.startsWith('F(') || ruleLine.includes('->') || ruleLine.startsWith('P[')) {
              if (ruleNode.data.temporal) {
                ruleNode.data.temporal += " " + ruleLine;
              } else {
                ruleNode.data.temporal = ruleLine;
              }
            }
            index++;
          }
          index++; // Пропускаем закрывающую скобку для Rule
          // Для простоты связываем правило с каждой сущностью, на которую оно влияет (здесь – все Entity)
          for (const ent in entityMap) {
            edges.push({ source: ruleNode.id, target: entityMap[ent], type: "rule-effect" });
          }
          continue;
        } else {
          index++;
          continue;
        }
      }
      // Пропускаем блоки типа ProbabilityOperator (так как они интегрированы)
      else if (line.startsWith('ProbabilityOperator')) {
        while (index < lines.length && lines[index] !== "}") {
          index++;
        }
        index++;
        continue;
      }
      else {
        index++;
      }
    }

    return { nodes, edges };
  }
}
