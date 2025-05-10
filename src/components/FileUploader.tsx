'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Node, Edge, MarkerType } from 'reactflow';

interface Props {
  onParsed: (graph: { nodes: Node[]; edges: Edge[] }) => void;
  onClearRequest?: boolean;
}

const FileUploader: React.FC<Props> = ({ onParsed, onClearRequest }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleParseClick = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/parser/upload', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      const { nodes, edges } = json.data;

      const order = ['rule', 'entity', 'event'];
      const groups: { [key: string]: Node[] } = {};

      nodes.forEach((n: Node) => {
        const t = typeof n.type === 'string' && ['rule', 'entity', 'event'].includes(n.type) ? n.type : 'event';
        if (!groups[t]) groups[t] = [];
        groups[t].push(n);
      });

      const spacingY = 200;
      const spacingX = 250;
      const positionedNodes: Node[] = [];

      order.forEach((type, groupIndex) => {
        const groupNodes = groups[type] || [];
        groupNodes.forEach((node, index) => {
          positionedNodes.push({
            ...node,
            position: { x: index * spacingX, y: groupIndex * spacingY },
            type: 'custom',
            data: {
              ...node.data,
              nodeType: node.type,
            },
          });
        });
      });

      const withIds: Edge[] = edges.map((e: Edge) => ({
        ...e,
        id: `e-${e.source}-${e.target}`,
        markerEnd: { type: MarkerType.ArrowClosed },
        type: 'customEdge',
        data: {
          ...e.data,
          edgeType: e.type,
        },
      }));

      withIds.forEach((edge) => {
        if (edge.data?.edgeType === 'owns-event') {
          const targetNode = positionedNodes.find((n) => n.id === edge.target);
          if (targetNode?.data?.nodeType === 'event') {
            targetNode.data.entityId = edge.source;
          }
        }
      });

      onParsed({ nodes: positionedNodes, edges: withIds });
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (onClearRequest) {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onClearRequest]);

  return (
    <div className="flex items-center gap-4">
      <label className="relative cursor-pointer inline-block px-2 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
        Загрузить .spec
        <input
          ref={fileInputRef}
          type="file"
          accept=".spec"
          onChange={handleFileChange}
          className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
        />
      </label>
      <span className="text-sm text-gray-600">
        {file ? file.name : "Файл не выбран"}
      </span>
      <button
        onClick={handleParseClick}
        disabled={!file || loading}
        className="px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Загрузка...' : 'Отобразить'}
      </button>
    </div>
  );
};

export default FileUploader;
