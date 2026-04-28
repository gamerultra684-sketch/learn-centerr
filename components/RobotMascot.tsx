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
      renderer.toneMappingExposure = 1.5;
      renderer.shadowMap.enabled = true;
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;';
      container.appendChild(renderer.domElement);

      // ── Lights ────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const key = new THREE.DirectionalLight(0xffffff, 1.8);
      key.position.set(3, 6, 6); scene.add(key);
      const fill = new THREE.DirectionalLight(0xd8e8ff, 0.6);
      fill.position.set(-4, 1, 2); scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 0.3);
      rim.position.set(0, -3, -4); scene.add(rim);

      // ── Materials ─────────────────────────────────────────────────
      function bodyMat() {
        return new THREE.MeshStandardMaterial({ color: 0xeef0f5, roughness: 0.22, metalness: 0.05 });
      }
      const visorMat = new THREE.MeshStandardMaterial({ color: 0x080f1e, roughness: 0.08, metalness: 0.1 });
      function cyanMat() {
        return new THREE.MeshStandardMaterial({ color: 0x00d4f0, emissive: 0x00b8d4, emissiveIntensity: 0.9, roughness: 0.1 });
      }

      // ── Groups ────────────────────────────────────────────────────
      const root = new THREE.Group();
      const headGroup = new THREE.Group();
      const bodyGroup = new THREE.Group();

      // ══ HEAD ══════════════════════════════════════════════════════
      // Wide oval head — sphere scaled wide & slightly flat
      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.27, 64, 64), bodyMat());
      headMesh.scale.set(1.28, 1.0, 0.88);
      headGroup.add(headMesh);

      // Ear bumps on top (two small spheres)
      [-0.2, 0.2].forEach(x => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.072, 24, 24), bodyMat());
        ear.position.set(x, 0.21, 0.05);
        headGroup.add(ear);
      });

      // ── VISOR (dark front panel) ──────────────────────────────────
      // Clip to show only front-facing part using a geometry trick
      const visorCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.23, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.52),
        visorMat
      );
      visorCap.scale.set(1.28, 1.0, 0.88);
      visorCap.rotation.x = -Math.PI / 2 + 0.15;
      visorCap.position.z = 0.01;
      headGroup.add(visorCap);

      // ── EYES ─────────────────────────────────────────────────────
      // Happy eyes (semi-circle curves)
      const eyeGeo = new THREE.TorusGeometry(0.035, 0.012, 16, 32, Math.PI);
      const leftEye = new THREE.Mesh(eyeGeo, cyanMat());
      leftEye.position.set(-0.1, 0.04, 0.24);
      headGroup.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeo.clone(), cyanMat());
      rightEye.position.set(0.1, 0.04, 0.24);
      headGroup.add(rightEye);

      // ── SMILE ────────────────────────────────────────────────────
      // Half torus (phi 0→π = arc from right→top→left = smile shape, so we rotate it)
      const smileMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.04, 0.01, 16, 32, Math.PI),
        cyanMat()
      );
      smileMesh.rotation.z = Math.PI; // flip to make it a smile
      smileMesh.position.set(0, -0.05, 0.245);
      headGroup.add(smileMesh);

      headGroup.position.y = 0.38;

      // ══ BODY ══════════════════════════════════════════════════════
      const bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.29, 48, 48), bodyMat());
      bodyMesh.scale.set(1.0, 1.22, 0.88);
      bodyGroup.add(bodyMesh);

      // Chest seam detail
      const seamMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.1, 0.005, 8, 32, Math.PI * 1.3),
        new THREE.MeshStandardMaterial({ color: 0xc8cdd8, roughness: 0.4 })
      );
      seamMesh.rotation.x = Math.PI / 2;
      seamMesh.position.set(0, 0.04, 0.22);
      bodyGroup.add(seamMesh);

      bodyGroup.position.y = -0.18;

      // ══ ARMS ══════════════════════════════════════════════════════
      function makeArm(isLeft: boolean) {
        const side = isLeft ? -1 : 1;
        const arm = new THREE.Group();
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 32), bodyMat());
        mesh.scale.set(0.78, 1.25, 0.72);
        arm.add(mesh);
        arm.position.set(side * 0.33, -0.1, 0);
        arm.rotation.z = side * 0.18;
        return arm;
      }

      const leftArm  = makeArm(true);
      const rightArm = makeArm(false);
      bodyGroup.add(leftArm, rightArm);

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
        root.position.y = Math.sin(t * 1.8) * 0.03;

        // Head follows cursor (all states except cover)
        const tHY = st === 'cover' ? 0 : mouse.x * 0.45;
        const tHX = st === 'cover' ? 0.18 : -mouse.y * 0.25;
        headGroup.rotation.y = L(headGroup.rotation.y, tHY, 0.11);
        headGroup.rotation.x = L(headGroup.rotation.x, tHX, 0.11);
        bodyGroup.rotation.y = L(bodyGroup.rotation.y, mouse.x * 0.08, 0.05);

        // Blink
        blinkTimer -= dt;
        if (blinkTimer <= 0) {
          const p = Math.max(0, 0.22 - (-blinkTimer));
          const sc = p < 0.11 ? p / 0.11 : (0.22 - p) / 0.11;
          leftEye.scale.y = rightEye.scale.y = Math.max(0.05, 1 - sc);
          if (-blinkTimer > 0.22) { leftEye.scale.y = rightEye.scale.y = 1; blinkTimer = Math.random() * 3.5 + 2; }
        }

        // Eye glow
        const glow = 0.9 + Math.sin(t * 2.5) * 0.2;
        (leftEye.material  as THREE.MeshStandardMaterial).emissiveIntensity = glow;
        (rightEye.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
        (smileMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;

        // ── STATE MACHINE ────────────────────────────────────────────
        if (st === 'cover') {
          leftArm.rotation.x  = L(leftArm.rotation.x,  -2.3, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z,   0.65, 0.1);
          rightArm.rotation.x = L(rightArm.rotation.x, -2.3, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.65, 0.1);
          leftEye.scale.y  = L(leftEye.scale.y,  0.05, 0.12);
          rightEye.scale.y = L(rightEye.scale.y, 0.05, 0.12);

        } else if (st === 'wave') {
          rightArm.rotation.x = L(rightArm.rotation.x, -2.4 + Math.sin(t * 7) * 0.38, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.9, 0.1);
          leftArm.rotation.x  = L(leftArm.rotation.x, 0, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z, 0.18, 0.1);

        } else if (st === 'think') {
          leftArm.rotation.x  = L(leftArm.rotation.x, -1.5, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z,  0.6, 0.1);
          rightArm.rotation.x = L(rightArm.rotation.x, 0, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.18, 0.1);
          headGroup.rotation.z = L(headGroup.rotation.z, 0.14, 0.06);

        } else if (st === 'shake') {
          shakeTimer += dt;
          if (shakeTimer < 1.0)
            headGroup.rotation.y = Math.sin(shakeTimer * 28) * 0.22 * Math.max(0, 1 - shakeTimer);
          leftArm.rotation.x  = L(leftArm.rotation.x, 0, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z, 0.18, 0.1);
          rightArm.rotation.x = L(rightArm.rotation.x, 0, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.18, 0.1);

        } else if (st === 'cheer') {
          leftArm.rotation.x  = L(leftArm.rotation.x, -2.5, 0.12);
          leftArm.rotation.z  = L(leftArm.rotation.z, -0.5, 0.12);
          rightArm.rotation.x = L(rightArm.rotation.x, -2.5, 0.12);
          rightArm.rotation.z = L(rightArm.rotation.z,  0.4, 0.12);
          root.position.y += Math.abs(Math.sin(t * 5)) * 0.06;

        } else if (st === 'loading') {
          headGroup.rotation.x = L(headGroup.rotation.x, 0.15 + Math.sin(t * 3) * 0.06, 0.08);
          headGroup.rotation.y = L(headGroup.rotation.y, 0, 0.08);
          leftArm.rotation.x  = L(leftArm.rotation.x, 0, 0.1);
          leftArm.rotation.z  = L(leftArm.rotation.z, 0.18, 0.1);
          rightArm.rotation.x = L(rightArm.rotation.x, 0, 0.1);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.18, 0.1);

        } else {
          // idle
          headGroup.rotation.z = L(headGroup.rotation.z, 0, 0.05);
          const sw = Math.sin(t * 1.5) * 0.025;
          leftArm.rotation.x  = L(leftArm.rotation.x, sw, 0.08);
          leftArm.rotation.z  = L(leftArm.rotation.z, 0.18, 0.08);
          rightArm.rotation.x = L(rightArm.rotation.x, sw, 0.08);
          rightArm.rotation.z = L(rightArm.rotation.z, -0.18, 0.08);
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
