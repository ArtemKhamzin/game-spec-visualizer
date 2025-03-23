'use client';

import React, { useState } from 'react';
import { Node, Edge } from 'reactflow';
import FileUploader from './FileUploader';
import GraphCanvas from './GraphCanvas';

const EditorPage = () => {
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: []
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Редактор графа</h1>
      <FileUploader onParsed={setGraph} />
      <GraphCanvas nodes={graph.nodes} edges={graph.edges} />
    </div>
  );
};

export default EditorPage;
