'use client';

import { useEffect, useRef } from 'react';

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

    let raf = 0;
    let disposed = false;

    async function init() {
      const THREE = await import('three');
      if (disposed || !container) return;

      /* ─── Scene ─── */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 0.05, 3.8);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.shadowMap.enabled = true;
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
      container.appendChild(renderer.domElement);

      /* ─── Lights ─── */
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(3, 5, 5); key.castShadow = true; scene.add(key);
      const fill = new THREE.DirectionalLight(0x8b9fff, 0.5);
      fill.position.set(-3, 0, -2); scene.add(fill);
      const rim = new THREE.PointLight(0x4f46e5, 0.8, 8);
      rim.position.set(-2, 3, -2); scene.add(rim);

      /* ─── Materials ─── */
      const bodyMat  = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.15, metalness: 0.1 });
      const darkMat  = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2,  metalness: 0.3 });
      const accentMat= new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.2,  metalness: 0.4 });
      const jointMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3,  metalness: 0.7 });
      function eyeMat() {
        return new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 1.8 });
      }

      /* ─── Groups ─── */
      const root  = new THREE.Group();
      const head  = new THREE.Group();
      const body  = new THREE.Group();

      /* ─── HEAD ─── */
      // Box head
      head.add(new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.38, 0.32), bodyMat));

      // Face plate
      const face = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.27, 0.01), darkMat);
      face.position.set(0, 0.01, 0.165); head.add(face);

      // Eyes
      const eyeGeo = new THREE.CircleGeometry(0.065, 20);
      const leftEye  = new THREE.Mesh(eyeGeo, eyeMat());
      leftEye.position.set(-0.09, 0.04, 0.168); head.add(leftEye);
      const rightEye = new THREE.Mesh(eyeGeo.clone(), eyeMat());
      rightEye.position.set(0.09, 0.04, 0.168); head.add(rightEye);

      // Eye rings
      const ringGeo = new THREE.TorusGeometry(0.07, 0.009, 8, 20);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5 });
      [leftEye, rightEye].forEach((e, i) => {
        const r = new THREE.Mesh(ringGeo.clone(), ringMat.clone());
        r.position.copy(e.position); r.position.z -= 0.003; head.add(r);
      });

      // Mouth indicator
      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.018, 0.01), accentMat.clone());
      mouth.position.set(0, -0.07, 0.168); head.add(mouth);

      // Antenna
      const antStick = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.2), jointMat);
      antStick.position.set(0, 0.29, 0); head.add(antStick);
      const antBall = new THREE.Mesh(new THREE.SphereGeometry(0.033, 12, 12), eyeMat());
      antBall.position.set(0, 0.4, 0); head.add(antBall);

      // Ears
      const earGeo = new THREE.BoxGeometry(0.055, 0.14, 0.16);
      [-1, 1].forEach(s => {
        const ear = new THREE.Mesh(earGeo.clone(), jointMat.clone());
        ear.position.set(s * 0.248, 0, 0); head.add(ear);
      });

      // Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.12), jointMat);
      neck.position.set(0, -0.25, 0); head.add(neck);
      head.position.y = 0.42;

      /* ─── BODY ─── */
      // Torso
      body.add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.28), bodyMat));

      // Chest panel
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.02), darkMat);
      panel.position.set(0, 0.07, 0.15); body.add(panel);

      // Chest accent stripe
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.025), accentMat);
      stripe.position.set(0, -0.03, 0.15); body.add(stripe);

      // Indicator lights
      const indGeo = new THREE.CircleGeometry(0.016, 8);
      [-0.05, 0, 0.05].forEach(x => {
        const ind = new THREE.Mesh(indGeo.clone(), eyeMat());
        ind.position.set(x, 0.07, 0.162); body.add(ind);
      });

      // Shoulder pads
      [-1, 1].forEach(s => {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.2), accentMat.clone());
        pad.position.set(s * 0.315, 0.17, 0); body.add(pad);
      });

      body.position.y = -0.18;

      /* ─── ARMS ─── */
      function makeArm(isLeft: boolean) {
        const side  = isLeft ? -1 : 1;
        const pivot = new THREE.Group();

        // Upper arm
        pivot.add(Object.assign(
          new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 8, 16), bodyMat),
          { position: new THREE.Vector3(0, -0.13, 0) }
        ));

        // Elbow
        pivot.add(Object.assign(
          new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 12), jointMat),
          { position: new THREE.Vector3(0, -0.28, 0) }
        ));

        // Lower arm group
        const lower = new THREE.Group();
        lower.position.set(0, -0.28, 0);
        lower.add(Object.assign(
          new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.18, 8, 16), bodyMat),
          { position: new THREE.Vector3(0, -0.12, 0) }
        ));
        lower.add(Object.assign(
          new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.07), bodyMat),
          { position: new THREE.Vector3(0, -0.27, 0) }
        ));
        pivot.add(lower);

        pivot.position.set(side * 0.32, 0.13, 0);
        return { pivot, lower };
      }

      const LA = makeArm(true);
      const RA = makeArm(false);
      body.add(LA.pivot, RA.pivot);

      /* ─── Assemble ─── */
      root.add(head, body);
      scene.add(root);

      /* ─── Mouse ─── */
      const mouse = { x: 0, y: 0 };
      const onMove = (e: MouseEvent) => {
        mouse.x =  (e.clientX / innerWidth)  * 2 - 1;
        mouse.y = -(e.clientY / innerHeight) * 2 + 1;
      };
      document.addEventListener('mousemove', onMove);

      /* ─── Helpers ─── */
      const L = THREE.MathUtils.lerp;
      let blinkTimer = Math.random() * 2 + 2;
      let shakeTimer = 0;
      const clk = new THREE.Clock();

      /* ─── Loop ─── */
      function tick() {
        if (disposed) return;
        raf = requestAnimationFrame(tick);
        const t  = clk.getElapsedTime();
        const dt = clk.getDelta();
        const st = stateRef.current;

        // Detect new shake trigger
        if (st === 'shake' && prevStateRef.current !== 'shake') shakeTimer = 0;
        prevStateRef.current = st;

        // Float
        root.position.y = Math.sin(t * 1.8) * 0.025;

        // Head tracking (always on unless cover)
        const tHY = st === 'cover' ? 0 : mouse.x * 0.5;
        const tHX = st === 'cover' ? 0.22 : -mouse.y * 0.28;
        head.rotation.y = L(head.rotation.y, tHY, 0.1);
        head.rotation.x = L(head.rotation.x, tHX, 0.1);

        // Body subtle follow
        body.rotation.y = L(body.rotation.y, mouse.x * 0.1, 0.05);

        // Blink
        blinkTimer -= dt;
        if (blinkTimer <= 0) {
          const p = Math.max(0, 0.22 - (-blinkTimer));
          const sc = p < 0.11 ? p / 0.11 : (0.22 - p) / 0.11;
          leftEye.scale.y = rightEye.scale.y = Math.max(0.05, 1 - sc);
          if (-blinkTimer > 0.22) {
            leftEye.scale.y = rightEye.scale.y = 1;
            blinkTimer = Math.random() * 3 + 2;
          }
        }

        // Eye glow pulse
        const glow = 1.8 + Math.sin(t * 3) * 0.4;
        (leftEye.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
        (rightEye.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
        (antBall.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + Math.sin(t * 4) * 0.5;

        // ── STATE ANIMATIONS ──────────────────────────────────────────
        if (st === 'cover') {
          // Both arms up covering eyes
          LA.pivot.rotation.x = L(LA.pivot.rotation.x, -1.9, 0.1);
          LA.pivot.rotation.z = L(LA.pivot.rotation.z,  0.45, 0.1);
          LA.lower.rotation.x = L(LA.lower.rotation.x, -1.1, 0.1);
          LA.lower.rotation.y = L(LA.lower.rotation.y,  0.55, 0.1);
          RA.pivot.rotation.x = L(RA.pivot.rotation.x, -1.9, 0.1);
          RA.pivot.rotation.z = L(RA.pivot.rotation.z, -0.45, 0.1);
          RA.lower.rotation.x = L(RA.lower.rotation.x, -1.1, 0.1);
          RA.lower.rotation.y = L(RA.lower.rotation.y, -0.55, 0.1);
          // Squint eyes
          leftEye.scale.y  = L(leftEye.scale.y, 0.08, 0.12);
          rightEye.scale.y = L(rightEye.scale.y, 0.08, 0.12);

        } else if (st === 'wave') {
          // Right arm waves high
          RA.pivot.rotation.x = L(RA.pivot.rotation.x, -2.1 + Math.sin(t * 8) * 0.35, 0.1);
          RA.pivot.rotation.z = L(RA.pivot.rotation.z, -0.3, 0.1);
          RA.lower.rotation.x = L(RA.lower.rotation.x,  0.5, 0.1);
          RA.lower.rotation.y = L(RA.lower.rotation.y,  0, 0.1);
          LA.pivot.rotation.x = L(LA.pivot.rotation.x,  0, 0.1);
          LA.pivot.rotation.z = L(LA.pivot.rotation.z,  0.1, 0.1);
          LA.lower.rotation.x = L(LA.lower.rotation.x,  0.2, 0.1);
          LA.lower.rotation.y = L(LA.lower.rotation.y,  0, 0.1);

        } else if (st === 'think') {
          // Left arm to chin, head tilt
          LA.pivot.rotation.x = L(LA.pivot.rotation.x, -1.3, 0.1);
          LA.pivot.rotation.z = L(LA.pivot.rotation.z,  0.35, 0.1);
          LA.lower.rotation.x = L(LA.lower.rotation.x, -0.9, 0.1);
          LA.lower.rotation.y = L(LA.lower.rotation.y,  0.2, 0.1);
          RA.pivot.rotation.x = L(RA.pivot.rotation.x,  0, 0.1);
          RA.pivot.rotation.z = L(RA.pivot.rotation.z, -0.1, 0.1);
          RA.lower.rotation.x = L(RA.lower.rotation.x,  0.2, 0.1);
          RA.lower.rotation.y = L(RA.lower.rotation.y,  0, 0.1);
          head.rotation.z = L(head.rotation.z, 0.18 + Math.sin(t) * 0.04, 0.06);

        } else if (st === 'shake') {
          shakeTimer += dt;
          if (shakeTimer < 1.0) {
            head.rotation.y = Math.sin(shakeTimer * 28) * 0.18 * Math.max(0, 1 - shakeTimer);
          }
          LA.pivot.rotation.x = L(LA.pivot.rotation.x, 0, 0.1);
          LA.pivot.rotation.z = L(LA.pivot.rotation.z, 0.1, 0.1);
          RA.pivot.rotation.x = L(RA.pivot.rotation.x, 0, 0.1);
          RA.pivot.rotation.z = L(RA.pivot.rotation.z, -0.1, 0.1);
          LA.lower.rotation.x = L(LA.lower.rotation.x, 0.2, 0.1);
          RA.lower.rotation.x = L(RA.lower.rotation.x, 0.2, 0.1);
          LA.lower.rotation.y = L(LA.lower.rotation.y, 0, 0.1);
          RA.lower.rotation.y = L(RA.lower.rotation.y, 0, 0.1);

        } else if (st === 'cheer') {
          // Both arms up, happy bounce
          LA.pivot.rotation.x = L(LA.pivot.rotation.x, -2.2, 0.12);
          LA.pivot.rotation.z = L(LA.pivot.rotation.z, -0.35, 0.12);
          LA.lower.rotation.x = L(LA.lower.rotation.x, -0.3, 0.12);
          LA.lower.rotation.y = L(LA.lower.rotation.y,  0, 0.12);
          RA.pivot.rotation.x = L(RA.pivot.rotation.x, -2.2, 0.12);
          RA.pivot.rotation.z = L(RA.pivot.rotation.z,  0.35, 0.12);
          RA.lower.rotation.x = L(RA.lower.rotation.x, -0.3, 0.12);
          RA.lower.rotation.y = L(RA.lower.rotation.y,  0, 0.12);
          root.position.y += Math.abs(Math.sin(t * 5)) * 0.07;

        } else if (st === 'loading') {
          // Gentle nod
          head.rotation.x = L(head.rotation.x, 0.18 + Math.sin(t * 3) * 0.06, 0.08);
          LA.pivot.rotation.x = L(LA.pivot.rotation.x, 0, 0.1);
          LA.pivot.rotation.z = L(LA.pivot.rotation.z, 0.1, 0.1);
          RA.pivot.rotation.x = L(RA.pivot.rotation.x, 0, 0.1);
          RA.pivot.rotation.z = L(RA.pivot.rotation.z, -0.1, 0.1);
          LA.lower.rotation.x = L(LA.lower.rotation.x, 0.2, 0.1);
          RA.lower.rotation.x = L(RA.lower.rotation.x, 0.2, 0.1);
          LA.lower.rotation.y = L(LA.lower.rotation.y, 0, 0.1);
          RA.lower.rotation.y = L(RA.lower.rotation.y, 0, 0.1);

        } else {
          // Idle sway
          head.rotation.z = L(head.rotation.z, 0, 0.05);
          const sx = Math.sin(t * 1.5) * 0.04;
          const sz = Math.sin(t * 1.2) * 0.02;
          LA.pivot.rotation.x = L(LA.pivot.rotation.x, sx, 0.08);
          LA.pivot.rotation.z = L(LA.pivot.rotation.z, 0.1 + sz, 0.08);
          LA.lower.rotation.x = L(LA.lower.rotation.x, 0.2, 0.08);
          LA.lower.rotation.y = L(LA.lower.rotation.y, 0, 0.08);
          RA.pivot.rotation.x = L(RA.pivot.rotation.x, sx, 0.08);
          RA.pivot.rotation.z = L(RA.pivot.rotation.z, -0.1 - sz, 0.08);
          RA.lower.rotation.x = L(RA.lower.rotation.x, 0.2, 0.08);
          RA.lower.rotation.y = L(RA.lower.rotation.y, 0, 0.08);
        }

        renderer.render(scene, camera);
      }
      tick();

      /* ─── Resize ─── */
      const onResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      addEventListener('resize', onResize);

      /* ─── Cleanup ─── */
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
