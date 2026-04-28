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
  const stateRef    = useRef<MascotState>(mascotState);
  const prevRef     = useRef<MascotState>(mascotState);

  useEffect(() => { stateRef.current = mascotState; }, [mascotState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let raf = 0, disposed = false;

    async function init() {
      const THREE = await import('three');
      if (disposed || !container) return;

      // ── SCENE ──────────────────────────────────────────────────────
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 3.8);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
      container.appendChild(renderer.domElement);

      // ── LIGHTS ─────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
      keyLight.position.set(5, 5, 5); keyLight.castShadow = true;
      scene.add(keyLight);
      const rimLight = new THREE.PointLight(0x4f46e5, 1, 10);
      rimLight.position.set(-2, 2, -2);
      scene.add(rimLight);

      // ── MATERIALS ──────────────────────────────────────────────────
      const whiteShellMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1 });
      const metalJointMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.2,  metalness: 0.8 });
      const visorMat      = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1,  metalness: 0.5 });
      const eyeGlowMat    = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 3 });
      const accentMat     = new THREE.MeshStandardMaterial({ color: 0x4f46e5, emissive: 0x4f46e5, emissiveIntensity: 1 });

      // ── GROUPS ─────────────────────────────────────────────────────
      const robotRoot = new THREE.Group();
      const bodyGroup = new THREE.Group();
      const headGroup = new THREE.Group();

      // ── HEAD ───────────────────────────────────────────────────────
      const headBase = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), whiteShellMat);
      headBase.scale.y = 0.95;
      headGroup.add(headBase);

      const visorGeo = new THREE.SphereGeometry(0.2, 32, 32, 0, Math.PI * 0.8, 0, Math.PI * 0.5);
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.rotation.x = Math.PI / 2;
      visor.rotation.y = -Math.PI * 0.4;
      visor.position.set(0, 0, 0.05);
      headGroup.add(visor);

      const eyeGeo = new THREE.CapsuleGeometry(0.015, 0.04, 4, 8);
      const leftEye  = new THREE.Mesh(eyeGeo, eyeGlowMat);
      leftEye.rotation.z = Math.PI / 2;
      leftEye.position.set(-0.07, 0, 0.22);
      headGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo.clone(), eyeGlowMat);
      rightEye.rotation.z = Math.PI / 2;
      rightEye.position.set(0.07, 0, 0.22);
      headGroup.add(rightEye);

      const earGeo  = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16);
      const leftEar = new THREE.Mesh(earGeo, metalJointMat);
      leftEar.rotation.z = Math.PI / 2;
      leftEar.position.set(-0.21, 0, 0);
      headGroup.add(leftEar);
      const rightEar = leftEar.clone();
      rightEar.position.set(0.21, 0, 0);
      headGroup.add(rightEar);

      // ── BODY ───────────────────────────────────────────────────────
      const torsoGeo = new THREE.CapsuleGeometry(0.2, 0.3, 8, 16);
      const torso = new THREE.Mesh(torsoGeo, whiteShellMat);
      torso.position.set(0, -0.35, 0);
      bodyGroup.add(torso);

      const chestGeo = new THREE.BoxGeometry(0.22, 0.15, 0.1);
      const chest = new THREE.Mesh(chestGeo, whiteShellMat);
      chest.position.set(0, -0.28, 0.12);
      bodyGroup.add(chest);

      const core = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), accentMat);
      core.position.set(0, -0.28, 0.175);
      bodyGroup.add(core);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1), metalJointMat);
      neck.position.set(0, -0.15, 0);
      bodyGroup.add(neck);

      // ── ARMS ───────────────────────────────────────────────────────
      function createArm(isLeft: boolean) {
        const side = isLeft ? -1 : 1;
        const armGroup = new THREE.Group();
        
        const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.07), whiteShellMat);
        armGroup.add(shoulder);

        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.15), whiteShellMat);
        upperArm.position.y = -0.1;
        armGroup.add(upperArm);

        const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.045), metalJointMat);
        elbow.position.y = -0.18;
        armGroup.add(elbow);

        const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.15), whiteShellMat);
        forearm.position.y = -0.26;
        armGroup.add(forearm);

        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05), whiteShellMat);
        hand.position.y = -0.34;
        armGroup.add(hand);

        armGroup.position.set(side * 0.28, -0.25, 0);
        return armGroup;
      }

      const leftArm  = createArm(true);
      const rightArm = createArm(false);
      bodyGroup.add(leftArm, rightArm);

      // ── ASSEMBLE ───────────────────────────────────────────────────
      robotRoot.add(headGroup, bodyGroup);
      robotRoot.position.y = -0.1;
      scene.add(robotRoot);

      // ── MOUSE ──────────────────────────────────────────────────────
      const mouse = { x: 0, y: 0 };
      const onMove = (e: MouseEvent) => {
        mouse.x =  (e.clientX / innerWidth)  * 2 - 1;
        mouse.y = -(e.clientY / innerHeight) * 2 + 1;
      };
      document.addEventListener('mousemove', onMove);

      // ── LOOP ───────────────────────────────────────────────────────
      const clk = new THREE.Clock();
      let blinkTimer = Math.random();
      let shakeTimer = 0;
      const L = THREE.MathUtils.lerp;

      function tick() {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        const t   = clk.getElapsedTime();
        const dt  = clk.getDelta();
        const st  = stateRef.current;

        if (st === 'shake' && prevRef.current !== 'shake') shakeTimer = 0;
        prevRef.current = st;

        // Floating
        robotRoot.position.y = -0.1 + Math.sin(t * 2) * 0.05;
        core.material.emissiveIntensity = 1 + Math.sin(t * 4) * 0.5;

        // Head tracking
        if (st !== 'shake') {
          headGroup.rotation.x += (-mouse.y * 0.4 - headGroup.rotation.x) * 0.1;
          headGroup.rotation.y += ( mouse.x * 0.6 - headGroup.rotation.y) * 0.1;
        }
        bodyGroup.rotation.y += (mouse.x * 0.2 - bodyGroup.rotation.y) * 0.05;

        // Natural Blink Logic (when not forced to cover)
        if (st !== 'cover') {
          blinkTimer += dt;
          if (blinkTimer > 3) {
            const s = Math.abs(Math.sin((blinkTimer - 3) * 15));
            if (blinkTimer < 3.2) {
              leftEye.scale.y = rightEye.scale.y = 1 - s;
            } else {
              leftEye.scale.y = rightEye.scale.y = 1;
              blinkTimer = Math.random();
            }
          }
        }

        // ── STATE MACHINE ────────────────────────────────────────────
        if (st === 'cover') {
          // "Merem" state - eyes close (flatten vertically)
          leftEye.scale.y  = L(leftEye.scale.y, 0.05, 0.2);
          rightEye.scale.y = L(rightEye.scale.y, 0.05, 0.2);

          // NO HAND MOVEMENTS - just idle sway
          leftArm.rotation.z   = L(leftArm.rotation.z,  -0.2 + Math.sin(t * 1.5) * 0.05, 0.1);
          rightArm.rotation.z  = L(rightArm.rotation.z,   0.2 - Math.sin(t * 1.5) * 0.05, 0.1);
          leftArm.rotation.x   = L(leftArm.rotation.x, Math.sin(t * 1.2) * 0.1, 0.1);
          rightArm.rotation.x  = L(rightArm.rotation.x, Math.sin(t * 1.2 + 0.5) * 0.1, 0.1);
          headGroup.rotation.z = L(headGroup.rotation.z, 0, 0.05);

        } else if (st === 'wave') {
          rightArm.rotation.x = L(rightArm.rotation.x, -2.3 + Math.sin(t * 7) * 0.4, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.8, 0.1);
          leftArm.rotation.x  = L(leftArm.rotation.x, Math.sin(t * 1.2) * 0.1, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z, -0.2 + Math.sin(t * 1.5) * 0.05, 0.1);
          headGroup.rotation.z = L(headGroup.rotation.z, 0, 0.05);

        } else if (st === 'think') {
          leftArm.rotation.x  = L(leftArm.rotation.x, -1.5, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z,  0.5, 0.1);
          rightArm.rotation.x = L(rightArm.rotation.x, Math.sin(t * 1.2 + 0.5) * 0.1, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z,  0.2 - Math.sin(t * 1.5) * 0.05, 0.1);
          headGroup.rotation.z = L(headGroup.rotation.z, 0.14, 0.06);

        } else if (st === 'shake') {
          shakeTimer += dt;
          if (shakeTimer < 1.0)
            headGroup.rotation.y = Math.sin(shakeTimer * 28) * 0.22 * Math.max(0, 1 - shakeTimer);
          else
            headGroup.rotation.y = L(headGroup.rotation.y, 0, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z,  -0.2 + Math.sin(t * 1.5) * 0.05, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z,   0.2 - Math.sin(t * 1.5) * 0.05, 0.1);
          leftArm.rotation.x  = L(leftArm.rotation.x, Math.sin(t * 1.2) * 0.1, 0.1);
          rightArm.rotation.x = L(rightArm.rotation.x, Math.sin(t * 1.2 + 0.5) * 0.1, 0.1);
          headGroup.rotation.z = L(headGroup.rotation.z, 0, 0.05);

        } else if (st === 'cheer') {
          leftArm.rotation.x  = L(leftArm.rotation.x, -2.4, 0.12);
          leftArm.rotation.z  = L(leftArm.rotation.z, -0.4, 0.12);
          rightArm.rotation.x = L(rightArm.rotation.x, -2.4, 0.12);
          rightArm.rotation.z = L(rightArm.rotation.z,  0.4, 0.12);
          robotRoot.position.y = -0.1 + Math.sin(t * 2) * 0.05 + Math.abs(Math.sin(t * 5)) * 0.07;
          headGroup.rotation.z = L(headGroup.rotation.z, 0, 0.05);

        } else if (st === 'loading') {
          headGroup.rotation.x += (0.18 + Math.sin(t * 3) * 0.05 - headGroup.rotation.x) * 0.08;
          headGroup.rotation.y += (0 - headGroup.rotation.y) * 0.08;
          leftArm.rotation.z   = L(leftArm.rotation.z,  -0.2 + Math.sin(t * 1.5) * 0.05, 0.1);
          rightArm.rotation.z  = L(rightArm.rotation.z,   0.2 - Math.sin(t * 1.5) * 0.05, 0.1);
          leftArm.rotation.x   = L(leftArm.rotation.x, Math.sin(t * 1.2) * 0.1, 0.1);
          rightArm.rotation.x  = L(rightArm.rotation.x, Math.sin(t * 1.2 + 0.5) * 0.1, 0.1);
          headGroup.rotation.z = L(headGroup.rotation.z, 0, 0.05);

        } else {
          // idle — exact PHP behavior
          headGroup.rotation.z = L(headGroup.rotation.z, 0, 0.05);
          leftArm.rotation.z   = -0.2 + Math.sin(t * 1.5) * 0.05;
          leftArm.rotation.x   =        Math.sin(t * 1.2) * 0.1;
          rightArm.rotation.z  =  0.2 - Math.sin(t * 1.5) * 0.05;
          rightArm.rotation.x  =        Math.sin(t * 1.2 + 0.5) * 0.1;
        }

        renderer.render(scene, camera);
      }
      tick();

      // ── RESIZE ─────────────────────────────────────────────────────
      const onResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      addEventListener('resize', onResize);

      // ── CLEANUP ────────────────────────────────────────────────────
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
