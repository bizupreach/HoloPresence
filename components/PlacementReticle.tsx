
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PlacementReticleProps {
  onPlace: (position: THREE.Vector3) => void;
  isPlaced: boolean;
}

const PlacementReticle: React.FC<PlacementReticleProps> = ({ onPlace, isPlaced }) => {
  const reticleRef = useRef<THREE.Group>(null);
  const [hitTestSource, setHitTestSource] = useState<any>(null);
  const { gl } = useThree();

  useEffect(() => {
    let localHitTestSource: any = null;
    let session: any = null;

    const setupHitTest = async () => {
      session = gl.xr.getSession();
      if (!session) return;

      try {
        const refSpace = await session.requestReferenceSpace('viewer');
        if (session.requestHitTestSource) {
          localHitTestSource = await session.requestHitTestSource({ space: refSpace });
          setHitTestSource(localHitTestSource);
        }
      } catch (err) {
        console.warn("Markerless Hit Test Source could not be initialized:", err);
      }

      const onSelect = () => {
        if (reticleRef.current && !isPlaced && reticleRef.current.visible) {
          onPlace(reticleRef.current.position.clone());
        }
      };

      session.addEventListener('select', onSelect);
    };

    if (gl.xr.getSession()) {
      setupHitTest();
    }
    
    const onStart = () => setupHitTest();
    gl.xr.addEventListener('sessionstart', onStart);

    return () => {
      gl.xr.removeEventListener('sessionstart', onStart);
      if (localHitTestSource && localHitTestSource.cancel) {
        localHitTestSource.cancel();
      }
    };
  }, [gl.xr, onPlace, isPlaced]);

  useFrame((state, delta, frame: any) => {
    if (!hitTestSource || isPlaced || !reticleRef.current) {
      if (reticleRef.current) reticleRef.current.visible = false;
      return;
    }

    if (frame) {
      const referenceSpace = gl.xr.getReferenceSpace();
      if (!referenceSpace) return;

      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);

        if (pose) {
          reticleRef.current.visible = true;
          reticleRef.current.position.set(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
          );
          reticleRef.current.quaternion.set(
            pose.transform.orientation.x,
            pose.transform.orientation.y,
            pose.transform.orientation.z,
            pose.transform.orientation.w
          );
        } else {
          reticleRef.current.visible = false;
        }
      } else {
        reticleRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={reticleRef} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.09, 0.11, 48]} />
        <meshBasicMaterial color="white" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.02, 32]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.11, 0.12, 48]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

export default PlacementReticle;
