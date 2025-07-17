"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface ModelData {
  vertices: number[][];
  faces: number[][];
  texture_coords: number[][];
  colors: number[][];
  metadata: {
    vertex_count: number;
    face_count: number;
    original_dimensions: number[];
    scale_factor: number;
  };
}

interface RockMeshProps {
  modelData: ModelData;
}

function RockMesh({ modelData }: RockMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    
    // Convert vertices to flat array
    const vertices = new Float32Array(modelData.vertices.flat());
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // Convert faces to indices
    const indices = new Uint32Array(modelData.faces.flat());
    geom.setIndex(new THREE.BufferAttribute(indices, 1));

    // Add colors if available
    if (modelData.colors && modelData.colors.length > 0) {
      const colors = new Float32Array(modelData.colors.flat());
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    // Add texture coordinates if available
    if (modelData.texture_coords && modelData.texture_coords.length > 0) {
      const uvs = new Float32Array(modelData.texture_coords.flat());
      geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    }

    // Compute normals for proper lighting
    geom.computeVertexNormals();
    
    return geom;
  }, [modelData]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: modelData.colors && modelData.colors.length > 0,
      color: modelData.colors && modelData.colors.length > 0 ? 0xffffff : 0x8B7355, // Rock color
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
  }, [modelData.colors]);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
}

interface RockModel3DProps {
  modelData: ModelData;
  className?: string;
}

export function RockModel3D({ modelData, className = "" }: RockModel3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 2]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Environment and background */}
        <Environment preset="sunset" />
        
        {/* The 3D rock model */}
        <RockMesh modelData={modelData} />
        
        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={10}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}

// Loading component for when 3D model is being prepared
export function RockModel3DLoader() {
  return (
    <div className="w-full h-full bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
          <span className="text-2xl">🗿</span>
        </div>
        <p className="font-medium mb-2">Preparing 3D Model</p>
        <p className="text-sm text-muted-foreground">Loading Three.js renderer...</p>
      </div>
    </div>
  );
}

// Error component for when 3D model fails to load
export function RockModel3DError({ error }: { error: string }) {
  return (
    <div className="w-full h-full bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 mx-auto mb-4 bg-red-200 rounded-lg flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="font-medium mb-2 text-red-700">3D Render Error</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    </div>
  );
} 