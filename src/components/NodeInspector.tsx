'use client';

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, newData: any) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateEventEdge: (nodeId: string, newEntityId: string) => void;
  onUpdateTargetEdge: (nodeId: string, newTargetId: string) => void;
  onUpdateTriggerEdge: (nodeId: string, newTriggerSourceId: string) => void;
  onUpdateRuleEdges: (nodeId: string, newWhen: string) => void;
  onSelectNode: (nodeId: string) => void;
  events: Node[];
  entities: any[];
  edges: any[];
}

const convertToAttributeArray = (attrs: Record<string, string>): any[] =>
  Object.entries(attrs).map(([key, value]) => ({
    id: uuidv4(),
    name: key,
    value,
  }));

const convertToAttributeObject = (attrs: any[]): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const attr of attrs) {
    if (attr.name.trim()) result[attr.name] = attr.value;
  }
  return result;
};

const NodeInspector: React.FC<Props> = ({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
  onUpdateEventEdge,
  onUpdateTargetEdge,
  onUpdateTriggerEdge,
  onUpdateRuleEdges,
  onSelectNode,
  events,
  entities,
  edges
}) => {
  const [editedData, setEditedData] = useState<any>({});

  useEffect(() => {
    if (selectedNode) {
      const data = { ...selectedNode.data };
  
      if (data.nodeType === 'entity') {
        const raw = data.attributes || {};
        data.attributes = Array.isArray(raw) ? raw : convertToAttributeArray(raw);
      }
  
      if (data.nodeType === 'event' && !data.entityId) {
        const ownsEdge = edges.find(
          (e) => e.target === selectedNode.id && e.data?.edgeType === 'owns-event'
        );
        if (ownsEdge) {
          data.entityId = ownsEdge.source;
        }
      }
  
      if (data.nodeType === 'event') {
        const targetEdge = edges.find(
          (e) => e.source === selectedNode.id && e.data?.edgeType === 'target'
        );
        if (targetEdge) {
          data.target = targetEdge.target;
        }

        const triggerEdge = edges.find(
          (e) => e.target === selectedNode.id && e.data?.edgeType === 'trigger'
        );
        if (triggerEdge) {
          data.trigger = triggerEdge.source;
        }
      }

      if (data.nodeType === 'rule' && typeof data.temporal === 'string') {
        data.temporal = data.temporal
          .split('#end#')
          .map((v: string) => ({ id: uuidv4(), value: v.trim() }))
          .filter((t: { id: string; value: string }) => t.value !== '');
      }

      if (data.nodeType === 'event' && typeof data.probability === 'string') {
        data.probability = data.probability
          .split('#end#')
          .map((v: string) => ({ id: uuidv4(), value: v.trim() }))
          .filter((p: { id: string; value: string }) => p.value !== '');
      }
  
      setEditedData(data);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedNode) {
      const dataToSend = { ...editedData };
      if (dataToSend.nodeType === 'entity' && Array.isArray(dataToSend.attributes)) {
        dataToSend.attributes = convertToAttributeObject(dataToSend.attributes);
      }

      if (editedData.nodeType === 'rule' && Array.isArray(editedData.temporal)) {
        dataToSend.temporal = editedData.temporal.map((t: any) => t.value).join('#end#');
      }

      if (editedData.nodeType === 'event' && Array.isArray(editedData.probability)) {
        dataToSend.probability = editedData.probability.map((p: any) => p.value).join('#end#');
      }
      
      onUpdateNode(selectedNode.id, dataToSend);
    }
  }, [editedData]);

  const handleChange = (key: string, value: string) => {
    setEditedData((prev: any) => ({ ...prev, [key]: value }));
  
    if (key === 'when' && selectedNode?.data?.nodeType === 'rule') {
      onUpdateRuleEdges(selectedNode.id, value);
    }
  };

  const handleAttrChange = (id: string, field: 'name' | 'value', value: string) => {
    const updated = editedData.attributes.map((attr: any) =>
      attr.id === id ? { ...attr, [field]: value } : attr
    );
    setEditedData((prev: any) => ({ ...prev, attributes: updated }));
  };

  const addAttribute = () => {
    const newAttr = { id: uuidv4(), name: '', value: '' };
    setEditedData((prev: any) => ({
      ...prev,
      attributes: [...(prev.attributes || []), newAttr],
    }));
  };

  const removeAttribute = (id: string) => {
    const updated = editedData.attributes.filter((attr: any) => attr.id !== id);
    setEditedData((prev: any) => ({ ...prev, attributes: updated }));
  };

  const inputClass = 'w-full p-1 border rounded mt-1';

  const renderEntityFields = () => (
    <>
      <div className="mt-2">
        <strong>Label:</strong>
        <input
          type="text"
          className={inputClass}
          value={editedData.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
        />
      </div>

      <div className="mt-4 font-semibold">Attributes:</div>
      {editedData.attributes?.map((attr: any) => (
        <div key={attr.id} className="flex items-center gap-2 mt-2 ml-2">
          <input
            type="text"
            className="w-1/2 p-1 border rounded"
            value={attr.name}
            onChange={(e) => handleAttrChange(attr.id, 'name', e.target.value)}
          />
          <input
            type="text"
            className="w-1/2 p-1 border rounded"
            value={attr.value}
            onChange={(e) => handleAttrChange(attr.id, 'value', e.target.value)}
          />
          <button
            onClick={() => removeAttribute(attr.id)}
            className="px-2 text-red-600 hover:text-red-800"
            title="Удалить"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={addAttribute}
        className="mt-2 ml-2 px-3 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200"
      >
        + Добавить атрибут
      </button>

      {events && (
        <div className="mt-6">
          <strong className="block mb-2">Events:</strong>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {events
              .filter((event) =>
                edges.some(
                  (e) =>
                    e.source === selectedNode?.id &&
                    e.target === event.id &&
                    e.data?.edgeType === 'owns-event'
                )
              )
              .map((event) => (
                <li
                  key={event.id}
                  className="cursor-pointer text-black hover:underline"
                  onClick={() => onSelectNode(event.id)}
                >
                  {event.data?.label || event.id}
                </li>
              ))}
          </ul>
        </div>
      )}
    </>
  );

  const renderEventFields = () => (
    <>
      <div className="mt-2">
        <strong>Label:</strong>
        <input
          type="text"
          className={inputClass}
          value={editedData.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
        />
      </div>
  
      <div className="mt-2">
        <strong>Entity:</strong>
        <select
          className="w-full p-1 border rounded"
          value={editedData.entityId || ''}
          onChange={(e) => {
            const newVal = e.target.value;
            handleChange('entityId', newVal);
            onUpdateEventEdge(selectedNode!.id, newVal);
          }}
        >
          <option value="">Выберите сущность</option>
          {entities.map((entity) => (
            <option key={entity.id} value={entity.id}>
              {entity.data?.label || entity.id}
            </option>
          ))}
        </select>
      </div>
  
      <div className="mt-2">
        <strong>Target:</strong>
        <select
          className="w-full p-1 border rounded"
          value={editedData.target || ''}
          onChange={(e) => {
            const newVal = e.target.value;
            handleChange('target', newVal);
            onUpdateTargetEdge(selectedNode!.id, newVal);
          }}
        >
          <option value="">Выберите цель</option>
          {entities.map((entity) => (
            <option key={entity.id} value={entity.id}>
              {entity.data?.label || entity.id}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2">
        <strong>Trigger:</strong>
        <select
          className="w-full p-1 border rounded"
          value={editedData.trigger || ''}
          onChange={(e) => {
            const newVal = e.target.value;
            handleChange('trigger', newVal);
            onUpdateTriggerEdge(selectedNode!.id, newVal);
          }}
        >
          <option value="">Выберите событие</option>
          {events
            .filter((ev) => ev.id !== selectedNode?.id)
            .map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.data?.label || ev.id}
              </option>
            ))}
        </select>
      </div>
  
      {['requires', 'effect'].map((key) => (
        <div key={key} className="mt-2">
          <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
          <input
            type="text"
            className={inputClass}
            value={editedData[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}

      <div className="mt-4 font-semibold">Probability:</div>
      {(editedData.probability || []).map((entry: { id: string; value: string }) => (
        <div key={entry.id} className="flex items-center gap-2 mt-2 ml-2">
          <input
            type="text"
            className="w-full p-1 border rounded"
            value={entry.value}
            onChange={(e) => {
              const newList = editedData.probability.map((p: { id: string; value: string }) =>
                p.id === entry.id ? { ...p, value: e.target.value } : p
              );
              setEditedData((prev: any) => ({ ...prev, probability: newList }));
            }}
          />
          <button
            onClick={() => {
              const newList = editedData.probability.filter((p: { id: string }) => p.id !== entry.id);
              setEditedData((prev: any) => ({ ...prev, probability: newList }));
            }}
            className="px-2 text-red-600 hover:text-red-800"
            title="Удалить"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={() => {
          const newEntry = { id: uuidv4(), value: '' };
          setEditedData((prev: any) => ({
            ...prev,
            probability: [...(prev.probability || []), newEntry],
          }));
        }}
        className="mt-2 ml-2 px-3 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200"
      >
        + Добавить Probability
      </button>
    </>
  );

  const renderRuleFields = () => (
    <>
      {['label', 'when', 'effect'].map((key) => (
        <div key={key} className="mt-2">
          <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
          <input
            type="text"
            className={inputClass}
            value={editedData[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}
  
      <div className="mt-4 font-semibold">Temporal:</div>
      {(editedData.temporal || []).map((entry: { id: string; value: string }) => (
        <div key={entry.id} className="flex items-center gap-2 mt-2 ml-2">
          <input
            type="text"
            className="w-full p-1 border rounded"
            value={entry.value}
            onChange={(e) => {
              const newList = editedData.temporal.map((t: { id: string; value: string }) =>
                t.id === entry.id ? { ...t, value: e.target.value } : t
              );
              setEditedData((prev: any) => ({ ...prev, temporal: newList }));
            }}
          />
          <button
            onClick={() => {
              const newList = editedData.temporal.filter(
                (t: { id: string }) => t.id !== entry.id
              );
              setEditedData((prev: any) => ({ ...prev, temporal: newList }));
            }}
            className="px-2 text-red-600 hover:text-red-800"
            title="Удалить"
          >
            ✕
          </button>
        </div>
      ))}
  
      <button
        onClick={() => {
          const newEntry = { id: uuidv4(), value: '' };
          setEditedData((prev: any) => ({
            ...prev,
            temporal: [...(prev.temporal || []), newEntry],
          }));
        }}
        className="mt-2 ml-2 px-3 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200"
      >
        + Добавить Temporal
      </button>
    </>
  );

  const renderFields = () => {
    const type = editedData.nodeType;
    if (type === 'entity') return renderEntityFields();
    if (type === 'event') return renderEventFields();
    if (type === 'rule') return renderRuleFields();
    return null;
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">
        Свойства узла {selectedNode?.data?.label && `«${selectedNode.data.label}»`}
      </h2>
      {selectedNode ? (
        <div className="text-sm">
          <div>
            <strong>ID:</strong> {selectedNode.id}
          </div>
          <div className="mt-1">
            <strong>Type:</strong> {editedData.nodeType || ''}
          </div>
          {renderFields()}
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => {
                if (confirm('Удалить узел?')) {
                  onDeleteNode(selectedNode.id);
                }
              }}
            >
              Удалить узел
            </button>
          </div>
        </div>
      ) : (
        <div>Узел не выбран</div>
      )}
    </div>
  );
};

export default NodeInspector;
