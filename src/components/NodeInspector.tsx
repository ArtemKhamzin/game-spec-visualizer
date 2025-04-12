'use client';

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface Props {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, newData: any) => void;
  onDeleteNode: (nodeId: string) => void;
}

const NodeInspector: React.FC<Props> = ({ selectedNode, onUpdateNode, onDeleteNode }) => {
  const [editedData, setEditedData] = useState<any>({});

  useEffect(() => {
    if (selectedNode) {
      setEditedData(selectedNode.data);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, editedData);
    }
  }, [editedData]);

  const handleChange = (key: string, value: string) => {
    setEditedData((prev: any) => {
      if (key.includes('.')) {
        const keys = key.split('.');
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        };
      } else {
        return { ...prev, [key]: value };
      }
    });
  };

  const inputClass = 'w-full p-1 border rounded mt-1';

  const renderFields = () => {
    const type = editedData.nodeType;

    if (type === 'rule') {
      return ['label', 'when', 'effect', 'temporal'].map((key) => (
        <div key={key} className="mt-2">
          <label className="block">
            <strong>{key[0].toUpperCase() + key.slice(1)}:</strong>
            <input
              type="text"
              className={inputClass}
              value={editedData[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </label>
        </div>
      ));
    }

    if (type === 'entity') {
      const attributes = editedData.attributes || {};

      const handleAttributeEdit = (key: string, field: 'name' | 'value', value: string) => {
        const updated = { ...attributes };
        if (field === 'name') {
          updated[value] = updated[key];
          delete updated[key];
        } else {
          updated[key] = value;
        }
        setEditedData((prev: any) => ({
          ...prev,
          attributes: updated,
        }));
      };

      const handleAddAttribute = () => {
        const baseKey = 'newAttr';
        let counter = 1;
        let newKey = baseKey;
        while (attributes.hasOwnProperty(newKey)) {
          newKey = `${baseKey}${counter++}`;
        }

        setEditedData((prev: any) => ({
          ...prev,
          attributes: {
            ...prev.attributes,
            [newKey]: '',
          },
        }));
      };

      const handleRemoveAttribute = (key: string) => {
        const updated = { ...attributes };
        delete updated[key];
        setEditedData((prev: any) => ({
          ...prev,
          attributes: updated,
        }));
      };

      return (
        <>
          <div className="mt-2">
            <label className="block">
              <strong>Label:</strong>
              <input
                type="text"
                className={inputClass}
                value={editedData.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
              />
            </label>
          </div>

          <div className="mt-4 font-semibold">Attributes:</div>
          {Object.entries(attributes).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 mt-2 ml-2">
              <input
                type="text"
                className="w-1/2 p-1 border rounded"
                value={key}
                onChange={(e) => handleAttributeEdit(key, 'name', e.target.value)}
              />
              <input
                type="text"
                className="w-1/2 p-1 border rounded"
                value={String(val)}
                onChange={(e) => handleAttributeEdit(key, 'value', e.target.value)}
              />
              <button
                onClick={() => handleRemoveAttribute(key)}
                className="px-2 text-red-600 hover:text-red-800"
                title="Удалить"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={handleAddAttribute}
            className="mt-2 ml-2 px-3 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200"
          >
            + Добавить атрибут
          </button>
        </>
      );
    }

    if (type === 'event') {
      return ['label', 'target', 'requires', 'effect', 'probability', 'trigger'].map((key) => (
        <div key={key} className="mt-2">
          <label className="block">
            <strong>{key[0].toUpperCase() + key.slice(1)}:</strong>
            <input
              type="text"
              className={inputClass}
              value={editedData[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </label>
        </div>
      ));
    }

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
