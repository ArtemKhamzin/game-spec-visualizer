'use client';

import React from 'react';
import { Node } from 'reactflow';

interface Props {
  selectedNode: Node | null;
}

const renderData = (data: any, prefix: string = ''): React.ReactNode => {
  return Object.entries(data).flatMap(([key, value]) => {
    if (key === 'attributes') {
      return renderData(value, '');
    }
    const displayKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={displayKey} className="ml-4">
          <strong>{displayKey}:</strong>
          {renderData(value, displayKey)}
        </div>
      );
    }
    return (
      <div key={displayKey}>
        <strong>{displayKey}:</strong> {String(value)}
      </div>
    );
  });
};

const NodeInspector: React.FC<Props> = ({ selectedNode }) => {
  if (!selectedNode) return <div>Узел не выбран</div>;

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Свойства узла</h2>
      <div className="text-sm">
        <div>
          <strong>ID:</strong> {selectedNode.id}
        </div>
        {renderData(selectedNode.data)}
      </div>
    </div>
  );
};

export default NodeInspector;
