'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge, applyNodeChanges, NodeChange } from 'reactflow';
import FileUploader from './FileUploader';
import GraphCanvas from './GraphCanvas';
import NodeInspector from './NodeInspector';
import AddNodeModal from './AddNodeModal';

let idCounter = 1;

const EditorPage = () => {
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [inspectorWidth, setInspectorWidth] = useState(300);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [modalType, setModalType] = useState<null | 'rule' | 'entity' | 'event'>(null);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      nodes: applyNodeChanges(changes, prevGraph.nodes),
    }));
  }, []);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeData = (nodeId: string, newData: any) => {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: newData } : node
      ),
    }));
  };

  const handleAddNode = (data: any) => {
    const id = `${data.nodeType}-${idCounter++}`;
    const offsetX = 100 + idCounter * 40;
    const offsetY = 100 + idCounter * 60;
    const newNode: Node = {
      id,
      type: 'custom',
      position: { x: offsetX, y: offsetY },
      data,
    };

    setGraph((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
  };

  const onMouseDown = () => setIsDragging(true);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;
    setInspectorWidth(newWidth > 150 ? newWidth : 150);
  }, [isDragging]);

  const onMouseUp = useCallback(() => setIsDragging(false), [isDragging]);

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
    <div ref={containerRef} className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1 h-full p-4 overflow-hidden">
        <h1 className="text-xl font-bold mb-4">Редактор графа</h1>

        <div className="mb-4 flex gap-4">
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => setModalType('rule')}>
            Добавить правило
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => setModalType('entity')}>
            Добавить сущность
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setModalType('event')}>
            Добавить событие
          </button>
        </div>

        <FileUploader onParsed={setGraph} />
        <GraphCanvas
          nodes={graph.nodes}
          edges={graph.edges}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
        />
      </div>

      <div onMouseDown={onMouseDown} className="w-2 cursor-col-resize bg-gray-300" />

      <div
        style={{ width: inspectorWidth }}
        className="p-4 border-l overflow-auto h-full flex-shrink-0"
      >
        <NodeInspector selectedNode={selectedNode} onUpdateNode={updateNodeData} />
      </div>

      {modalType && (
        <AddNodeModal
          nodeType={modalType}
          onClose={() => setModalType(null)}
          onSubmit={handleAddNode}
        />
      )}
    </div>
  );
};

export default EditorPage;
