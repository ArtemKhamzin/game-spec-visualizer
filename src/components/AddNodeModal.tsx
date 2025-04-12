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
      return { label: '', attributes: [] };
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

  const handleAttributeChange = (index: number, key: string, value: string) => {
    const updated = [...formData.attributes];
    updated[index] = { ...updated[index], [key]: value };
    setFormData((prev: any) => ({ ...prev, attributes: updated }));
  };

  const addAttribute = () => {
    setFormData((prev: any) => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', value: '' }],
    }));
  };

  const removeAttribute = (index: number) => {
    const updated = [...formData.attributes];
    updated.splice(index, 1);
    setFormData((prev: any) => ({ ...prev, attributes: updated }));
  };

  const handleSubmit = () => {
    const attributesObject: Record<string, string> = {};
    formData.attributes.forEach((attr: { name: string; value: string }) => {
      if (attr.name.trim() !== '') {
        attributesObject[attr.name] = attr.value;
      }
    });

    const output = {
      label: formData.label,
      attributes: attributesObject,
      nodeType,
    };

    onSubmit(output);
    onClose();
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
              onChange={(e) => setFormData((prev: any) => ({ ...prev, label: e.target.value }))}
            />
          </div>

          <div className="mb-2 font-semibold">Attributes:</div>
          {formData.attributes.map((attr: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Name"
                className="w-1/2 p-1 border rounded"
                value={attr.name}
                onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                className="w-1/2 p-1 border rounded"
                value={attr.value}
                onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
              />
              <button
                onClick={() => removeAttribute(index)}
                className="px-2 text-red-600 hover:text-red-800"
                title="Удалить"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addAttribute}
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, [field]: e.target.value }))}
          />
        </div>
      ));
    }

    if (nodeType === 'event') {
      return ['label', 'target', 'requires', 'effect', 'probability', 'trigger'].map((field) => (
        <div key={field} className="mb-3">
          <label className="block text-sm font-medium">{field}:</label>
          <input
            type="text"
            className="w-full p-1 border rounded"
            value={formData[field]}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, [field]: e.target.value }))}
          />
        </div>
      ));
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96 max-h-[90vh] overflow-auto">
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
