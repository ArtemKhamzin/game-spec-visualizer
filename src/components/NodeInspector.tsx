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
          {editedData.attributes && (
            <div className="mt-2">
              <strong>Attributes:</strong>
              {Object.entries(editedData.attributes).map(([attr, val]) => (
                <div key={attr} className="ml-4 mt-1">
                  <label className="block">
                    <strong>{attr}:</strong>
                    <input
                      type="text"
                      className={inputClass}
                      value={String(val)}
                      onChange={(e) => handleChange(`attributes.${attr}`, e.target.value)}
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
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
              className="px-4 py-2 bg-red-600 text-white rounded"
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
