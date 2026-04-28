'use client';

import { useEffect, useRef } from 'react';
import type * as THREE from 'three';

export type MascotState = 'idle' | 'cover' | 'wave' | 'think' | 'shake' | 'cheer' | 'loading';

export default function RobotMascot({
  className = '',
  mascotState = 'idle',
}: {
  className?: string;
  mascotState?: MascotState;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<MascotState>(mascotState);
  const prevStateRef = useRef<MascotState>(mascotState);

  useEffect(() => { stateRef.current = mascotState; }, [mascotState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf = 0, disposed = false;

    async function init() {
      const THREE = await import('three');
      if (disposed || !container) return;

      // ── Renderer ──────────────────────────────────────────────────
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 0.05, 3.6);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
      container.appendChild(renderer.domElement);

      // ── Lights ────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const key = new THREE.DirectionalLight(0xffffff, 2.5);
      key.position.set(5, 8, 5);
      key.castShadow = true;
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xaabbff, 1.2);
      fill.position.set(-5, 2, 2);
      scene.add(fill);

      const rim = new THREE.PointLight(0xff00aa, 2, 10);
      rim.position.set(2, -2, -3);
      scene.add(rim);

      const rim2 = new THREE.PointLight(0x00ffff, 2, 10);
      rim2.position.set(-2, 3, -2);
      scene.add(rim2);

      // ── Procedural Texture ────────────────────────────────────────
      // Creates a subtle matte/carbon-like noise texture
      const createNoise = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        const imgData = ctx.createImageData(256, 256);
        for (let i = 0; i < imgData.data.length; i += 4) {
          const val = Math.random() * 255;
          imgData.data[i] = val; imgData.data[i + 1] = val; imgData.data[i + 2] = val;
          imgData.data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        return tex;
      };
      const bumpTex = createNoise();

      // ── Materials ─────────────────────────────────────────────────
      // Premium glossy plastic with subtle texture
      function bodyMat() {
        return new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.15,
          bumpMap: bumpTex,
          bumpScale: 0.0015,
        });
      }

      // Premium glass/dark visor
      const visorMat = new THREE.MeshPhysicalMaterial({
        color: 0x02040a,
        roughness: 0.1,
        metalness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });

      function cyanMat() {
        return new THREE.MeshStandardMaterial({
          color: 0x00ffff,
          emissive: 0x00ffff,
          emissiveIntensity: 1.5,
          roughness: 0.2,
        });
      }

      const jointMat = new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        roughness: 0.5,
        metalness: 0.7,
        clearcoat: 0.5,
      });

      // ── Groups ────────────────────────────────────────────────────
      const root = new THREE.Group();
      const headGroup = new THREE.Group();
      const bodyGroup = new THREE.Group();

      // ══ HEAD ══════════════════════════════════════════════════════
      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 64, 64), bodyMat());
      headMesh.scale.set(1.3, 1.05, 0.9);
      headGroup.add(headMesh);

      // Modern metallic ears
      [-0.22, 0.22].forEach(x => {
        const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 32), jointMat);
        ear.rotation.z = Math.PI / 2;
        ear.position.set(x * 1.5, 0.0, 0.0);
        headGroup.add(ear);
      });

      // Visor
      const visorCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.52),
        visorMat
      );
      visorCap.scale.set(1.3, 1.05, 0.9);
      visorCap.rotation.x = -Math.PI / 2 + 0.15;
      visorCap.position.z = 0.012;
      headGroup.add(visorCap);

      // Eyes (Thick curved lines)
      const eyeGeo = new THREE.TorusGeometry(0.04, 0.015, 16, 32, Math.PI);
      const leftEye = new THREE.Mesh(eyeGeo, cyanMat());
      leftEye.position.set(-0.11, 0.04, 0.25);
      headGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo.clone(), cyanMat());
      rightEye.position.set(0.11, 0.04, 0.25);
      headGroup.add(rightEye);

      // Smile
      const smileMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.03, 0.012, 16, 32, Math.PI),
        cyanMat()
      );
      smileMesh.rotation.z = Math.PI; // flip to smile
      smileMesh.position.set(0, -0.06, 0.255);
      headGroup.add(smileMesh);

      headGroup.position.y = 0.42;

      // ══ BODY ══════════════════════════════════════════════════════
      const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 64, 64), bodyMat());
      bodyMesh.scale.set(1.0, 1.25, 0.9);
      bodyGroup.add(bodyMesh);

      // Body accents (sleek seams)
      const seam1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.301, 0.004, 16, 64),
        jointMat
      );
      seam1.scale.set(1.0, 1.25, 0.9);
      seam1.rotation.x = Math.PI / 2;
      seam1.position.y = 0.08;
      bodyGroup.add(seam1);

      // Core glow
      const coreLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 32, 32),
        cyanMat()
      );
      coreLight.scale.z = 0.2;
      coreLight.position.set(0, 0.15, 0.27);
      bodyGroup.add(coreLight);

      bodyGroup.position.y = -0.18;

      // ══ ARMS ══════════════════════════════════════════════════════
      function makeArm(isLeft: boolean) {
        const side = isLeft ? -1 : 1;
        const arm = new THREE.Group();

        // Shoulder joint
        const joint = new THREE.Mesh(new THREE.SphereGeometry(0.06, 32, 32), jointMat);
        arm.add(joint);

        // Modern segmented arm
        const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.15, 16, 32), bodyMat());
        mesh.position.y = -0.12;
        arm.add(mesh);

        arm.position.set(side * 0.35, 0.05, 0);
        arm.rotation.z = side * 0.2;
        return arm;
      }

      const leftArm  = makeArm(true);
      const rightArm = makeArm(false);
      bodyGroup.add(leftArm, rightArm);

      // Floating ring below robot (holographic base)
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.25, 0.005, 16, 64),
        new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2, transparent: true, opacity: 0.5 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.65;
      root.add(ring);

      root.add(headGroup, bodyGroup);
      scene.add(root);

      // ── Mouse ─────────────────────────────────────────────────────
      const mouse = { x: 0, y: 0 };
      const onMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / innerHeight) * 2 + 1;
      };
      document.addEventListener('mousemove', onMove);

      // ── Loop ──────────────────────────────────────────────────────
      const clk = new THREE.Clock();
      let blinkTimer = Math.random() * 2 + 2;
      let shakeTimer = 0;
      const L = THREE.MathUtils.lerp;

      function tick() {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        const t  = clk.getElapsedTime();
        const dt = clk.getDelta();
        const st = stateRef.current;

        if (st === 'shake' && prevStateRef.current !== 'shake') shakeTimer = 0;
        prevStateRef.current = st;

        // Float
        root.position.y = Math.sin(t * 1.5) * 0.04;
        ring.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
        ring.rotation.z = t * 0.5;

        // Head tracking
        const tHY = mouse.x * 0.4;
        const tHX = -mouse.y * 0.25;
        headGroup.rotation.y = L(headGroup.rotation.y, tHY, 0.1);
        headGroup.rotation.x = L(headGroup.rotation.x, tHX, 0.1);
        bodyGroup.rotation.y = L(bodyGroup.rotation.y, mouse.x * 0.15, 0.05);

        // Natural Blink Logic (when not forced to cover)
        if (st !== 'cover') {
          blinkTimer -= dt;
          if (blinkTimer <= 0) {
            const p = Math.max(0, 0.2 - (-blinkTimer));
            const sc = p < 0.1 ? p / 0.1 : (0.2 - p) / 0.1;
            leftEye.scale.y = rightEye.scale.y = Math.max(0.01, 1 - sc);
            if (-blinkTimer > 0.2) { 
              leftEye.scale.y = rightEye.scale.y = 1; 
              blinkTimer = Math.random() * 3 + 2; 
            }
          }
        }

        // Breathing glow
        const glow = 1.0 + Math.sin(t * 2) * 0.5;
        (leftEye.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
        (rightEye.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
        (smileMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
        (coreLight.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;

        // ── STATE MACHINE ────────────────────────────────────────────
        if (st === 'cover') {
          // "Merem" state - eyes close (flatten vertically)
          leftEye.scale.y  = L(leftEye.scale.y, 0.01, 0.2);
          rightEye.scale.y = L(rightEye.scale.y, 0.01, 0.2);
          smileMesh.scale.x = L(smileMesh.scale.x, 0.5, 0.1); // smaller smile

          // Arms cross in front securely (no hands covering face)
          leftArm.rotation.x  = L(leftArm.rotation.x, -0.8, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z,  0.8, 0.1);
          rightArm.rotation.x = L(rightArm.rotation.x, -0.8, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.8, 0.1);

        } else if (st === 'wave') {
          rightArm.rotation.x = L(rightArm.rotation.x, -2.5 + Math.sin(t * 8) * 0.4, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.5, 0.1);
          leftArm.rotation.x  = L(leftArm.rotation.x, 0, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z, 0.2, 0.1);
          smileMesh.scale.x = L(smileMesh.scale.x, 1.0, 0.1);

        } else if (st === 'think') {
          leftArm.rotation.x  = L(leftArm.rotation.x, -1.8, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z,  0.7, 0.1);
          rightArm.rotation.x = L(rightArm.rotation.x, 0, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.2, 0.1);
          headGroup.rotation.z = L(headGroup.rotation.z, 0.15, 0.06);
          smileMesh.scale.x = L(smileMesh.scale.x, 1.0, 0.1);

        } else if (st === 'shake') {
          shakeTimer += dt;
          if (shakeTimer < 1.0)
            headGroup.rotation.y = Math.sin(shakeTimer * 30) * 0.25 * Math.max(0, 1 - shakeTimer);
          leftArm.rotation.x  = L(leftArm.rotation.x, 0, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z, 0.2, 0.1);
          rightArm.rotation.x = L(rightArm.rotation.x, 0, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.2, 0.1);
          smileMesh.scale.y = L(smileMesh.scale.y, -0.5, 0.1); // frown slightly

        } else if (st === 'cheer') {
          leftArm.rotation.x  = L(leftArm.rotation.x, -2.6, 0.15);
          leftArm.rotation.z  = L(leftArm.rotation.z, -0.3, 0.15);
          rightArm.rotation.x = L(rightArm.rotation.x, -2.6, 0.15);
          rightArm.rotation.z = L(rightArm.rotation.z,  0.3, 0.15);
          root.position.y += Math.abs(Math.sin(t * 6)) * 0.08;
          smileMesh.scale.x = L(smileMesh.scale.x, 1.2, 0.1); // big smile

        } else if (st === 'loading') {
          headGroup.rotation.x = L(headGroup.rotation.x, 0.2 + Math.sin(t * 4) * 0.08, 0.1);
          headGroup.rotation.y = L(headGroup.rotation.y, 0, 0.1);
          leftArm.rotation.x  = L(leftArm.rotation.x, 0, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z, 0.2, 0.1);
          rightArm.rotation.x = L(rightArm.rotation.x, 0, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.2, 0.1);

        } else {
          // idle
          headGroup.rotation.z = L(headGroup.rotation.z, 0, 0.05);
          const sw = Math.sin(t * 1.5) * 0.05;
          leftArm.rotation.x  = L(leftArm.rotation.x, sw, 0.08);
          leftArm.rotation.z  = L(leftArm.rotation.z, 0.2, 0.08);
          rightArm.rotation.x = L(rightArm.rotation.x, sw, 0.08);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.2, 0.08);
          smileMesh.scale.x = L(smileMesh.scale.x, 1.0, 0.1);
          smileMesh.scale.y = L(smileMesh.scale.y, 1.0, 0.1);
        }

        renderer.render(scene, camera);
      }
      tick();

      const onResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      addEventListener('resize', onResize);

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        document.removeEventListener('mousemove', onMove);
        removeEventListener('resize', onResize);
        renderer.dispose();
        scene.traverse(o => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.geometry?.dispose();
            (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => x?.dispose());
          }
        });
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };
    }

    const p = init();
    return () => { disposed = true; p.then(c => c?.()); };
  }, []);

  return <div ref={containerRef} className={`w-full h-full ${className}`} aria-hidden="true" />;
}
