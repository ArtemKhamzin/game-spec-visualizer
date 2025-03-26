'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div
      style={{
        padding: 10,
        border: '1px solid #ddd',
        borderRadius: 5,
        backgroundColor: selected ? '#e6f7ff' : '#fff',
        fontSize: 12,
        textAlign: 'center',
        minWidth: 120,
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{data.label}</div>
      <div style={{ fontSize: 10, color: '#555' }}>
        Type: {data.nodeType || 'не указан'}
      </div>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

export default CustomNode;
