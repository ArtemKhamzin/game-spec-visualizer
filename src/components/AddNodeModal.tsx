'use client';

import React, { useState, useEffect } from 'react';

interface AddNodeModalProps {
  nodeType: 'rule' | 'entity' | 'event';
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const getInitialData = (nodeType: 'rule' | 'entity' | 'event') => {
  switch (nodeType) {
    case 'rule':
      return { label: '', when: '', effect: '', temporal: '' };
    case 'entity':
      return { label: '', attributes: { hp: '', damage: '' } };
    case 'event':
      return { label: '', target: '', requires: '', effect: '', probability: '', trigger: '' };
    default:
      return {};
  }
};

const AddNodeModal: React.FC<AddNodeModalProps> = ({ nodeType, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<any>(getInitialData(nodeType));

  useEffect(() => {
    setFormData(getInitialData(nodeType));
  }, [nodeType]);

  const handleChange = (key: string, value: string) => {
    if (key.startsWith('attributes.')) {
      const attrKey = key.split('.')[1];
      setFormData((prev: any) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attrKey]: value,
        },
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const renderFields = () => {
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
          <div className="mb-3">
            <label className="block text-sm font-medium">Attributes:</label>
            {Object.entries(formData.attributes).map(([key, val]) => (
              <div key={key} className="ml-3 mb-2">
                <label className="block text-xs">{key}:</label>
                <input
                  type="text"
                  className="w-full p-1 border rounded"
                  value={String(val)}
                  onChange={(e) => handleChange(`attributes.${key}`, e.target.value)}
                />
              </div>
            ))}
          </div>
        </>
      );
    }

    if (nodeType === 'event') {
      return ['label', 'target', 'requires', 'effect', 'probability', 'trigger'].map((field) => (
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

    return null;
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, nodeType });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">Добавить узел: {nodeType}</h2>
        {renderFields()}
        <div className="flex justify-end mt-4 space-x-2">
          <button 
            onClick={onClose} 
            className="px-4 py-1 border rounded hover:bg-gray-200"
          >
            Отмена
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Добавить узел
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNodeModal;
