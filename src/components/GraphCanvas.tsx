'use client';

import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

interface Props {
  nodes: Node[];
  edges: Edge[];
}

const GraphCanvas: React.FC<Props> = ({ nodes, edges }) => {
  return (
    <ReactFlowProvider>
      <div className="h-[80vh] w-full border rounded shadow bg-gray-100">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default GraphCanvas;
