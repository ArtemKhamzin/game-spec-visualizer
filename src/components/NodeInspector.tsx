'use client';

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';

interface Props {
  selectedNode: Node | null;
}

const NodeInspector: React.FC<Props> = ({ selectedNode }) => {
  const [editedData, setEditedData] = useState<any>({});

  // Обновляем локальное состояние, когда выбран новый узел
  useEffect(() => {
    if (selectedNode) {
      setEditedData(selectedNode.data);
    } else {
      setEditedData({});
    }
  }, [selectedNode]);

  // Функция обновления значения. Поддерживает вложенные ключи через точку.
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

  // Рендер полей для event-узлов
  const renderEventFields = () => (
    <>
      <div className="mt-2">
        <label className="block">
          <strong>Label:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <strong>Target:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.target || ''}
            onChange={(e) => handleChange('target', e.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <strong>Requires:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.requires || ''}
            onChange={(e) => handleChange('requires', e.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <strong>Effect:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.effect || ''}
            onChange={(e) => handleChange('effect', e.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <strong>Probability:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.probability || ''}
            onChange={(e) => handleChange('probability', e.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <strong>Trigger:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.trigger || ''}
            onChange={(e) => handleChange('trigger', e.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <strong>Type:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.nodeType || ''}
            onChange={(e) => handleChange('nodeType', e.target.value)}
          />
        </label>
      </div>
    </>
  );

  // Рендер полей для entity-узлов
  const renderEntityFields = () => (
    <>
      <div className="mt-2">
        <label className="block">
          <strong>Label:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
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
                  className="w-full p-1 border rounded mt-1"
                  value={typeof val === 'string' ? val : String(val)}
                  onChange={(e) => handleChange(`attributes.${attr}`, e.target.value)}
                />
              </label>
            </div>
          ))}
        </div>
      )}
      <div className="mt-2">
        <label className="block">
          <strong>Type:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.nodeType || ''}
            onChange={(e) => handleChange('nodeType', e.target.value)}
          />
        </label>
      </div>
    </>
  );

  // Рендер полей для rule-узлов
  const renderRuleFields = () => (
    <>
      <div className="mt-2">
        <label className="block">
          <strong>Label:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <strong>When:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.when || ''}
            onChange={(e) => handleChange('when', e.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <strong>Effect:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.effect || ''}
            onChange={(e) => handleChange('effect', e.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <strong>Temporal:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.temporal || ''}
            onChange={(e) => handleChange('temporal', e.target.value)}
          />
        </label>
      </div>
      <div className="mt-2">
        <label className="block">
          <strong>Type:</strong>
          <input
            type="text"
            className="w-full p-1 border rounded mt-1"
            value={editedData.nodeType || ''}
            onChange={(e) => handleChange('nodeType', e.target.value)}
          />
        </label>
      </div>
    </>
  );

  const renderFields = () => {
    const type = editedData.nodeType;
    if (type === 'event') {
      return renderEventFields();
    }
    if (type === 'entity') {
      return renderEntityFields();
    }
    if (type === 'rule') {
      return renderRuleFields();
    }
    return (
      <>
        {Object.entries(editedData).map(([key, value]) => (
          <div key={key} className="mt-2">
            <label className="block">
              <strong>{key}:</strong>
              <input
                type="text"
                className="w-full p-1 border rounded mt-1"
                value={String(value)}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </label>
          </div>
        ))}
      </>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Свойства узла</h2>
      {selectedNode ? (
        <div className="text-sm">
          <div>
            <strong>ID:</strong> {selectedNode.id}
          </div>
          {renderFields()}
        </div>
      ) : (
        <div>Узел не выбран</div>
      )}
    </div>
  );
};

export default NodeInspector;
