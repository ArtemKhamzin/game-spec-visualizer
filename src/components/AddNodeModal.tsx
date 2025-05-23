'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface AddNodeModalProps {
  nodeType: 'rule' | 'entity' | 'event';
  onClose: () => void;
  onSubmit: (data: any) => void;
  entities?: any[];
  events?: any[];
}

const getInitialData = (nodeType: 'rule' | 'entity' | 'event') => {
  switch (nodeType) {
    case 'rule':
      return { label: '', when: '', effect: '', temporal: [{ id: uuidv4(), value: '' }] };
    case 'entity':
      return { label: '', attributes: [{ id: uuidv4(), name: '', value: '' }] };
    case 'event':
      return { label: '', target: '', requires: '', effect: '', 
        probability: [{ id: uuidv4(), value: '' }], trigger: '', entityId: '' };
    default:
      return {};
  }
};

const AddNodeModal: React.FC<AddNodeModalProps> = ({ nodeType, onClose, onSubmit, entities, events }) => {
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

  const handleAttributeChange = (id: string, field: 'name' | 'value', value: string) => {
    const updated = formData.attributes.map((attr: any) =>
      attr.id === id ? { ...attr, [field]: value } : attr
    );
    setFormData((prev: any) => ({ ...prev, attributes: updated }));
  };

  const addAttribute = () => {
    setFormData((prev: any) => ({
      ...prev,
      attributes: [...prev.attributes, { id: uuidv4(), name: '', value: '' }],
    }));
  };

  const removeAttribute = (id: string) => {
    const updated = formData.attributes.filter((attr: any) => attr.id !== id);
    setFormData((prev: any) => ({ ...prev, attributes: updated }));
  };

  const handleSubmit = () => {
    let output = { ...formData, nodeType };

    if (nodeType === 'entity') {
      const attributesObject: Record<string, string> = {};
      formData.attributes.forEach((attr: { name: string; value: string }) => {
        if (attr.name.trim() !== '') {
          attributesObject[attr.name] = attr.value;
        }
      });
      output = { ...formData, attributes: attributesObject, nodeType };
    }

    if (nodeType === 'rule') {
      output.temporal = formData.temporal
        .map((t: { value: string }) => t.value.trim())
        .filter((v: string) => v !== '')
        .join('#end#');
    }

    if (nodeType === 'event') {
      output.probability = formData.probability
        .map((p: { value: string }) => p.value.trim())
        .filter((v: string) => v !== '')
        .join('#end#');
    }

    onSubmit(output);
    onClose();
  };

  const renderFields = () => {
    if (nodeType === 'entity') {
      return (
        <>
          <div className="mb-3">
            <strong>Label:</strong>
            <input
              type="text"
              className="w-full p-1 border rounded"
              value={formData.label}
              onChange={(e) => handleChange('label', e.target.value)}
            />
          </div>

          <div className="mb-2 font-semibold">Attributes:</div>
          {formData.attributes.map((attr: any) => (
            <div key={attr.id} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Name"
                className="w-1/2 p-1 border rounded"
                value={attr.name}
                onChange={(e) => handleAttributeChange(attr.id, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                className="w-1/2 p-1 border rounded"
                value={attr.value}
                onChange={(e) => handleAttributeChange(attr.id, 'value', e.target.value)}
              />
              <button
                onClick={() => removeAttribute(attr.id)}
                className="px-2 text-red-600 hover:text-red-800"
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
      return (
        <>
          {['label', 'when', 'effect'].map((field) => (
            <div key={field} className="mb-3">
              <strong className="block mb-1">
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </strong>
              <input
                type="text"
                className="w-full p-1 border rounded"
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </div>
          ))}
    
          <div className="mb-2 font-semibold">Temporal:</div>
          {formData.temporal.map((t: any, index: number) => (
            <div key={t.id} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder={`Temporal ${index + 1}`}
                className="w-full p-1 border rounded"
                value={t.value}
                onChange={(e) => {
                  const updated = formData.temporal.map((item: any) =>
                    item.id === t.id ? { ...item, value: e.target.value } : item
                  );
                  setFormData((prev: any) => ({ ...prev, temporal: updated }));
                }}
              />
              <button
                onClick={() => {
                  const updated = formData.temporal.filter((item: any) => item.id !== t.id);
                  setFormData((prev: any) => ({ ...prev, temporal: updated }));
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
              setFormData((prev: any) => ({
                ...prev,
                temporal: [...prev.temporal, { id: uuidv4(), value: '' }],
              }));
            }}
            className="px-3 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200"
          >
            + Добавить Temporal
          </button>
        </>
      );
    }

    if (nodeType === 'event') {
      return (
        <>
          <div className="mb-3">
            <strong>Entity:</strong>
            <select
              className="w-full p-1 border rounded"
              value={formData.entityId || ''}
              onChange={(e) => handleChange('entityId', e.target.value)}
            >
              <option value="">Выберите сущность</option>
              {entities?.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.data?.label || entity.id}
                </option>
              ))}
            </select>
          </div>
    
          <div className="mb-3">
            <strong>Target:</strong>
            <select
              className="w-full p-1 border rounded"
              value={formData.target || ''}
              onChange={(e) => handleChange('target', e.target.value)}
            >
              <option value="">Выберите цель</option>
              {entities?.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.data?.label || entity.id}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <strong>Trigger:</strong>
            <select
              className="w-full p-1 border rounded"
              value={formData.trigger || ''}
              onChange={(e) => handleChange('trigger', e.target.value)}
            >
              <option value="">Выберите событие</option>
              {events?.map((eventNode) => (
                <option key={eventNode.id} value={eventNode.id}>
                  {eventNode.data?.label || eventNode.id}
                </option>
              ))}
            </select>
          </div>
    
          {['label', 'requires', 'effect'].map((field) => (
            <div key={field} className="mb-3">
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
              <input
                type="text"
                className="w-full p-1 border rounded"
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </div>
          ))}
    
          <div className="mb-2 font-semibold">Probability:</div>
          {formData.probability.map((p: any, index: number) => (
            <div key={p.id} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder={`Probability ${index + 1}`}
                className="w-full p-1 border rounded"
                value={p.value}
                onChange={(e) => {
                  const updated = formData.probability.map((item: any) =>
                    item.id === p.id ? { ...item, value: e.target.value } : item
                  );
                  setFormData((prev: any) => ({ ...prev, probability: updated }));
                }}
              />
              <button
                onClick={() => {
                  const updated = formData.probability.filter((item: any) => item.id !== p.id);
                  setFormData((prev: any) => ({ ...prev, probability: updated }));
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
              setFormData((prev: any) => ({
                ...prev,
                probability: [...prev.probability, { id: uuidv4(), value: '' }],
              }));
            }}
            className="px-3 py-1 text-sm bg-gray-100 border rounded hover:bg-gray-200"
          >
            + Добавить Probability
          </button>
        </>
      );
    }

    return null;
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
