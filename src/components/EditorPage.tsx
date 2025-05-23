'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge, applyNodeChanges, NodeChange } from 'reactflow';
import FileUploader from './FileUploader';
import GraphCanvas from './GraphCanvas';
import NodeInspector from './NodeInspector';
import AddNodeModal from './AddNodeModal';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ProjectSidebar from './ProjectSidebar';
import { graphToSpec } from '@/../backend/src/exporters/generateSpec';
import { fetchProjects, saveProject } from '@/api/projects';
import { deleteProject } from '@/api/projects';

let idCounter = 1;

const EditorPage = () => {
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [inspectorWidth, setInspectorWidth] = useState(300);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [draggingSide, setDraggingSide] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [modalType, setModalType] = useState<null | 'rule' | 'entity' | 'event'>(null);
  const [clearFileRequest, setClearFileRequest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleSaveProject = async () => {
    const name = prompt('Введите название проекта');
    if (!name) return;
  
    try {
      const saved = await saveProject(name, graph);
      if (saved._updated) {
        alert(`Проект "${name}" перезаписан`);
      } else {
        alert(`Проект "${name}" сохранён`);
      }
      loadProjects();
    } catch (e: any) {
      alert(`Ошибка при сохранении: ${e.message || 'неизвестная ошибка'}`);
    }
  };
  
  const loadProjects = async () => {
    const list = await fetchProjects();
    setProjects(list);
  };

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
          .filter((n) => {
            return (
              n.data.nodeType === 'rule' &&
              n.data.when &&
              n.data.when.includes(data.label)
            );
          })
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

  const onMouseDownLeft = () => {
    setDraggingSide('left');
    setIsDragging(true);
  };
  
  const onMouseDownRight = () => {
    setDraggingSide('right');
    setIsDragging(true);
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingSide || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
  
    if (draggingSide === 'left') {
      const newLeftWidth = e.clientX - rect.left;
      setSidebarWidth(newLeftWidth > 150 ? newLeftWidth : 150);
    }
  
    if (draggingSide === 'right') {
      const newRightWidth = rect.right - e.clientX;
      setInspectorWidth(newRightWidth > 150 ? newRightWidth : 150);
    }
  }, [draggingSide]);
  

  const onMouseUp = useCallback(() => setDraggingSide(null), []);

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
      <div
        style={{ width: sidebarWidth }}
        className="p-4 border-r overflow-auto h-full flex-shrink-0 bg-[var(--background)]"
      >
        <ProjectSidebar
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setShowLoginModal(true)}
          onRegisterClick={() => setShowRegisterModal(true)}
          onLogout={() => {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
          }}
          projects={projects}
          onProjectClick={(project) => {
            setGraph(project.data);
            setSelectedProjectId(project.id);
          }}
          selectedProjectId={selectedProjectId}
          onDeleteProject={async (id: string) => {
            try {
              await deleteProject(id);
              loadProjects();
            } catch (err: any) {
              alert(err.message || 'Ошибка при удалении');
            }
          }}
        />
      </div>
      <div onMouseDown={onMouseDownLeft} className="w-2 cursor-col-resize bg-gray-300" />
      <div className="flex-1 h-full p-4 overflow-hidden">
        <h1 className="text-xl font-bold mb-4">Редактор</h1>
        <div className="mb-4 flex items-center gap-4">
          <FileUploader onParsed={setGraph} onClearRequest={clearFileRequest} />
                
          <button
            onClick={handleExportSpec}
            className="px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Выгрузить в .spec
          </button>
                
          <div className="ml-auto flex gap-3 items-center">
            {isLoggedIn && (
              <div
                onClick={handleSaveProject}
                title="Сохранить проект"
                className="cursor-pointer"
              >
                <img
                  src="/assets/icons/save_icon.svg"
                  alt="Сохранить"
                  className="w-7 h-7 hover:opacity-80"
                />
              </div>
            )}

            <div className="relative group cursor-pointer" title="Добавить узел">
              <img src="/assets/icons/add_icon.svg" alt="Добавить" className="w-7 h-7" />
          
              <div className="absolute right-0 top-full mt-0 w-40 bg-white border rounded shadow-lg z-10 hidden group-hover:block">
                {[
                  { type: 'rule', label: 'Правило', hover: 'hover:bg-red-100 hover:text-red-700' },
                  { type: 'entity', label: 'Сущность', hover: 'hover:bg-green-100 hover:text-green-700' },
                  { type: 'event', label: 'Событие', hover: 'hover:bg-blue-100 hover:text-blue-700' },
                ].map((item) => (
                  <div
                    key={item.type}
                    onClick={() => setModalType(item.type as 'entity' | 'event' | 'rule')}
                    className={`px-4 py-2 cursor-pointer flex items-center gap-2 ${item.hover}`}
                  >
                    ➕ {item.label}
                  </div>
                ))}
              </div>
            </div>
              
            <div
              onClick={() => {
                setGraph({ nodes: [], edges: [] });
                setSelectedNode(null);
                setClearFileRequest(true);
                setTimeout(() => setClearFileRequest(false), 0);
              }}
              title="Очистить редактор"
              className="cursor-pointer"
            >
              <img
                src="/assets/icons/clear_icon.svg"
                alt="Очистить"
                className="w-7 h-7 hover:opacity-80"
              />
            </div>
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

      <div onMouseDown={onMouseDownRight} className="w-2 cursor-col-resize bg-gray-300" />

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

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            loadProjects();
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onOpenLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
};

export default EditorPage;
