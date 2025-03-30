'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  const [inspectorWidth, setInspectorWidth] = useState(300);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      nodes: applyNodeChanges(changes, prevGraph.nodes)
    }));
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const newWidth = containerRect.right - e.clientX;
    setInspectorWidth(newWidth > 150 ? newWidth : 150);
  }, [isDragging]);

  const onMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full">
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
      {/* Разделитель */}
      <div
        onMouseDown={onMouseDown}
        className="w-2 cursor-col-resize bg-gray-300"
      ></div>
      <div style={{ width: inspectorWidth }} className="p-4 border-l overflow-auto">
        <NodeInspector selectedNode={selectedNode} />
      </div>
    </div>
  );
};

export default EditorPage;
