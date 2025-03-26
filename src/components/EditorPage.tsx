'use client';

import React, { useState, useCallback } from 'react';
import { Node, Edge, applyNodeChanges, NodeChange } from 'reactflow';
import FileUploader from './FileUploader';
import GraphCanvas from './GraphCanvas';

const EditorPage = () => {
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: []
  });

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      nodes: applyNodeChanges(changes, prevGraph.nodes)
    }));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Редактор графа</h1>
      <FileUploader onParsed={setGraph} />
      <GraphCanvas
        nodes={graph.nodes}
        edges={graph.edges}
        onNodesChange={onNodesChange}
      />
    </div>
  );
};

export default EditorPage;
