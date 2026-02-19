
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import './ChromaKeyMaterial';

interface ARAvatarProps {
  videoUrl: string;
  position: [number, number, number];
  rotation?: number;
}

const ARAvatar: React.FC<ARAvatarProps> = ({ 
  videoUrl, 
  position, 
  rotation = 0 
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const materialRef = useRef<any>(null);
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'Anonymous';
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    
    video.onloadedmetadata = () => {
      setAspect(video.videoWidth / video.videoHeight);
    };

    // Force play on mount - usually works if triggered by user gesture (like the AR placement tap)
    video.play().catch(err => {
      console.warn("Autoplay blocked, waiting for interaction:", err);
      // Fallback: try to play again on next touch
      const playHandler = () => {
        video.play();
        window.removeEventListener('touchstart', playHandler);
      };
      window.addEventListener('touchstart', playHandler);
    });
    
    videoRef.current = video;
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = texture;

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

  const height = 1.8; // Life-size height in meters
  const width = height * aspect;

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
