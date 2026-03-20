'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

interface HairSceneProps {
  className?: string;
  enableControls?: boolean;
  enablePhysics?: boolean;
  backgroundColor?: string;
  cameraPosition?: [number, number, number];
}

function SceneContent() {
  return (
    <>
      {/* Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Environment Lighting */}
      <Environment preset="studio" />
      
      {/* Placeholder Hair Model */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color="#8B4513"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Face Base */}
      <mesh position={[0, -1.5, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.2, 32]} />
        <meshStandardMaterial 
          color="#FDBCB4"
          roughness={0.4}
        />
      </mesh>
      
      {/* Ground Grid */}
      <Grid
        infiniteGrid
        cellSize={0.5}
        cellThickness={0.5}
        sectionSize={5}
        sectionThickness={1}
        fadeDistance={30}
        fadeStrength={1}
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">Loading 3D Scene...</p>
      </div>
    </div>
  );
}

export function HairScene({
  className = '',
  enableControls = true,
  enablePhysics = false,
  backgroundColor = '#f0f0f0',
  cameraPosition = [5, 5, 5],
}: HairSceneProps) {
  return (
    <div className={`three-container ${className}`}>
      <Canvas
        shadows
        camera={{
          position: cameraPosition,
          fov: 45,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        scene={{
          background: new THREE.Color(backgroundColor),
        }}
      >
        <Suspense fallback={null}>
          <SceneContent />
          
          {/* Camera Controls */}
          {enableControls && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2}
            />
          )}
        </Suspense>
      </Canvas>
      
      <Suspense fallback={<LoadingFallback />}>
        <div />
      </Suspense>
    </div>
  );
}