'use client';

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, newData: any) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateEventEdge: (nodeId: string, newEntityId: string) => void;
  entities: any[];
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
  entities,
}) => {
  const [editedData, setEditedData] = useState<any>({});

  useEffect(() => {
    if (selectedNode) {
      const data = { ...selectedNode.data };
      if (data.nodeType === 'entity') {
        const raw = data.attributes || {};
        data.attributes = Array.isArray(raw) ? raw : convertToAttributeArray(raw);
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
      onUpdateNode(selectedNode.id, dataToSend);
    }
  }, [editedData]);

  const handleChange = (key: string, value: string) => {
    setEditedData((prev: any) => ({ ...prev, [key]: value }));
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
        <label className="block font-medium">Label:</label>
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
    </>
  );

  const renderEventFields = () => (
    <>
      <div className="mt-2">
        <label className="block font-medium">Сущность:</label>
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
      {['label', 'target', 'requires', 'effect', 'probability', 'trigger'].map((key) => (
        <div key={key} className="mt-2">
          <label className="block font-medium">{key}:</label>
          <input
            type="text"
            className={inputClass}
            value={editedData[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}
    </>
  );

  const renderRuleFields = () => (
    <>
      {['label', 'when', 'effect', 'temporal'].map((key) => (
        <div key={key} className="mt-2">
          <label className="block font-medium">{key}:</label>
          <input
            type="text"
            className={inputClass}
            value={editedData[key] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}
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
      <h2 className="text-lg font-bold mb-2">Свойства узла</h2>
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
