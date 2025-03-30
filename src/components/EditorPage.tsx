'use client';

import React, { useState, useCallback } from 'react';
import { Node, Edge, applyNodeChanges, NodeChange } from 'reactflow';
import FileUploader from './FileUploader';
import GraphCanvas from './GraphCanvas';
import NodeInspector from './NodeInspector';

const EditorPage = () => {
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: []
  });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      nodes: applyNodeChanges(changes, prevGraph.nodes)
    }));
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4">
        <h1 className="text-xl font-bold mb-4">Редактор графа</h1>
        <FileUploader onParsed={setGraph} />
        <GraphCanvas
          nodes={graph.nodes}
          edges={graph.edges}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
        />
      </div>
      <div className="w-80 p-4 border-l">
        <NodeInspector selectedNode={selectedNode} />
      </div>
    </div>
  );
};

export default EditorPage;
