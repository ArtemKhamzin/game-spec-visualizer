'use client';

import React, { useState, useEffect } from 'react';

interface AddNodeModalProps {
  nodeType: 'rule' | 'entity' | 'event';
  onClose: () => void;
  onSubmit: (data: any) => void;
  entities?: any[];
}

const getInitialData = (nodeType: 'rule' | 'entity' | 'event') => {
  switch (nodeType) {
    case 'rule':
      return { label: '', when: '', effect: '', temporal: '' };
    case 'entity':
      return { label: '', attributes: {} };
    case 'event':
      return { label: '', target: '', requires: '', effect: '', probability: '', trigger: '', entityId: '' };
    default:
      return {};
  }
};

const AddNodeModal: React.FC<AddNodeModalProps> = ({ nodeType, onClose, onSubmit, entities }) => {
  const [formData, setFormData] = useState<any>(getInitialData(nodeType));

  useEffect(() => {
    setFormData(getInitialData(nodeType));
  }, [nodeType]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderFields = () => {
    if (nodeType === 'entity') {
      return (
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium">Label:</label>
            <input
              type="text"
              className="w-full p-1 border rounded"
              value={formData.label}
              onChange={(e) => handleChange('label', e.target.value)}
            />
          </div>
          <div className="mb-2 font-semibold">Attributes:</div>
          {Object.entries(formData.attributes).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Name"
                className="w-1/2 p-1 border rounded"
                value={key}
                onChange={(e) => {
                }}
                disabled
              />
              <input
                type="text"
                placeholder="Value"
                className="w-1/2 p-1 border rounded"
                value={String(val)}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    attributes: { ...prev.attributes, [key]: e.target.value },
                  }))
                }
              />
              <button
                onClick={() => {
                  const updated = { ...formData.attributes };
                  delete updated[key];
                  setFormData((prev: any) => ({ ...prev, attributes: updated }));
                }}
                className="px-2 text-red-600 hover:text-red-800"
                title="Удалить"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setFormData((prev: any) => ({
                ...prev,
                attributes: { ...prev.attributes, [`newAttr${Date.now()}`]: '' },
              }))
            }
            className="px-3 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200"
          >
            + Добавить атрибут
          </button>
        </>
      );
    }

    if (nodeType === 'rule') {
      return ['label', 'when', 'effect', 'temporal'].map((field) => (
        <div key={field} className="mb-3">
          <label className="block text-sm font-medium">{field}:</label>
          <input
            type="text"
            className="w-full p-1 border rounded"
            value={formData[field]}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        </div>
      ));
    }

    if (nodeType === 'event') {
      return (
        <>
          <div className="mb-3">
            <label className="block text-sm font-medium">entity:</label>
            <select
              className="w-full p-1 border rounded"
              value={formData.entityId || ''}
              onChange={(e) => handleChange('entityId', e.target.value)}
            >
              <option value="">Выберите сущность</option>
              {entities &&
                entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.data?.label || entity.id}
                  </option>
                ))}
            </select>
          </div>
          {['label', 'target', 'requires', 'effect', 'probability', 'trigger'].map((field) => (
            <div key={field} className="mb-3">
              <label className="block text-sm font-medium">{field}:</label>
              <input
                type="text"
                className="w-full p-1 border rounded"
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </div>
          ))}
        </>
      );
    }

    return null;
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, nodeType });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96 max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-bold mb-4">Добавить узел: {nodeType}</h2>
        {renderFields()}
        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={onClose} className="px-4 py-1 border rounded hover:bg-gray-200">
            Отмена
          </button>
          <button onClick={handleSubmit} className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
            Добавить узел
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNodeModal;
