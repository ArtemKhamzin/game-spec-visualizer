'use client';

import React, { useState } from 'react';
import { Node, Edge, MarkerType } from 'reactflow';

interface Props {
  onParsed: (graph: { nodes: Node[]; edges: Edge[] }) => void;
}

const FileUploader: React.FC<Props> = ({ onParsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
        body: formData
      });

      const json = await res.json();
      const { nodes, edges } = json.data;

      const positioned = nodes.map((n: Node, i: number) => ({
        ...n,
        position: { x: (i % 5) * 250, y: Math.floor(i / 5) * 180 }
      }));

      const withIds = edges.map((e: Edge) => ({
        ...e,
        id: `e-${e.source}-${e.target}`,
        markerEnd: { type: MarkerType.ArrowClosed }
      }));

      onParsed({ nodes: positioned, edges: withIds });
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <input type="file" accept=".spec" onChange={handleFileChange} />
      <button
        onClick={handleParseClick}
        disabled={!file || loading}
        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Загрузка...' : 'Отобразить'}
      </button>
    </div>
  );
};

export default FileUploader;
