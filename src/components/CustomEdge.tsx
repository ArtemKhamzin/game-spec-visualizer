'use client';

import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from 'reactflow';

interface CustomEdgeProps extends EdgeProps {
}

const getEdgeStyle = (edgeType: string | undefined) => {
  switch (edgeType) {
    case 'rule-effect':
      return { stroke: 'red', strokeWidth: 2 };
    case 'trigger':
      return { stroke: 'blue', strokeDasharray: '5,5', strokeWidth: 2 };
    case 'target':
      return { stroke: 'green', strokeWidth: 2 };
    case 'owns-event':
      return { stroke: 'purple', strokeWidth: 2 };
    default:
      return { stroke: '#999', strokeWidth: 1 };
  }
};

const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  data,
}) => {
  const edgeType = data?.edgeType;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  const style = getEdgeStyle(edgeType);

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            fontSize: 10,
            padding: '2px 4px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: 4,
            pointerEvents: 'none',
          }}
        >
          {edgeType}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
