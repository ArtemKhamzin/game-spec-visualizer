'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge, applyNodeChanges, NodeChange } from 'reactflow';
import FileUploader from './FileUploader';
import GraphCanvas from './GraphCanvas';
import NodeInspector from './NodeInspector';
import AddNodeModal from './AddNodeModal';
import { graphToSpec } from '@/../backend/src/exporters/generateSpec';

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

  const deleteNode = (nodeId: string) => {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((node) => node.id !== nodeId),
      edges: prev.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    }));
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleExportSpec = () => {
    console.log('nodes', graph.nodes);
    console.log('edges', graph.edges);
  
    const spec = graphToSpec(graph.nodes, graph.edges);
    console.log('spec output:', spec);
  
    const blob = new Blob([spec], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph-export.spec';
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateRuleEdges = (ruleId: string, newWhen: string) => {
    setGraph((prev) => {
      const updatedEdges = prev.edges.filter(
        (edge) => !(edge.source === ruleId && edge.data?.edgeType === 'rule-effect')
      );
  
      const entityNodes = prev.nodes.filter((n) => n.data.nodeType === 'entity');
  
      const newEdges = entityNodes
        .filter((entity) => newWhen.includes(entity.data.label))
        .map((entity) => ({
          id: `e-${ruleId}-${entity.id}`,
          source: ruleId,
          target: entity.id,
          type: 'customEdge',
          data: { edgeType: 'rule-effect' },
        }));
  
      return {
        ...prev,
        edges: [...updatedEdges, ...newEdges],
      };
    });
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

    setGraph((prev) => {
      const newNodes = [...prev.nodes, newNode];
      let newEdges = prev.edges;
      if (data.nodeType === 'event' && data.entityId) {
        const newEdge: Edge = {
          id: `e-${data.entityId}-${newNode.id}`,
          source: data.entityId,
          target: newNode.id,
          type: 'customEdge',
          data: { edgeType: 'owns-event' },
        };
        newEdges = [...prev.edges, newEdge];
      }
      
      if (data.nodeType === 'rule') {
        const ruleEdges: Edge[] = prev.nodes
          .filter((n) => {
            return n.data.nodeType === 'entity' && data.when && data.when.includes(n.data.label);
          })
          .map((entityNode) => ({
            id: `e-${newNode.id}-${entityNode.id}`,
            source: newNode.id,
            target: entityNode.id,
            type: 'customEdge',
            data: { edgeType: 'rule-effect' },
          }));
        newEdges = [...newEdges, ...ruleEdges];
      }

      if (data.nodeType === 'entity') {
        const entityEdges: Edge[] = prev.nodes
          .filter((n) => n.data.nodeType === 'rule')
          .map((ruleNode) => ({
            id: `e-${ruleNode.id}-${newNode.id}`,
            source: ruleNode.id,
            target: newNode.id,
            type: 'customEdge',
            data: { edgeType: 'rule-effect' },
          }));
        newEdges = [...newEdges, ...entityEdges];
      }

      if (data.nodeType === 'event' && data.target) {
        const targetEdge: Edge = {
          id: `e-${id}-${data.target}`,
          source: id,
          target: data.target,
          type: 'customEdge',
          data: { edgeType: 'target' },
        };
        newEdges.push(targetEdge);
      }

      if (data.nodeType === 'event' && data.trigger) {
        const triggerEdge: Edge = {
          id: `e-${data.trigger}-${id}`,
          source: data.trigger,
          target: id,
          type: 'customEdge',
          data: { edgeType: 'trigger' },
        };
        newEdges.push(triggerEdge);
      }
      
      return { nodes: newNodes, edges: newEdges };
    });
  };

  const updateEventEdge = (eventNodeId: string, newEntityId: string) => {
    setGraph((prev) => {
      const filteredEdges = prev.edges.filter(
        (edge) =>
          !(edge.target === eventNodeId && edge.data && edge.data.edgeType === 'owns-event')
      );
      let newEdges = filteredEdges;
      if (newEntityId && newEntityId.trim() !== '') {
        const newEdge: Edge = {
          id: `e-${newEntityId}-${eventNodeId}`,
          source: newEntityId,
          target: eventNodeId,
          type: 'customEdge',
          data: { edgeType: 'owns-event' },
        };
        newEdges = [...filteredEdges, newEdge];
      }
      return { ...prev, edges: newEdges };
    });
  };

  const updateTargetEdge = (eventNodeId: string, newTargetId: string) => {
    setGraph((prev) => {
      const filteredEdges = prev.edges.filter(
        (edge) =>
          !(edge.source === eventNodeId && edge.data?.edgeType === 'target')
      );
  
      const newEdge: Edge = {
        id: `e-${eventNodeId}-${newTargetId}`,
        source: eventNodeId,
        target: newTargetId,
        type: 'customEdge',
        data: { edgeType: 'target' },
      };
  
      return {
        ...prev,
        edges: [...filteredEdges, newEdge],
      };
    });
  };  

  const updateTriggerEdge = (eventNodeId: string, newTriggerSourceId: string) => {
    setGraph((prev) => {
      const filteredEdges = prev.edges.filter(
        (edge) =>
          !(edge.target === eventNodeId && edge.data?.edgeType === 'trigger')
      );
  
      const newEdge: Edge = {
        id: `e-${newTriggerSourceId}-${eventNodeId}`,
        source: newTriggerSourceId,
        target: eventNodeId,
        type: 'customEdge',
        data: { edgeType: 'trigger' },
      };
  
      return {
        ...prev,
        edges: [...filteredEdges, newEdge],
      };
    });
  };  

  const selectNodeById = (id: string) => {
    setGraph((prev) => ({
      nodes: prev.nodes.map((node) => ({
        ...node,
        selected: node.id === id,
      })),
      edges: prev.edges,
    }));
  
    const node = graph.nodes.find((n) => n.id === id);
    if (node) setSelectedNode(node);
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

  const entityNodes = graph.nodes.filter(
    (node) => node.data.nodeType === 'entity'
  );

  const eventNodes = graph.nodes.filter(
    (node) => node.data.nodeType === 'event'
  );

  return (
    <div ref={containerRef} className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1 h-full p-4 overflow-hidden">
        <h1 className="text-xl font-bold mb-4">Редактор графа</h1>
        <div className="mb-4 flex items-center gap-4">
          <FileUploader onParsed={setGraph} />
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => {
              setGraph({ nodes: [], edges: [] });
              setSelectedNode(null);
            }}
          >
            Очистить все
          </button>

          <button
            onClick={handleExportSpec}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Экспорт в .spec
          </button>
          
          <div className="ml-auto flex gap-4">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => setModalType('rule')}
            >
              Добавить правило
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setModalType('entity')}
            >
              Добавить сущность
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setModalType('event')}
            >
              Добавить событие
            </button>
          </div>
        </div>

        <GraphCanvas
          nodes={graph.nodes}
          edges={graph.edges}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onPaneClick={() => {
            setSelectedNode(null);
            setGraph((prev) => ({
              nodes: prev.nodes.map((node) => ({
                ...node,
                selected: false,
              })),
              edges: prev.edges,
            }));
          }}
        />
      </div>

      <div onMouseDown={onMouseDown} className="w-2 cursor-col-resize bg-gray-300" />

      <div
        style={{ width: inspectorWidth }}
        className="p-4 border-l overflow-auto h-full flex-shrink-0"
      >
        <NodeInspector
          selectedNode={selectedNode}
          onUpdateNode={updateNodeData}
          onDeleteNode={deleteNode}
          onUpdateEventEdge={updateEventEdge}
          onUpdateTargetEdge={updateTargetEdge}
          onUpdateTriggerEdge={updateTriggerEdge}
          onUpdateRuleEdges={updateRuleEdges}
          onSelectNode={selectNodeById}
          events={eventNodes}
          entities={entityNodes}
          edges={graph.edges}
        />
      </div>

      {modalType && (
        <AddNodeModal
          nodeType={modalType}
          onClose={() => setModalType(null)}
          onSubmit={handleAddNode}
          entities={modalType === 'event' ? entityNodes : undefined}
          events={modalType === 'event' ? eventNodes : undefined}
        />
      )}
    </div>
  );
};

export default EditorPage;
