'use client';

import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Node,
  Edge,
  NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
}

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  customEdge: CustomEdge,
};

const GraphCanvas: React.FC<Props> = ({ nodes, edges, onNodesChange, onNodeClick }) => {
  return (
    <ReactFlowProvider>
      <div className="h-[80vh] w-full border rounded shadow bg-gray-100">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
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
