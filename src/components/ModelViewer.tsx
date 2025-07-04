
'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

function Model({ scale }: { scale: number }) {
    // The user will place their model at this path
    const { scene } = useGLTF('/models/model.glb');
    return <primitive object={scene} scale={scale} position={[0, -0.5, 0]} />;
}

useGLTF.preload('/models/model.glb');


export function ModelViewer({ scale = 1 }: { scale?: number }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Model scale={scale} />
        <Environment preset="sunset" />
      </Suspense>
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        target={[0, -0.5, 0]}
      />
    </Canvas>
  );
}
