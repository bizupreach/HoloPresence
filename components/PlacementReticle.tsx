
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface PlacementReticleProps {
  onPlace: (position: THREE.Vector3) => void;
  isPlaced: boolean;
}

const PlacementReticle: React.FC<PlacementReticleProps> = ({ onPlace, isPlaced }) => {
  const reticleRef = useRef<THREE.Group>(null);
  const [hitTestSource, setHitTestSource] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(true);
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
        console.error("Hit Test Source failed:", err);
      }

      const onSelect = () => {
        if (reticleRef.current && !isPlaced && reticleRef.current.visible) {
          onPlace(reticleRef.current.position.clone());
        }
      };

      session.addEventListener('select', onSelect);
    };

    if (gl.xr.getSession()) setupHitTest();
    gl.xr.addEventListener('sessionstart', setupHitTest);

    return () => {
      gl.xr.removeEventListener('sessionstart', setupHitTest);
      if (localHitTestSource?.cancel) localHitTestSource.cancel();
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
          setIsSearching(false);
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
        }
      } else {
        reticleRef.current.visible = false;
        setIsSearching(true);
      }
    }
  });

  return (
    <group ref={reticleRef} visible={false}>
      {/* Visual Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.14, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      
      {/* Inner Point */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.02, 32]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Floating Instruction Text */}
      {!isPlaced && !isSearching && (
        <Html position={[0, 0.2, 0]} center>
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg whitespace-nowrap animate-bounce pointer-events-none">
            Tap to Place Mira
          </div>
        </Html>
      )}
    </group>
  );
};

export default PlacementReticle;
