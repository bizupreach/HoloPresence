
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

/**
 * ChromaKeyMaterial
 * Removes green background (0, 1, 0) from a texture.
 */
const ChromaKeyMaterialImpl = shaderMaterial(
  {
    uTexture: null,
    uColor: new THREE.Color(0.0, 1.0, 0.0),
    uSimilarity: 0.4,
    uSmoothness: 0.08,
    uSpill: 0.1,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform sampler2D uTexture;
    uniform vec3 uColor;
    uniform float uSimilarity;
    uniform float uSmoothness;
    uniform float uSpill;
    varying vec2 vUv;

    void main() {
      vec4 videoColor = texture2D(uTexture, vUv);
      
      float distance = distance(videoColor.rgb, uColor);
      float alpha = smoothstep(uSimilarity, uSimilarity + uSmoothness, distance);
      
      // Basic spill reduction: if it's close to green, desaturate the green channel a bit
      float spillVal = pow(smoothstep(uSimilarity, uSimilarity + uSpill, distance), 1.5);
      vec3 finalColor = mix(videoColor.rgb, vec3(videoColor.r, (videoColor.r + videoColor.b) * 0.5, videoColor.b), 1.0 - spillVal);

      gl_FragColor = vec4(finalColor, alpha);
      
      if (gl_FragColor.a < 0.1) discard;
    }
  `
);

extend({ ChromaKeyMaterialImpl });

export default ChromaKeyMaterialImpl;
