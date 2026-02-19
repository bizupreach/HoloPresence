
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR } from '@react-three/xr';
import * as THREE from 'three';
import ARAvatar from './ARAvatar';
import PlacementReticle from './PlacementReticle';

interface ARViewProps {
  videoUrl: string;
  store: any;
}

const ARView: React.FC<ARViewProps> = ({ videoUrl, store }) => {
  const [placedPosition, setPlacedPosition] = useState<THREE.Vector3 | null>(null);

  const handlePlace = (pos: THREE.Vector3) => {
    setPlacedPosition(pos);
  };

  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas>
        <XR store={store}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <PlacementReticle onPlace={handlePlace} isPlaced={!!placedPosition} />
          
          {placedPosition && (
            <ARAvatar 
              videoUrl={videoUrl} 
              position={[placedPosition.x, placedPosition.y, placedPosition.z]} 
            />
          )}
        </XR>
      </Canvas>
    </div>
  );
};

export default ARView;
