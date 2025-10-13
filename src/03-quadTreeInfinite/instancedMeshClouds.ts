import * as THREE from 'three';

export class InstancedMeshClouds {
  mesh: THREE.InstancedMesh;
  material: THREE.ShaderMaterial;
  count: number;
  cameraRight = new THREE.Vector3();
  cameraUp = new THREE.Vector3();

  constructor(scene: THREE.Scene, count = 500, texture: THREE.Texture) {
    this.count = count;

    const geometry = new THREE.PlaneGeometry(1, 1);

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: texture },
        uCameraRight: { value: new THREE.Vector3() },
        uCameraUp: { value: new THREE.Vector3() },
      },
      vertexShader: /* glsl */`
        uniform vec3 uCameraRight;
        uniform vec3 uCameraUp;
        attribute vec3 instanceOffset;
        attribute float instanceScale;
        varying vec2 vUv;

        void main() {
          vUv = uv;

          // Compute billboard vertex position
          vec3 pos = (uCameraRight * position.x + uCameraUp * position.y) * instanceScale;
          vec3 worldPos = instanceOffset + pos;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D uMap;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(uMap, vUv);
          if (color.a < 0.05) discard; // soft edges
          gl_FragColor = vec4(color.rgb, color.a);
        }
      `
    });

    this.mesh = new THREE.InstancedMesh(geometry, this.material, count);

    // Custom per-instance attributes
    const offsets = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      offsets[i * 3 + 0] = (Math.random() - 0.5) * 100;
      offsets[i * 3 + 1] = Math.random() * 20 + 10;  // height
      offsets[i * 3 + 2] = (Math.random() - 0.5) * 100;
      scales[i] = Math.random() * 5 + 5;
    }

    geometry.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scales, 1));

    scene.add(this.mesh);
  }

  update(camera: THREE.Camera) {
    // Compute camera right and up vectors
    const m = camera.matrixWorld.elements;
    this.cameraRight.set(m[0], m[1], m[2]).normalize();
    this.cameraUp.set(m[4], m[5], m[6]).normalize();

    this.material.uniforms.uCameraRight.value.copy(this.cameraRight);
    this.material.uniforms.uCameraUp.value.copy(this.cameraUp);
  }
}