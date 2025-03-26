'use client';

import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Node,
  Edge,
  NodeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
}

const nodeTypes = {
  custom: CustomNode,
};

const GraphCanvas: React.FC<Props> = ({ nodes, edges, onNodesChange }) => {
  return (
    <ReactFlowProvider>
      <div className="h-[80vh] w-full border rounded shadow bg-gray-100">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          fitView
          nodeTypes={nodeTypes}
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
