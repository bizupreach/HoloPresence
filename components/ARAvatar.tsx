
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import './ChromaKeyMaterial';

interface ARAvatarProps {
  videoUrl: string;
  position: [number, number, number];
  scale?: number;
  rotation?: number;
}

const ARAvatar: React.FC<ARAvatarProps> = ({ 
  videoUrl, 
  position, 
  scale = 1.8, // Default life-size (1.8 meters)
  rotation = 0 
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const materialRef = useRef<any>(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'Anonymous';
    video.loop = true;
    video.muted = false; // Note: Sound requires user interaction
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    video.play().catch(err => console.warn("Video play blocked until interaction:", err));
    
    videoRef.current = video;
    textureRef.current = new THREE.VideoTexture(video);
    textureRef.current.minFilter = THREE.LinearFilter;
    textureRef.current.magFilter = THREE.LinearFilter;
    textureRef.current.format = THREE.RGBAFormat;

    return () => {
      video.pause();
      video.src = "";
      video.load();
    };
  }, [videoUrl]);

  useFrame(() => {
    if (materialRef.current && textureRef.current) {
      materialRef.current.uTexture = textureRef.current;
    }
  });

  // Calculate aspect ratio of video to maintain proportions
  // We assume a standard vertical or horizontal video, adjusted to life-size height
  const width = 1.0; 
  const height = 1.8;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, height / 2, 0]}>
        <planeGeometry args={[width, height]} />
        {/* @ts-ignore */}
        <chromaKeyMaterialImpl 
          ref={materialRef} 
          transparent={true} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default ARAvatar;
