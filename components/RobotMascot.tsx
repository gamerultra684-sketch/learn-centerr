'use client';

import { useEffect, useRef } from 'react';
import type * as THREE from 'three';

/**
 * RobotMascot — A modern, interactive 3D robot mascot.
 * Features:
 * - Sleek, minimalist design (white shell, dark visor)
 * - Cursor tracking (head and body rotation)
 * - Dynamic animations: Idle, Blinking, and "Cover Eyes" (for password fields)
 * - Performance optimized for React/Next.js
 */
export default function RobotMascot({ 
  className = '', 
  isSecretFocused = false 
}: { 
  className?: string;
  isSecretFocused?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ isSecretFocused });

  // Sync prop with ref for use in animation loop without re-running useEffect
  useEffect(() => {
    stateRef.current.isSecretFocused = isSecretFocused;
  }, [isSecretFocused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animFrameId = 0;
    let disposed = false;

    async function init() {
      const THREE = await import('three');
      if (disposed || !container) return;

      // ── SCENE & CAMERA ──────────────────────────────────────────
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        28,
        container.clientWidth / container.clientHeight,
        0.1,
        100,
      );
      camera.position.set(0, 0, 4);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.shadowMap.enabled = true;
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
      container.appendChild(renderer.domElement);

      // ── LIGHTS ──────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
      keyLight.position.set(5, 5, 5);
      keyLight.castShadow = true;
      scene.add(keyLight);
      
      const rimLight = new THREE.PointLight(0x6366f1, 1, 10);
      rimLight.position.set(-3, 3, -2);
      scene.add(rimLight);

      // ── MATERIALS ───────────────────────────────────────────────
      const whiteShell  = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.05 });
      const darkShell   = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.2 });
      const visorMat    = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1, metalness: 0.5 });
      const eyeGlowMat  = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 2 });
      const jointMat    = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.6 });

      // ── GROUPS ──────────────────────────────────────────────────
      const robotRoot = new THREE.Group();
      const headGroup = new THREE.Group();
      const bodyGroup = new THREE.Group();

      // ── HEAD ────────────────────────────────────────────────────
      const headBase = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.1, 16, 32), whiteShell);
      headBase.rotation.x = Math.PI / 2;
      headGroup.add(headBase);

      const visor = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 32, 16, 0, Math.PI, 0, Math.PI * 0.5),
        visorMat
      );
      visor.rotation.x = Math.PI / 2;
      visor.position.z = 0.05;
      headGroup.add(visor);

      const eyeGeo = new THREE.CapsuleGeometry(0.012, 0.04, 4, 8);
      const leftEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
      leftEye.rotation.z = Math.PI / 2;
      leftEye.position.set(-0.08, 0, 0.22);
      headGroup.add(leftEye);

      const rightEye = leftEye.clone();
      rightEye.position.set(0.08, 0, 0.22);
      headGroup.add(rightEye);

      // ── BODY ────────────────────────────────────────────────────
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.35, 16, 32), whiteShell);
      torso.position.y = -0.45;
      bodyGroup.add(torso);

      const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.1, 1, 1, 1), darkShell);
      chestPlate.position.set(0, -0.35, 0.15);
      bodyGroup.add(chestPlate);

      // ── ARMS ────────────────────────────────────────────────────
      function createArm(isLeft: boolean) {
        const side = isLeft ? -1 : 1;
        const armGroup = new THREE.Group();
        
        const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.08), whiteShell);
        armGroup.add(shoulder);

        const upperArmGroup = new THREE.Group();
        const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.15, 8, 16), whiteShell);
        upperArm.position.y = -0.1;
        upperArmGroup.add(upperArm);
        armGroup.add(upperArmGroup);

        const lowerArmGroup = new THREE.Group();
        lowerArmGroup.position.y = -0.22;
        const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.045), jointMat);
        lowerArmGroup.add(elbow);

        const lowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.15, 8, 16), whiteShell);
        lowerArm.position.y = -0.1;
        lowerArmGroup.add(lowerArm);

        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.05), whiteShell);
        hand.position.y = -0.22;
        lowerArmGroup.add(hand);

        upperArmGroup.add(lowerArmGroup);
        
        armGroup.position.set(side * 0.3, -0.3, 0);
        
        return { armGroup, upperArmGroup, lowerArmGroup };
      }

      const leftArmParts = createArm(true);
      const rightArmParts = createArm(false);
      bodyGroup.add(leftArmParts.armGroup, rightArmParts.armGroup);

      // ── ASSEMBLE ────────────────────────────────────────────────
      robotRoot.add(headGroup, bodyGroup);
      robotRoot.position.y = -0.1;
      scene.add(robotRoot);

      // ── INTERACTION ─────────────────────────────────────────────
      const mouse = { x: 0, y: 0 };
      const onMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      document.addEventListener('mousemove', onMouseMove);

      // ── ANIMATION LOOP ──────────────────────────────────────────
      const clock = new THREE.Clock();
      let blinkTimer = 0;

      function animate() {
        if (disposed) return;
        animFrameId = requestAnimationFrame(animate);
        
        const time = clock.getElapsedTime();
        const delta = clock.getDelta();
        const isSecret = stateRef.current.isSecretFocused;

        if (isSecret) {
          // Move arms to cover eyes
          leftArmParts.armGroup.rotation.x = THREE.MathUtils.lerp(leftArmParts.armGroup.rotation.x, -0.4, 0.1);
          leftArmParts.armGroup.rotation.z = THREE.MathUtils.lerp(leftArmParts.armGroup.rotation.z, 0.6, 0.1);
          leftArmParts.lowerArmGroup.rotation.x = THREE.MathUtils.lerp(leftArmParts.lowerArmGroup.rotation.x, -1.8, 0.1);
          leftArmParts.lowerArmGroup.rotation.y = THREE.MathUtils.lerp(leftArmParts.lowerArmGroup.rotation.y, 0.8, 0.1);

          rightArmParts.armGroup.rotation.x = THREE.MathUtils.lerp(rightArmParts.armGroup.rotation.x, -0.4, 0.1);
          rightArmParts.armGroup.rotation.z = THREE.MathUtils.lerp(rightArmParts.armGroup.rotation.z, -0.6, 0.1);
          rightArmParts.lowerArmGroup.rotation.x = THREE.MathUtils.lerp(rightArmParts.lowerArmGroup.rotation.x, -1.8, 0.1);
          rightArmParts.lowerArmGroup.rotation.y = THREE.MathUtils.lerp(rightArmParts.lowerArmGroup.rotation.y, -0.8, 0.1);
          
          // Slight head look down
          headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.2, 0.1);
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, 0.1);
        } else {
          // Idle tracking
          headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -mouse.y * 0.4, 0.1);
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, mouse.x * 0.6, 0.1);
          
          bodyGroup.rotation.y = THREE.MathUtils.lerp(bodyGroup.rotation.y, mouse.x * 0.2, 0.05);

          // Arm idle sway
          const swayX = Math.sin(time * 1.5) * 0.05;
          const swayZ = Math.sin(time * 1.2) * 0.03;
          
          leftArmParts.armGroup.rotation.x = THREE.MathUtils.lerp(leftArmParts.armGroup.rotation.x, swayX, 0.1);
          leftArmParts.armGroup.rotation.z = THREE.MathUtils.lerp(leftArmParts.armGroup.rotation.z, -0.1 + swayZ, 0.1);
          leftArmParts.lowerArmGroup.rotation.x = THREE.MathUtils.lerp(leftArmParts.lowerArmGroup.rotation.x, 0.2, 0.1);
          leftArmParts.lowerArmGroup.rotation.y = THREE.MathUtils.lerp(leftArmParts.lowerArmGroup.rotation.y, 0, 0.1);

          rightArmParts.armGroup.rotation.x = THREE.MathUtils.lerp(rightArmParts.armGroup.rotation.x, swayX, 0.1);
          rightArmParts.armGroup.rotation.z = THREE.MathUtils.lerp(rightArmParts.armGroup.rotation.z, 0.1 - swayZ, 0.1);
          rightArmParts.lowerArmGroup.rotation.x = THREE.MathUtils.lerp(rightArmParts.lowerArmGroup.rotation.x, 0.2, 0.1);
          rightArmParts.lowerArmGroup.rotation.y = THREE.MathUtils.lerp(rightArmParts.lowerArmGroup.rotation.y, 0, 0.1);
        }

        // Float
        robotRoot.position.y = -0.1 + Math.sin(time * 2) * 0.03;

        // Blink
        blinkTimer += delta;
        if (blinkTimer > 3) {
          const s = Math.abs(Math.sin((blinkTimer - 3) * 15));
          if (blinkTimer < 3.2) {
            leftEye.scale.y = rightEye.scale.y = 1 - s;
          } else {
            leftEye.scale.y = rightEye.scale.y = 1;
            blinkTimer = Math.random();
          }
        }

        renderer.render(scene, camera);
      }

      animate();

      // ── RESIZE ──────────────────────────────────────────────────
      const onResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', onResize);

      // ── CLEANUP ─────────────────────────────────────────────────
      return () => {
        disposed = true;
        cancelAnimationFrame(animFrameId);
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            (obj as THREE.Mesh).geometry?.dispose();
            const mat = (obj as THREE.Mesh).material;
            if (Array.isArray(mat)) mat.forEach(m => m.dispose());
            else mat?.dispose();
          }
        });
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    const cleanupPromise = init();
    return () => {
      disposed = true;
      cleanupPromise.then(cleanup => cleanup?.());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
