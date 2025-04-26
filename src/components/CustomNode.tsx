'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const getNodeStyle = (nodeType: string | undefined) => {
  switch (nodeType) {
    case 'entity':
      return { backgroundColor: '#e0ffe0', border: '2px solid #00aa00' };
    case 'event':
      return { backgroundColor: '#e0e0ff', border: '2px solid #0000aa' };
    case 'rule':
      return { backgroundColor: '#ffe0e0', border: '2px solid #aa0000' };
    default:
      return { backgroundColor: '#fff', border: '2px solid #ddd' };
  }
};

const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeType = data?.nodeType || 'не указан';
  const customStyle = getNodeStyle(nodeType);

  let selectedShadow;
  if (selected) {
    if (data.nodeType === 'rule') {
      selectedShadow = '0 0 15px 5px rgba(220, 53, 69, 0.6)';
    } else if (data.nodeType === 'entity') {
      selectedShadow = '0 0 15px 5px rgba(40, 167, 69, 0.6)';
    } else {
      selectedShadow = '0 0 15px 5px rgba(0, 98, 255, 0.6)';
    }
  }  

  return (
    <div
      style={{
        padding: 10,
        borderRadius: 5,
        fontSize: 12,
        textAlign: 'center',
        minWidth: 120,
        boxShadow: selectedShadow,
        ...customStyle,
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{data.label}</div>
      <div style={{ fontSize: 10, color: '#555' }}>Type: {nodeType}</div>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

export default CustomNode;
