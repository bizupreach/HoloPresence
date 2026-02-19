
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

/**
 * ChromaKeyMaterial
 * Advanced green screen removal with spill suppression.
 */
const ChromaKeyMaterialImpl = shaderMaterial(
  {
    uTexture: null,
    uColor: new THREE.Color(0.05, 0.63, 0.14), // Targeted green from standard chroma backgrounds
    uSimilarity: 0.35,
    uSmoothness: 0.1,
    uSpill: 0.15,
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
      
      // Calculate distance in RGB space for chroma keying
      float dist = distance(videoColor.rgb, uColor);
      
      // Create alpha mask based on similarity to target green
      float alpha = smoothstep(uSimilarity, uSimilarity + uSmoothness, dist);
      
      // Spill suppression: reduce green influence on non-keyed areas
      float spillVal = pow(smoothstep(uSimilarity, uSimilarity + uSpill, dist), 1.5);
      vec3 desaturatedGreen = vec3(videoColor.r, (videoColor.r + videoColor.b) * 0.5, videoColor.b);
      vec3 finalColor = mix(desaturatedGreen, videoColor.rgb, spillVal);

      gl_FragColor = vec4(finalColor, alpha);
      
      // Discard pixels to ensure perfect transparency for WebGL depth testing
      if (gl_FragColor.a < 0.05) discard;
    }
  `
);

extend({ ChromaKeyMaterialImpl });

export default ChromaKeyMaterialImpl;
