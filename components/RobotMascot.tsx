/**
 * Standard Humanoid Robot Mascot - Premium Edition
 * Built with Three.js Primitives
 * Features: Helmet-style head, Segmented arms, Digital blinking eyes, Cursor tracking, Smooth floating
 */
(function () {
    const container = document.getElementById('mascot-3d-container');
    if (!container) return;

    async function init() {
        const THREE = await import('three');

        // ===== SCENE =====
        const scene = new THREE.Scene();

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

        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        container.appendChild(renderer.domElement);

        // ===== LIGHTS =====
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(5, 5, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const rimLight = new THREE.PointLight(0x4f46e5, 1, 10);
        rimLight.position.set(-2, 2, -2);
        scene.add(rimLight);

        // ===== MATERIALS =====
        const whiteShellMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.15,
            metalness: 0.1,
        });

        const metalJointMat = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            roughness: 0.2,
            metalness: 0.8,
        });

        const visorMat = new THREE.MeshStandardMaterial({
            color: 0x020617,
            roughness: 0.1,
            metalness: 0.5,
        });

        const eyeGlowMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x38bdf8,
            emissiveIntensity: 3,
        });

        const accentMat = new THREE.MeshStandardMaterial({
            color: 0x4f46e5,
            emissive: 0x4f46e5,
            emissiveIntensity: 1,
        });

        // ===== MODEL CONSTRUCTION =====
        const robotRoot = new THREE.Group();
        const bodyGroup = new THREE.Group();
        const headGroup = new THREE.Group();

        // 1. HEAD
        // Main Helmet
        const headBase = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), whiteShellMat);
        headBase.scale.y = 0.95;
        headGroup.add(headBase);

        // Visor/Face Plate
        const visorGeo = new THREE.SphereGeometry(0.2, 32, 32, 0, Math.PI * 0.8, 0, Math.PI * 0.5);
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.rotation.x = Math.PI / 2;
        visor.rotation.y = -Math.PI * 0.4;
        visor.position.set(0, 0, 0.05);
        headGroup.add(visor);

        // Eyes
        const eyeGeo = new THREE.CapsuleGeometry(0.015, 0.04, 4, 8);

        const leftEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
        leftEye.rotation.z = Math.PI / 2;
        leftEye.position.set(-0.07, 0, 0.22);
        headGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo.clone(), eyeGlowMat);
        rightEye.rotation.z = Math.PI / 2;
        rightEye.position.set(0.07, 0, 0.22);
        headGroup.add(rightEye);

        // Ear/Side Detail
        const earGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16);
        const leftEar = new THREE.Mesh(earGeo, metalJointMat);
        leftEar.rotation.z = Math.PI / 2;
        leftEar.position.set(-0.21, 0, 0);
        headGroup.add(leftEar);

        const rightEar = leftEar.clone();
        rightEar.position.set(0.21, 0, 0);
        headGroup.add(rightEar);

        // 2. BODY
        // Torso
        const torsoGeo = new THREE.CapsuleGeometry(0.2, 0.3, 8, 16);
        const torso = new THREE.Mesh(torsoGeo, whiteShellMat);
        torso.position.set(0, -0.35, 0);
        bodyGroup.add(torso);

        // Chest Plate
        const chestGeo = new THREE.BoxGeometry(0.22, 0.15, 0.1);
        const chest = new THREE.Mesh(chestGeo, whiteShellMat);
        chest.position.set(0, -0.28, 0.12);
        bodyGroup.add(chest);

        // Power Core
        const core = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), accentMat);
        core.position.set(0, -0.28, 0.175);
        bodyGroup.add(core);

        // Neck
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1), metalJointMat);
        neck.position.set(0, -0.15, 0);
        bodyGroup.add(neck);

        // 3. ARMS
        function createArm(isLeft) {
            const side = isLeft ? -1 : 1;
            const armGroup = new THREE.Group();

            // Shoulder
            const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.07), whiteShellMat);
            armGroup.add(shoulder);

            // Upper Arm
            const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.15), whiteShellMat);
            upperArm.position.y = -0.1;
            armGroup.add(upperArm);

            // Elbow
            const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.045), metalJointMat);
            elbow.position.y = -0.18;
            armGroup.add(elbow);

            // Forearm
            const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.15), whiteShellMat);
            forearm.position.y = -0.26;
            armGroup.add(forearm);

            // Hand
            const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05), whiteShellMat);
            hand.position.y = -0.34;
            armGroup.add(hand);

            armGroup.position.set(side * 0.28, -0.25, 0);
            return armGroup;
        }

        const leftArm = createArm(true);
        const rightArm = createArm(false);
        bodyGroup.add(leftArm);
        bodyGroup.add(rightArm);

        // ASSEMBLE
        robotRoot.add(headGroup);
        robotRoot.add(bodyGroup);
        robotRoot.position.y = -0.1;
        scene.add(robotRoot);

        // ===== INTERACTION =====
        let mouse = { x: 0, y: 0 };
        document.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // ===== ANIMATION =====
        let time = 0;
        let blinkTimer = 0;
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            time += delta;
            blinkTimer += delta;

            // Tracking
            const targetHeadX = -mouse.y * 0.4;
            const targetHeadY = mouse.x * 0.6;
            headGroup.rotation.x += (targetHeadX - headGroup.rotation.x) * 0.1;
            headGroup.rotation.y += (targetHeadY - headGroup.rotation.y) * 0.1;

            bodyGroup.rotation.y += (mouse.x * 0.2 - bodyGroup.rotation.y) * 0.05;

            // Arms Animation
            leftArm.rotation.z = -0.2 + Math.sin(time * 1.5) * 0.05;
            leftArm.rotation.x = Math.sin(time * 1.2) * 0.1;

            rightArm.rotation.z = 0.2 - Math.sin(time * 1.5) * 0.05;
            rightArm.rotation.x = Math.sin(time * 1.2 + 0.5) * 0.1;

            // Blink
            if (blinkTimer > 3) {
                const s = Math.abs(Math.sin((blinkTimer - 3) * 15));
                if (blinkTimer < 3.2) {
                    leftEye.scale.y = 1 - s;
                    rightEye.scale.y = 1 - s;
                } else {
                    leftEye.scale.y = 1;
                    rightEye.scale.y = 1;
                    blinkTimer = Math.random();
                }
            }

            // Floating
            robotRoot.position.y = -0.1 + Math.sin(time * 2) * 0.05;
            core.material.emissiveIntensity = 1 + Math.sin(time * 4) * 0.5;

            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    init().catch(console.error);
})();

